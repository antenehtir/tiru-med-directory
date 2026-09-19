"use server";

import { revalidatePath } from "next/cache";
import { isMappedFacilityCategory } from "@/lib/frontend-search-filters";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";
import { buildFacilityFieldsFromClaim, filterNonEmpty } from "@/lib/provider/facility-field-mapping";
import { toSlug } from "@/lib/slugify";
import { sendApprovalEmail } from "@/lib/email/send-approval-email";

// Approving a claim on a facility Tiru already lists hands the listing over
// as it is. Nothing from the claim is copied onto it.
//
// This used to merge the claim's proposed_* draft into the live row. With
// the one-step claim there is no draft to merge — and a fresh claim row
// defaults proposed_checkup_offered and proposed_insurance_accepted to
// false, which filterNonEmpty keeps (false is not "empty"), so the merge
// would have switched a facility's live check-ups and insurance off at the
// moment of approval. The live listing is the source of truth; the verified
// provider changes it themselves from here on.
async function markLatestClaimApproved(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  providerId: string,
  facilityId: string,
) {
  const { data: claim } = await supabase
    .from("facility_claims")
    .select("id")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!claim) return;
  await supabase
    .from("facility_claims")
    .update({ status: "approved", facility_id: facilityId })
    .eq("id", claim.id);
}

// How a verification call is written into the audit log, so every approval
// and rejection carries what the facility actually said on the phone.
function callNotesLine(callNotes: string): string {
  const notes = callNotes.trim();
  return notes ? `Call notes: ${notes}` : "Call notes: (none recorded)";
}

export async function approveClaim(
  providerId: string,
  facilityId: string | null,
  callNotes: string,
): Promise<{ warning?: string; error?: string } | void> {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  // Approval rests on the verification call, so the call has to be on record
  // before anything is approved — the audit log keeps it permanently.
  if (!callNotes.trim()) {
    return { error: "Write down what the facility confirmed on the call before approving." };
  }

  const supabase = await createAdminSupabaseClient();

  // One verified manager per facility. The claim form refuses a facility
  // that is already managed, but two claims can be waiting on the same one,
  // and approving both would give two accounts write access to the listing.
  if (facilityId) {
    const { data: existingManager } = await supabase
      .from("provider_accounts")
      .select("id, display_name, email")
      .eq("facility_id", facilityId)
      .eq("status", "approved")
      .neq("id", providerId)
      .limit(1)
      .maybeSingle();
    if (existingManager) {
      return {
        error: `This facility is already managed by ${existingManager.display_name || existingManager.email}. Reject this claim, or remove that account's access first.`,
      };
    }
  }

  // Mark provider verified — runs for both existing-facility and new-listing paths.
  await supabase
    .from("provider_accounts")
    .update({
      verification_status_internal: "verified",
      verification_call_notes: callNotes,
      status: "approved",
      onboarding_phase: 8,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", providerId);

  let approvedFacilityName: string | undefined;

  if (facilityId) {
    // Claiming an existing facility — mark it Facility Managed and hand it
    // over as it stands.
    const { data: facility } = await supabase
      .from("facilities")
      .select("name, verification_status")
      .eq("id", facilityId)
      .single();
    approvedFacilityName = facility?.name;

    // Ownership is tracked via provider_accounts.facility_id (set when the
    // provider selected this facility) — facilities.claimed_by is a separate
    // FK to admin_users and isn't used for provider self-service claims.
    await supabase
      .from("facilities")
      .update({ verification_status: "facility-owned" })
      .eq("id", facilityId);

    await supabase.from("audit_log").insert({
      admin_id: admin.id,
      action: "approve_claim",
      entity_type: "facility",
      entity_id: facilityId,
      new_value: { verification_status: "facility-owned" },
      note: `Claim approved for ${facility?.name}. ${callNotesLine(callNotes)}`,
    });

    await markLatestClaimApproved(supabase, providerId, facilityId);
  } else {
    // New listing — provider submitted data for a facility not yet in the DB.
    // Find the submitted claim, create a facilities row from it, then wire
    // provider_accounts and facility_claims back to the new row.
    const { data: claim } = await supabase
      .from("facility_claims")
      .select("*")
      .eq("provider_id", providerId)
      .eq("status", "pending_review")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!claim) {
      console.error("approveClaim: no pending_review claim for new listing", { providerId });
      return { error: "No submitted claim found for this provider. Cannot complete approval." };
    }

    const proposedName = (claim.proposed_name as string | null) ?? "";
    if (!proposedName) {
      return { error: "Claim has no facility name — cannot create a facilities record." };
    }

    // Generate a URL-safe slug; append a short suffix if the base slug is taken.
    const rawSlug = toSlug(proposedName);
    const baseSlug = rawSlug || `new-facility-${(claim.id as string).slice(0, 8)}`;
    const { data: slugConflict } = await supabase
      .from("facilities")
      .select("id")
      .eq("slug", baseSlug)
      .maybeSingle();
    const slug = slugConflict
      ? `${baseSlug}-${(claim.id as string).slice(0, 6)}`
      : baseSlug;

    // A claim carries the provider-chosen facility_type, which is written
    // straight through as facilities.category below. If that value is not in
    // FACILITY_CATEGORY_DB_MAP the row publishes but resolves to "default",
    // so it never appears under any category filter — invisible to browse and
    // to the homepage discovery chips, with nothing surfacing the problem.
    // That is exactly how the live "Hospital" / "Telemedicine" /
    // "Healthcare Financing" rows got there.
    //
    // Signup now only offers canonical values plus "Other", so this should
    // only trigger for "Other" or a legacy claim. Rather than guess a
    // category (any guess is wrong and permanent), abort the approval.
    //
    // The claim is deliberately LEFT at pending_review rather than flipped to
    // approved. Approving it while no facilities row exists would tell the
    // provider they are live while they are absent from the directory —
    // the same silent invisibility this guard exists to prevent, just moved
    // somewhere harder to notice. pending_review is the status the admin
    // claims queue lists (src/app/admin/(protected)/claims/page.tsx), so the
    // claim stays visible and actionable until someone assigns a real
    // category, and the provider correctly still reads as under review.
    const claimCategory = (claim.facility_type as string | null) ?? null;
    if (!isMappedFacilityCategory(claimCategory)) {
      return {
        warning:
          `Not approved — this claim needs a category first. ` +
          `"${claimCategory ?? "(none)"}" is not one of the listed categories` +
          (claim.facility_type_other ? ` (provider described it as "${claim.facility_type_other as string}")` : "") +
          `. Set a supported category on the claim, then approve again. ` +
          `The claim stays in this queue and the provider remains under review.`,
      };
    }

    const filteredFields = filterNonEmpty(buildFacilityFieldsFromClaim(claim));

    // The wording the provider chose for themselves. A signup label that is
    // not a filter bucket — "Medical Complex", "Multi-specialty Center", or
    // anything typed under Other — stores its category as the bucket it
    // belongs in and keeps its real name here. Read from provider_accounts
    // rather than the claim because facility_claims has no column for it, and
    // without this step the listing would silently become a plain "Specialty
    // Center" at the moment of approval.
    const { data: providerAccount } = await supabase
      .from("provider_accounts")
      .select("facility_type_other")
      .eq("id", claim.provider_id as string)
      .maybeSingle();
    const describedAs = (providerAccount?.facility_type_other as string | null)?.trim() || null;

    // Assign the next record_number so the admin Facility Directory shows a #.
    const { data: maxRecord } = await supabase
      .from("facilities")
      .select("record_number")
      .order("record_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextRecordNumber = ((maxRecord?.record_number as number | null) ?? 0) + 1;

    const { data: newFacility, error: insertError } = await supabase
      .from("facilities")
      .insert({
        ...filteredFields,
        name: proposedName,
        slug,
        category: claimCategory as string,
        // Only when the claim carries no subcategory of its own — a provider
        // who described their services in onboarding said something more
        // specific than the category label they picked at signup.
        ...(describedAs && !filteredFields.subcategory ? { subcategory: describedAs } : {}),
        verification_status: "facility-owned",
        record_number: nextRecordNumber,
        updated_at: new Date().toISOString(),
      })
      .select("id, name")
      .single();

    if (insertError || !newFacility) {
      console.error("approveClaim: failed to insert new facility row", insertError?.message);
      // Flip facility_claims anyway so the provider isn't stuck at pending_review.
      await supabase
        .from("facility_claims")
        .update({ status: "approved" })
        .eq("id", claim.id as string);
      return {
        warning: `Approved but facility record creation failed: ${insertError?.message ?? "unknown error"}. Create the facilities row manually in Supabase.`,
      };
    }

    approvedFacilityName = newFacility.name;

    // Link provider_accounts and facility_claims to the new facilities row.
    await supabase
      .from("provider_accounts")
      .update({ facility_id: newFacility.id })
      .eq("id", providerId);

    await supabase
      .from("facility_claims")
      .update({ status: "approved", facility_id: newFacility.id })
      .eq("id", claim.id as string);

    await supabase.from("audit_log").insert({
      admin_id: admin.id,
      action: "claim_approved_new_listing",
      entity_type: "facility",
      entity_id: newFacility.id,
      note: `New facility "${newFacility.name}" (slug: ${slug}) created and approved from provider claim ${claim.id as string}. ${callNotesLine(callNotes)}`,
    });
  }

  // Non-blocking — email failure must never break the approval itself
  const { data: providerData } = await supabase
    .from("provider_accounts")
    .select("email, display_name, facility_name, completion_pct")
    .eq("id", providerId)
    .single();

  if (providerData?.email) {
    sendApprovalEmail({
      to: providerData.email,
      providerName: providerData.display_name || "there",
      facilityName: providerData.facility_name || approvedFacilityName || "your facility",
      // No 70 fallback any more — that number was the old submission
      // threshold, and printing it as a real completion figure survived the
      // threshold itself. 0 is honest when the column is unset.
      completionPct: providerData.completion_pct ?? 0,
      kind: facilityId ? "claim" : "new_listing",
    }).catch((err) => console.error("Approval email error (non-blocking):", err));
  }

  revalidatePath("/admin/claims");
  revalidatePath("/admin");
}

export async function rejectClaim(providerId: string, reason: string, callNotes = "") {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createAdminSupabaseClient();

  await supabase
    .from("provider_accounts")
    .update({
      verification_status_internal: "rejected",
      status: "rejected",
      admin_note: reason,
      ...(callNotes.trim() ? { verification_call_notes: callNotes.trim() } : {}),
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", providerId);

  await supabase.from("audit_log").insert({
    admin_id: admin.id,
    action: "reject_claim",
    entity_type: "provider_account",
    entity_id: providerId,
    note: `Claim rejected: ${reason}. ${callNotesLine(callNotes)}`,
  });

  // Keep the provider's facility_claims row in sync — the Provider
  // Dashboard drives its "rejected" state off facility_claims.status, not
  // provider_accounts.status.
  const { data: claim } = await supabase
    .from("facility_claims")
    .select("id")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (claim) {
    await supabase.from("facility_claims").update({ status: "rejected" }).eq("id", claim.id);
  }

  revalidatePath("/admin/claims");
}

export async function saveCallNotes(providerId: string, notes: string) {
  const admin = await getAdminUser();
  if (!admin) return;

  const supabase = await createAdminSupabaseClient();
  await supabase
    .from("provider_accounts")
    .update({ verification_call_notes: notes })
    .eq("id", providerId);

  revalidatePath("/admin/claims");
}

// A verified provider's request to change a detail on their account (name,
// role or a phone number). Those details are locked once submitted because
// they are what the verification call checked, so only an admin applies the
// change — and the decision is written to the audit log either way.
const ACCOUNT_FIELDS = ["display_name", "claimant_role", "phone", "facility_phone"] as const;

export async function decideAccountChange(
  requestId: string,
  approve: boolean,
  adminNote: string,
): Promise<{ error?: string } | void> {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createAdminSupabaseClient();
  const { data: request } = await supabase
    .from("account_change_requests")
    .select("id, provider_id, field, current_value, requested_value, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!request) return { error: "That request could not be found." };
  if (request.status !== "pending") return { error: "That request has already been decided." };
  const field = request.field as (typeof ACCOUNT_FIELDS)[number];
  if (!ACCOUNT_FIELDS.includes(field)) return { error: "Unknown account detail." };

  if (approve) {
    // The personal number lives in two columns — phone (new-listing signup)
    // and claimant_phone (claims) — so both move together.
    const updates: Record<string, unknown> =
      field === "phone"
        ? { phone: request.requested_value, claimant_phone: request.requested_value }
        : field === "claimant_role"
          ? { claimant_role: request.requested_value, claimant_role_other: null }
          : { [field]: request.requested_value };
    const { error: updateError } = await supabase
      .from("provider_accounts")
      .update(updates)
      .eq("id", request.provider_id as string);
    if (updateError) return { error: `Could not update the account: ${updateError.message}` };
  }

  const { data: decided, error } = await supabase
    .from("account_change_requests")
    .update({
      status: approve ? "approved" : "declined",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      admin_note: adminNote.trim() || null,
    })
    .eq("id", requestId)
    .select("id");
  if (error || !decided?.length) {
    return { error: error?.message ?? "The decision did not save — check your admin permissions." };
  }

  await supabase.from("audit_log").insert({
    admin_id: admin.id,
    action: approve ? "account_change_approved" : "account_change_declined",
    entity_type: "provider_account",
    entity_id: request.provider_id,
    old_value: { [field]: request.current_value },
    new_value: approve ? { [field]: request.requested_value } : null,
    note: `${approve ? "Approved" : "Declined"} change of ${field.replace("_", " ")} from "${request.current_value ?? "—"}" to "${request.requested_value}".${adminNote.trim() ? ` Note: ${adminNote.trim()}` : ""}`,
  });

  revalidatePath("/admin/claims");
}
