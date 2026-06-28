"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ensureClaimId } from "@/lib/provider/get-claim";

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
  }
}
