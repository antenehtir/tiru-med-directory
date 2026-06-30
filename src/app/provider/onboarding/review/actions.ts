"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ensureClaimId } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";

export async function submitForReview(): Promise<{ error: string } | void> {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) {
    return { error: "Could not find your draft. Please try again." };
  }

  const { data: currentClaim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  const currentPct = currentClaim ? calculateCompletion(currentClaim) : 0;
  if (currentPct < 70) {
    return { error: "Your profile must be at least 70% complete to submit." };
  }

  const { error: updateError } = await supabase
    .from("facility_claims")
    .update({
      status: "pending_review",
      submission_step: 6,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (updateError) {
    console.error("submitForReview update failed:", {
      message: updateError.message,
      code: updateError.code,
      details: updateError.details,
    });
    return {
      error: `Submission failed: ${updateError.message || "Unknown database error"}. If this persists, check that migration 016 (submitted_at column) has been applied in Supabase.`,
    };
  }

  // calculateCompletion() already adds the Step 6 bonus once status is
  // pending_review/approved — no separate "+5" on top of this, that would
  // double-count it.
  try {
    const { data: updatedClaim } = await supabase
      .from("facility_claims")
      .select("*")
      .eq("id", claimId)
      .single();

    const finalPct = Math.min(100, updatedClaim ? calculateCompletion(updatedClaim) : currentPct);

    await supabase
      .from("provider_accounts")
      .update({
        completion_pct: finalPct,
        // onboarding_phase is an integer column — there is no slug mapped to 7
        // in login's phaseToSlug map, so a returning provider naturally falls
        // through to the dashboard instead of back into the onboarding flow.
        onboarding_phase: 7,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", provider.id);
  } catch (err) {
    // provider_accounts update is non-critical — log but don't block the redirect
    console.error("submitForReview: provider_accounts update failed:", err);
  }

  redirect("/provider/onboarding/milestone");
}
