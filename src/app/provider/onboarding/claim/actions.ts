"use server";

import { redirect } from "next/navigation";
import { getProviderAccount, createProviderSupabaseClient } from "@/lib/supabase/provider-client";

export async function selectFacilityToClaim(facilityId: string) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();

  // Store the selected facility but DON'T mark as owned yet
  await supabase
    .from("provider_accounts")
    .update({
      facility_id: facilityId,
      onboarding_phase: 0,
      verification_status_internal: "unverified",
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  redirect("/provider/onboarding/verify");
}

export async function startNewListing() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();

  await supabase
    .from("provider_accounts")
    .update({
      onboarding_phase: 0,
      verification_status_internal: "unverified",
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  redirect("/provider/onboarding/verify");
}
