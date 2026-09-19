"use server";

import { revalidatePath } from "next/cache";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ensureClaimId } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";

export type OnboardingStepKey = "identity" | "location" | "services" | "doctors" | "media";

// What "Clear entries" empties on each step: exactly the draft fields that
// step saves. The facility's name and type are not here — they come from
// sign-up and the listing cannot exist without them. Photos are only
// detached from the draft; the uploaded files are left in storage.
const STEP_FIELDS: Record<OnboardingStepKey, string[]> = {
  identity: [
    "proposed_alt_name",
    "proposed_ownership_type",
    "proposed_branch_count",
    "proposed_description",
    "proposed_languages",
    "proposed_patient_groups",
  ],
  location: [
    "proposed_sub_city",
    "proposed_area",
    "proposed_landmark",
    "proposed_building_desc",
    "proposed_access_notes",
    "proposed_latitude",
    "proposed_longitude",
    "proposed_maps_link",
    "proposed_branches",
    "proposed_phone",
    "proposed_phone_2",
    "proposed_whatsapp",
    "proposed_telegram",
    "proposed_email",
    "proposed_website",
    "proposed_instagram",
    "proposed_facebook",
    "proposed_tiktok",
    "proposed_linkedin",
    "proposed_youtube",
  ],
  services: [
    "proposed_services",
    "proposed_custom_service_categories",
    "proposed_category_data",
    "proposed_working_days",
    "proposed_working_hours",
    "proposed_schedule",
    "proposed_closed_on_public_holidays",
    "proposed_emergency_type",
    "proposed_walkin_appointment",
    "proposed_appointment_modalities",
    "proposed_booking_link",
    "proposed_checkup_offered",
    "proposed_checkup_pdf_url",
    "proposed_checkup_packages",
    "proposed_checkup_note",
    "proposed_payment_methods",
    "proposed_insurance_accepted",
    "proposed_insurance_note",
    "proposed_bed_count",
  ],
  doctors: ["proposed_doctors"],
  media: ["proposed_entrance_photo_url", "proposed_entrance_photo_urls", "proposed_logo_url"],
};

export type ClearStepResult = { ok: true } | { ok: false; error: string };

// Empties one onboarding step of the provider's own draft. Only a draft that
// is still being written can be cleared — not one under review, and not a
// live listing, which is edited in the listing editor instead.
export async function clearOnboardingStep(step: OnboardingStepKey): Promise<ClearStepResult> {
  const fields = STEP_FIELDS[step];
  if (!fields) return { ok: false, error: "Unknown step." };

  const provider = await getProviderAccount();
  if (!provider) return { ok: false, error: "Your session has expired. Please sign in again." };

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) return { ok: false, error: "Could not find your draft listing." };

  const { data: claim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("id", claimId)
    .single();
  if (claim?.status === "pending_review" || claim?.status === "approved") {
    return { ok: false, error: "This listing has been submitted, so its answers can't be cleared here." };
  }

  // Back to what a fresh draft holds: empty, except the yes/no flags (a new
  // draft starts at false) and the branch count (a single location).
  const FRESH_DRAFT_VALUES: Record<string, unknown> = {
    proposed_branch_count: 1,
    proposed_checkup_offered: false,
    proposed_insurance_accepted: false,
  };
  // Only columns this database has: a field added by a migration that has
  // not run yet would otherwise fail the whole update.
  const updates = Object.fromEntries(
    fields
      .filter((field) => !claim || field in claim)
      .map((field) => [field, field in FRESH_DRAFT_VALUES ? FRESH_DRAFT_VALUES[field] : null]),
  );
  const { data: updated, error } = await supabase
    .from("facility_claims")
    .update(updates)
    .eq("id", claimId)
    .select("*");

  if (error || !updated || updated.length === 0) {
    console.error("clearOnboardingStep failed:", error?.message ?? "no row updated");
    return { ok: false, error: "The step could not be cleared. Please try again." };
  }

  await supabase
    .from("provider_accounts")
    .update({ completion_pct: calculateCompletion(updated[0]) })
    .eq("id", provider.id);

  revalidatePath("/provider", "layout");
  return { ok: true };
}
