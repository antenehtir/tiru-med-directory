"use server";

import { firstPhoneError } from "@/lib/phone";
import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { loadClaimableFacility, recordClaim } from "@/lib/provider/claim-facility";

// The whole claim, in one step: who you are at the facility, how to reach
// you. Nothing about the facility itself is asked — Tiru already has it, and
// after verification the claimant edits the live listing directly.
export async function submitClaim(formData: FormData) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");
  if (provider.status === "approved" && provider.facility_id) redirect("/provider/listing");
  if (!provider.facility_id) redirect("/provider/onboarding/claim");

  const role = String(formData.get("claimant_role") ?? "").trim();
  const roleOther = String(formData.get("claimant_role_other") ?? "").trim();
  const phone = String(formData.get("claimant_phone") ?? "").trim();
  const workEmail = String(formData.get("work_email") ?? "").trim();

  if (!role || !phone || (role === "Other" && !roleOther)) {
    redirect("/provider/claim?error=missing");
  }
  if (firstPhoneError([{ label: "Phone", value: phone, kind: "personal" }])) {
    redirect("/provider/claim?error=bad_phone");
  }

  const supabase = await createProviderSupabaseClient();
  const claimable = await loadClaimableFacility(supabase, provider.facility_id);
  if (!claimable.ok) redirect(`/provider/claim?error=${claimable.reason}`);

  const { error: accountError } = await supabase
    .from("provider_accounts")
    .update({
      claimant_role: role,
      claimant_role_other: role === "Other" ? roleOther : null,
      claimant_phone: phone,
      work_email: workEmail || null,
      verification_status_internal: "call_pending",
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);
  if (accountError) {
    console.error("submitClaim: provider_accounts update failed:", accountError.message);
    redirect("/provider/claim?error=save_failed");
  }

  const { error } = await recordClaim(
    supabase,
    provider.id,
    claimable.facility.id,
    "pending_review",
    claimable.facility.category,
  );
  if (error) {
    console.error("submitClaim: claim write failed:", error);
    redirect("/provider/claim?error=save_failed");
  }

  redirect("/provider/claim");
}

// Picked the wrong facility. Only possible before approval — an approved
// provider's facility is fixed (and migration 062 enforces that too).
export async function chooseDifferentFacility() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");
  if (provider.status === "approved" && provider.facility_id) redirect("/provider/listing");

  const supabase = await createProviderSupabaseClient();
  await supabase
    .from("provider_accounts")
    .update({ facility_id: null, last_active_at: new Date().toISOString() })
    .eq("id", provider.id);
  // Back to a draft with no facility, so the admin queue stops listing a
  // claim the provider has withdrawn.
  await recordClaim(
    supabase,
    provider.id,
    null,
    "pending",
    (provider.facility_type as string | null) ?? null,
  );

  redirect("/provider/onboarding/claim");
}
