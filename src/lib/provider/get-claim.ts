import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";

export async function getOrCreateClaim() {
  const provider = await getProviderAccount();
  if (!provider) return null;

  const supabase = await createProviderSupabaseClient();

  // Find existing draft claim for this provider
  const { data: existing } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) return { provider, claim: existing };

  // Create a new draft claim
  const { data: created, error } = await supabase
    .from("facility_claims")
    .insert({
      provider_id: provider.id,
      facility_id: provider.facility_id,
      status: "pending",
      submission_step: 1,
      completion_pct: 0,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create claim:", error.message);
    return { provider, claim: null };
  }

  return { provider, claim: created };
}
