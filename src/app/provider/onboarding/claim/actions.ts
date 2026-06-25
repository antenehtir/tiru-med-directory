"use server";

import { redirect } from "next/navigation";
import { getProviderAccount, createProviderSupabaseClient } from "@/lib/supabase/provider-client";

export async function claimExistingFacility(facilityId: string) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();

  await supabase
    .from("provider_accounts")
    .update({
      facility_id: facilityId,
      onboarding_phase: 0,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  redirect("/provider/onboarding/phase-1");
}

export async function startNewListing() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  redirect("/provider/onboarding/phase-1");
}
