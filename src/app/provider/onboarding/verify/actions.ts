"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";

export async function submitVerification(formData: FormData) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const role = formData.get("claimant_role") as string;
  const roleOther = formData.get("claimant_role_other") as string;
  const claimantPhone = formData.get("claimant_phone") as string;
  const officialPhone = formData.get("facility_official_phone_claimed") as string;
  const workEmail = formData.get("work_email") as string;
  const referral = formData.get("referral_source") as string;

  const supabase = await createProviderSupabaseClient();

  await supabase
    .from("provider_accounts")
    .update({
      claimant_role: role,
      claimant_role_other: role === "Other" ? roleOther : null,
      claimant_phone: claimantPhone,
      facility_official_phone_claimed: officialPhone || null,
      work_email: workEmail || null,
      referral_source: referral || null,
      verification_status_internal: "call_pending",
      onboarding_phase: 1,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  // Continue to onboarding — they can fill profile while verification is pending
  redirect("/provider/onboarding/identity");
}
