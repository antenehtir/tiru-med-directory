"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ensureClaimId } from "@/lib/provider/get-claim";

export type Step5Data = {
  entrance_photo_url: string;
  logo_url: string;
  license_url: string;
  license_issue_date: string;
  license_expiry_date: string;
  business_license_url: string;
  business_license_issue_date: string;
  business_license_expiry_date: string;
};

const ENTRANCE_PHOTO_WEIGHT = 7;
const LOGO_WEIGHT = 4;
const LICENSE_WEIGHT = 4;

function scoreStep5(data: {
  entrance_photo_url?: string | null;
  logo_url?: string | null;
  license_url?: string | null;
}): number {
  let score = 0;
  if (data.entrance_photo_url) score += ENTRANCE_PHOTO_WEIGHT;
  if (data.logo_url) score += LOGO_WEIGHT;
  if (data.license_url) score += LICENSE_WEIGHT;
  return score;
}

export async function autoSaveStep5(data: Partial<Step5Data>) {
  const provider = await getProviderAccount();
  if (!provider) return;

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) return;

  const { data: currentClaim } = await supabase
    .from("facility_claims")
    .select("proposed_entrance_photo_url, proposed_logo_url, proposed_license_url")
    .eq("id", claimId)
    .single();

  const oldScore = scoreStep5({
    entrance_photo_url: currentClaim?.proposed_entrance_photo_url,
    logo_url: currentClaim?.proposed_logo_url,
    license_url: currentClaim?.proposed_license_url,
  });

  const newScore = scoreStep5({
    entrance_photo_url:
      data.entrance_photo_url !== undefined
        ? data.entrance_photo_url
        : currentClaim?.proposed_entrance_photo_url,
    logo_url: data.logo_url !== undefined ? data.logo_url : currentClaim?.proposed_logo_url,
    license_url:
      data.license_url !== undefined ? data.license_url : currentClaim?.proposed_license_url,
  });

  const updates: Record<string, unknown> = {};
  if (data.entrance_photo_url !== undefined) {
    updates.proposed_entrance_photo_url = data.entrance_photo_url || null;
  }
  if (data.logo_url !== undefined) updates.proposed_logo_url = data.logo_url || null;
  if (data.license_url !== undefined) updates.proposed_license_url = data.license_url || null;
  if (data.license_issue_date !== undefined) {
    updates.proposed_license_issue_date = data.license_issue_date || null;
  }
  if (data.license_expiry_date !== undefined) {
    updates.proposed_license_expiry_date = data.license_expiry_date || null;
  }
  if (data.business_license_url !== undefined) {
    updates.proposed_business_license_url = data.business_license_url || null;
  }
  if (data.business_license_issue_date !== undefined) {
    updates.proposed_business_license_issue_date = data.business_license_issue_date || null;
  }
  if (data.business_license_expiry_date !== undefined) {
    updates.proposed_business_license_expiry_date = data.business_license_expiry_date || null;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("facility_claims").update(updates).eq("id", claimId);
    if (error) console.error("autoSaveStep5 failed:", error.message);
  }

  const currentOverallPct = provider.completion_pct ?? 0;
  const nextOverallPct = Math.min(100, Math.max(0, currentOverallPct - oldScore + newScore));

  await supabase
    .from("provider_accounts")
    .update({ completion_pct: nextOverallPct })
    .eq("id", provider.id);
}

export async function saveStep5AndContinue(data: Step5Data) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) {
    console.error("saveStep5AndContinue: could not find or create claim for provider", provider.id);
    redirect("/provider/onboarding/media");
  }

  const { data: currentClaim } = await supabase
    .from("facility_claims")
    .select("proposed_entrance_photo_url, proposed_logo_url, proposed_license_url")
    .eq("id", claimId)
    .single();

  const oldScore = scoreStep5({
    entrance_photo_url: currentClaim?.proposed_entrance_photo_url,
    logo_url: currentClaim?.proposed_logo_url,
    license_url: currentClaim?.proposed_license_url,
  });
  const newScore = scoreStep5(data);

  const { error: updateError } = await supabase
    .from("facility_claims")
    .update({
      proposed_entrance_photo_url: data.entrance_photo_url || null,
      proposed_logo_url: data.logo_url || null,
      proposed_license_url: data.license_url || null,
      proposed_license_issue_date: data.license_issue_date || null,
      proposed_license_expiry_date: data.license_expiry_date || null,
      proposed_business_license_url: data.business_license_url || null,
      proposed_business_license_issue_date: data.business_license_issue_date || null,
      proposed_business_license_expiry_date: data.business_license_expiry_date || null,
      submission_step: 6,
    })
    .eq("id", claimId);

  if (updateError) {
    console.error("saveStep5AndContinue update failed:", updateError.message);
    redirect("/provider/onboarding/media");
  }

  const currentOverallPct = provider.completion_pct ?? 0;
  const nextOverallPct = Math.min(100, Math.max(0, currentOverallPct - oldScore + newScore));

  // phase 6 = review (the step they land on next), matching login's phaseToSlug map
  await supabase
    .from("provider_accounts")
    .update({
      completion_pct: nextOverallPct,
      onboarding_phase: 6,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  redirect("/provider/onboarding/review");
}
