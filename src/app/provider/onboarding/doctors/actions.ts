"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ensureClaimId } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { buildFacilityFieldsFromClaim } from "@/lib/provider/facility-field-mapping";
import type { DoctorEntry } from "@/lib/provider/doctor-types";

export async function autoSaveStep4(doctors: DoctorEntry[]) {
  const provider = await getProviderAccount();
  if (!provider) return;

  const supabase = await createProviderSupabaseClient();

  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) return;

  const { error } = await supabase
    .from("facility_claims")
    .update({ proposed_doctors: doctors })
    .eq("id", claimId);

  if (error) {
    console.error("autoSaveStep4 failed:", error.message);
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

    if ((updatedClaim.status as string) === "approved" && updatedClaim.facility_id) {
      const toSync = buildFacilityFieldsFromClaim(updatedClaim);
      const { data: syncedRows, error: liveUpdateError } = await supabase
        .from("facilities")
        .update({ ...toSync, updated_at: new Date().toISOString() })
        .eq("id", updatedClaim.facility_id as string)
        .select("id");
      if (liveUpdateError) console.error("autoSaveStep4 live sync failed:", liveUpdateError.message);
      else if (!syncedRows || syncedRows.length === 0) {
        console.error("autoSaveStep4 live sync affected 0 rows — likely blocked by facilities RLS policy", updatedClaim.facility_id);
      }
    }
  }
}

export async function saveStep4AndContinue(doctors: DoctorEntry[]) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();

  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) {
    console.error("saveStep4AndContinue: could not find or create claim for provider", provider.id);
    redirect("/provider/onboarding/doctors");
  }

  const { error: updateError } = await supabase
    .from("facility_claims")
    .update({
      proposed_doctors: doctors,
      submission_step: 5,
    })
    .eq("id", claimId);

  if (updateError) {
    console.error("saveStep4AndContinue update failed:", updateError.message);
    redirect("/provider/onboarding/doctors");
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

  // phase 5 = media (the step they land on next), matching login's phaseToSlug map
  await supabase
    .from("provider_accounts")
    .update({
      onboarding_phase: 5,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  redirect("/provider/onboarding/media");
}
