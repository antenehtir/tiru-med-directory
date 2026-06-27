"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";

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

  // Find the draft claim
  const { data: claim } = await supabase
    .from("facility_claims")
    .select("id")
    .eq("provider_id", provider.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!claim) redirect("/provider/onboarding/identity");

  await supabase
    .from("facility_claims")
    .update({
      proposed_name: name,
      proposed_alt_name: altName || null,
      proposed_ownership_type: ownershipType || null,
      proposed_branch_count: branchCount ? parseInt(branchCount, 10) : null,
      proposed_description: description || null,
      proposed_languages: languages.length > 0 ? languages : null,
      proposed_patient_groups: patientGroups.length > 0 ? patientGroups : null,
      submission_step: 2,
    })
    .eq("id", claim.id);

  // Update last active
  await supabase
    .from("provider_accounts")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", provider.id);

  redirect("/provider/onboarding/location");
}
