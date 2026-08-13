"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ensureClaimId } from "@/lib/provider/get-claim";
import { buildFacilityFieldsFromClaim } from "@/lib/provider/facility-field-mapping";

export type Step5Data = {
  entrance_photo_urls: string[];
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
  entrance_photo_urls?: string[] | null;
  logo_url?: string | null;
  license_url?: string | null;
}): number {
  let score = 0;
  if (data.entrance_photo_urls && data.entrance_photo_urls.length > 0) score += ENTRANCE_PHOTO_WEIGHT;
  if (data.logo_url) score += LOGO_WEIGHT;
  if (data.license_url) score += LICENSE_WEIGHT;
  return score;
}

export type AutoSaveResult = { ok: boolean; error?: string };

export async function autoSaveStep5(data: Partial<Step5Data>): Promise<AutoSaveResult> {
  const provider = await getProviderAccount();
  if (!provider) {
    // The caller (Step5MediaForm's autoSave) must not treat this as a
    // successful save — silently no-op'ing here (the previous behavior)
    // is what let uploaded photos/logo look "saved" in the UI while the
    // session was actually invalid and nothing was persisted.
    return { ok: false, error: "Your session has expired. Please log in again to keep saving changes." };
  }

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) return { ok: false, error: "Could not find your draft listing. Please refresh and try again." };

  const { data: currentClaim } = await supabase
    .from("facility_claims")
    .select("proposed_entrance_photo_url, proposed_entrance_photo_urls, proposed_logo_url, proposed_license_url")
    .eq("id", claimId)
    .single();

  const currentEntrancePhotoUrls = Array.isArray(currentClaim?.proposed_entrance_photo_urls)
    ? (currentClaim.proposed_entrance_photo_urls as string[])
    : currentClaim?.proposed_entrance_photo_url
      ? [currentClaim.proposed_entrance_photo_url as string]
      : [];

  const oldScore = scoreStep5({
    entrance_photo_urls: currentEntrancePhotoUrls,
    logo_url: currentClaim?.proposed_logo_url,
    license_url: currentClaim?.proposed_license_url,
  });

  const newScore = scoreStep5({
    entrance_photo_urls:
      data.entrance_photo_urls !== undefined ? data.entrance_photo_urls : currentEntrancePhotoUrls,
    logo_url: data.logo_url !== undefined ? data.logo_url : currentClaim?.proposed_logo_url,
    license_url:
      data.license_url !== undefined ? data.license_url : currentClaim?.proposed_license_url,
  });

  const updates: Record<string, unknown> = {};
  if (data.entrance_photo_urls !== undefined) {
    updates.proposed_entrance_photo_urls = data.entrance_photo_urls;
    // Kept in sync as a legacy fallback for any reader still on the
    // single-URL column (see supabase/migrations_draft/032_*.sql).
    updates.proposed_entrance_photo_url = data.entrance_photo_urls[0] || null;
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

  let updatedClaim: Record<string, unknown> | null = null;
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("facility_claims").update(updates).eq("id", claimId);
    if (error) {
      console.error("autoSaveStep5 failed:", error.message);
      return { ok: false, error: "Save failed — please try again." };
    }
    const { data } = await supabase.from("facility_claims").select("*").eq("id", claimId).single();
    updatedClaim = data ?? null;
  }

  const currentOverallPct = provider.completion_pct ?? 0;
  const nextOverallPct = Math.min(100, Math.max(0, currentOverallPct - oldScore + newScore));

  await supabase
    .from("provider_accounts")
    .update({ completion_pct: nextOverallPct })
    .eq("id", provider.id);

  if (updatedClaim && (updatedClaim.status as string) === "approved" && updatedClaim.facility_id) {
    const toSync = buildFacilityFieldsFromClaim(updatedClaim);
    const { data: syncedRows, error: liveUpdateError } = await supabase
      .from("facilities")
      .update({ ...toSync, updated_at: new Date().toISOString() })
      .eq("id", updatedClaim.facility_id as string)
      .select("id");
    if (liveUpdateError) console.error("autoSaveStep5 live sync failed:", liveUpdateError.message);
    else if (!syncedRows || syncedRows.length === 0) {
      console.error("autoSaveStep5 live sync affected 0 rows — likely blocked by facilities RLS policy", updatedClaim.facility_id);
    }
  }

  return { ok: true };
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
    .select("proposed_entrance_photo_url, proposed_entrance_photo_urls, proposed_logo_url, proposed_license_url")
    .eq("id", claimId)
    .single();

  const currentEntrancePhotoUrls = Array.isArray(currentClaim?.proposed_entrance_photo_urls)
    ? (currentClaim.proposed_entrance_photo_urls as string[])
    : currentClaim?.proposed_entrance_photo_url
      ? [currentClaim.proposed_entrance_photo_url as string]
      : [];

  const oldScore = scoreStep5({
    entrance_photo_urls: currentEntrancePhotoUrls,
    logo_url: currentClaim?.proposed_logo_url,
    license_url: currentClaim?.proposed_license_url,
  });
  const newScore = scoreStep5(data);

  const { error: updateError } = await supabase
    .from("facility_claims")
    .update({
      proposed_entrance_photo_urls: data.entrance_photo_urls,
      proposed_entrance_photo_url: data.entrance_photo_urls[0] || null,
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
