"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ensureClaimId } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { syncToFacilityIfApproved } from "@/lib/provider/facility-field-mapping";
import { resolveCategoryChoice } from "@/lib/frontend-search-filters";

export async function saveStep1(formData: FormData) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();

  const name = formData.get("name") as string;
  const altName = formData.get("alt_name") as string;
  const ownershipType = formData.get("ownership_type") as string;
  const branchCount = formData.get("branch_count") as string;
  const description = formData.get("description") as string;
  const languages = formData.getAll("languages") as string[];
  const patientGroups = formData.getAll("patient_groups") as string[];

  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) {
    console.error("saveStep1: could not find or create claim for provider", provider.id);
    redirect("/provider/onboarding/identity");
  }

  const { error: updateError } = await supabase
    .from("facility_claims")
    .update({
      proposed_name: name || null,
      proposed_alt_name: altName || null,
      proposed_ownership_type: ownershipType || null,
      proposed_branch_count: branchCount ? parseInt(branchCount, 10) : null,
      proposed_description: description || null,
      proposed_languages: languages.length > 0 ? languages : null,
      proposed_patient_groups: patientGroups.length > 0 ? patientGroups : null,
      submission_step: 2,
    })
    .eq("id", claimId);

  if (updateError) {
    console.error("saveStep1 update failed:", updateError.message);
    redirect("/provider/onboarding/identity");
  }

  const { data: updatedClaim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (updatedClaim) {
    const completionPct = calculateCompletion(updatedClaim);
    await supabase
      .from("provider_accounts")
      .update({ completion_pct: completionPct })
      .eq("id", provider.id);
  }

  // phase 2 = location (the step they land on next), matching login's phaseToSlug map
  await supabase
    .from("provider_accounts")
    .update({
      onboarding_phase: 2,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  redirect("/provider/onboarding/location");
}

export async function autoSaveStep1(data: {
  name?: string;
  alt_name?: string;
  ownership_type?: string;
  branch_count?: number | null;
  description?: string;
  languages?: string[];
  patient_groups?: string[];
}) {
  const provider = await getProviderAccount();
  if (!provider) return;

  const supabase = await createProviderSupabaseClient();

  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) return;

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.proposed_name = data.name || null;
  if (data.alt_name !== undefined) updates.proposed_alt_name = data.alt_name || null;
  if (data.ownership_type !== undefined) updates.proposed_ownership_type = data.ownership_type || null;
  if (data.branch_count !== undefined) updates.proposed_branch_count = data.branch_count;
  if (data.description !== undefined) updates.proposed_description = data.description || null;
  if (data.languages !== undefined) updates.proposed_languages = data.languages.length > 0 ? data.languages : null;
  if (data.patient_groups !== undefined) updates.proposed_patient_groups = data.patient_groups.length > 0 ? data.patient_groups : null;

  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from("facility_claims")
    .update(updates)
    .eq("id", claimId);

  if (error) {
    console.error("autoSaveStep1 failed:", error.message);
    return;
  }

  const { data: updatedClaim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (updatedClaim) {
    const completionPct = calculateCompletion(updatedClaim);
    await supabase
      .from("provider_accounts")
      .update({ completion_pct: completionPct })
      .eq("id", provider.id);

    // name is deliberately withheld from the live sync once a listing is
    // public — syncToFacilityIfApproved excludes it unconditionally for
    // exactly this reason. A facility's name is the one thing on the page a
    // random search result is trusted by, and letting it change with no
    // review is a bigger door than "the working hours were wrong for an
    // hour". requestFacilityNameChange below is the only path to it now.
    await syncToFacilityIfApproved(supabase, updatedClaim, { changeNote: "identity details" });
  }
}

// Human-readable "what this facility is called/typed as right now", read
// from the live facilities row when one exists (the source of truth once a
// listing is public) and falling back to the claim's own draft before that.
async function currentFacilityFacts(
  supabase: Awaited<ReturnType<typeof createProviderSupabaseClient>>,
  facilityId: string | null,
  claim: Record<string, unknown> | null,
): Promise<{ name: string; category: string | null }> {
  if (facilityId) {
    const { data } = await supabase.from("facilities").select("name, category").eq("id", facilityId).single();
    if (data) return { name: data.name as string, category: data.category as string };
  }
  return {
    name: (claim?.proposed_name as string) ?? "",
    category: (claim?.facility_type as string) ?? null,
  };
}

// The one outcome every caller of the two request functions below needs to
// render correctly: "unchanged"/"changed" both mean nothing is pending
// review, "requested" means it is, and "error" means the submission itself
// failed and must NOT be shown as if it succeeded. That last one is the bug
// a silent insert failure produced before this type existed — the UI had no
// way to distinguish "filed a request" from "tried to and couldn't", so a
// permission error on the insert (correction_requests not yet granted to
// `authenticated`, say) read on screen as an ordinary successful save.
type ChangeRequestResult =
  | { status: "changed" }
  | { status: "requested" }
  | { status: "unchanged" }
  | { status: "error"; message: string };

async function submitCorrectionRequest(
  supabase: Awaited<ReturnType<typeof createProviderSupabaseClient>>,
  provider: { email?: string | null; display_name?: string | null; phone?: string | null },
  facilityName: string,
  correctionType: string,
  description: string,
): Promise<ChangeRequestResult> {
  const { error } = await supabase.from("correction_requests").insert({
    provider_name: facilityName,
    correction_type: correctionType,
    description,
    submitter_name: provider.display_name ?? null,
    submitter_contact: provider.email ?? provider.phone ?? "(no contact on file)",
  });
  if (error) {
    console.error(`submitCorrectionRequest (${correctionType}) failed:`, error.message);
    return { status: "error", message: "Could not submit the request. Please try again." };
  }
  return { status: "requested" };
}

// Once a listing is live, its name is no longer something typing into a
// form field changes immediately — it goes through the same admin review
// every anonymous "Suggest a correction" submission already gets (the
// correction_requests table), and only a super admin's own edit in
// AdminFacilityIdentityEditor actually moves the value. Before approval
// there is no live listing yet to protect, so this still writes straight to
// the claim's draft the way every other Step 1 field does.
//
// reason is required, not optional — a super admin deciding whether to
// apply a rename with nothing but "Prime Pediatric Clinic" -> "Something
// Else" and no context is guessing at whether this is a rebrand, a typo
// fix, or someone who does not control the account. The submit button on
// the client side is disabled until this is filled in; this check is the
// same rule enforced again server-side, since a server action is a public
// endpoint regardless of what the button in front of it allows.
export async function requestFacilityNameChange(newName: string, reason: string): Promise<ChangeRequestResult> {
  const provider = await getProviderAccount();
  if (!provider) return { status: "error", message: "You must be signed in." };

  const trimmed = newName.trim();
  const trimmedReason = reason.trim();
  if (!trimmed) return { status: "error", message: "Enter a name." };
  if (!trimmedReason) return { status: "error", message: "A reason is required." };

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) return { status: "error", message: "Could not find your listing." };

  const { data: claim } = await supabase.from("facility_claims").select("*").eq("id", claimId).single();
  const isLive = (claim?.status as string) === "approved" && Boolean(claim?.facility_id);

  if (!isLive) {
    const { error } = await supabase
      .from("facility_claims")
      .update({ proposed_name: trimmed })
      .eq("id", claimId);
    if (error) {
      console.error("requestFacilityNameChange: draft update failed:", error.message);
      return { status: "error", message: "Could not save. Please try again." };
    }
    return { status: "changed" };
  }

  const current = await currentFacilityFacts(supabase, claim!.facility_id as string, claim);
  if (current.name === trimmed) return { status: "unchanged" };

  return submitCorrectionRequest(
    supabase,
    provider,
    current.name,
    "Facility name",
    `Currently listed as: ${current.name || "(none)"}\n\nRequested new name: ${trimmed}\n\nProvider's reason: ${trimmedReason}\n\nSubmitted by the provider through their dashboard.`,
  );
}

// Same review-request treatment as the name, and for the same reason —
// deliberately scoped to the FACILITY_CATEGORY_CHOICES list only, not the
// free-text "Other" path signup also offers: switching to a described-as-
// something-else type is a bigger conversation than a label swap and is
// left for support to handle by hand.
export async function requestFacilityTypeChange(label: string, reason: string): Promise<ChangeRequestResult> {
  const provider = await getProviderAccount();
  if (!provider) return { status: "error", message: "You must be signed in." };

  const choice = resolveCategoryChoice(label);
  if (!choice) {
    console.error("requestFacilityTypeChange: unrecognised facility type", label);
    return { status: "error", message: "That's not a recognised facility type." };
  }

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) return { status: "error", message: "Could not find your listing." };

  const { data: claim } = await supabase.from("facility_claims").select("*").eq("id", claimId).single();
  const isLive = (claim?.status as string) === "approved" && Boolean(claim?.facility_id);

  // A reason only matters once this goes to a human for review — before
  // approval it is still the same free choice signup itself offers, with
  // nobody to explain it to.
  const trimmedReason = reason.trim();
  if (isLive && !trimmedReason) return { status: "error", message: "A reason is required." };

  if (!isLive) {
    // Nothing public to protect yet — this is still the same free choice
    // signup itself offers, just made again before the first approval.
    const { error: accountError } = await supabase
      .from("provider_accounts")
      .update({ facility_type: choice.stores, facility_type_other: choice.describesAs ?? null })
      .eq("id", provider.id);
    if (accountError) {
      console.error("requestFacilityTypeChange: provider_accounts update failed:", accountError.message);
      return { status: "error", message: "Could not save. Please try again." };
    }

    const { error: claimError } = await supabase
      .from("facility_claims")
      .update({ facility_type: choice.stores })
      .eq("id", claimId);
    if (claimError) {
      console.error("requestFacilityTypeChange: facility_claims update failed:", claimError.message);
      return { status: "error", message: "Could not save. Please try again." };
    }
    return { status: "changed" };
  }

  const current = await currentFacilityFacts(supabase, claim!.facility_id as string, claim);
  if (current.category === choice.stores) return { status: "unchanged" };

  return submitCorrectionRequest(
    supabase,
    provider,
    current.name,
    "Facility type",
    `Currently listed as: ${current.category ?? "(none)"}\n\nRequested new type: ${choice.label} (stores as "${choice.stores}")\n\nProvider's reason: ${trimmedReason}\n\nSubmitted by the provider through their dashboard.`,
  );
}
