import {
  createProviderSupabaseClient,
  getProviderAccount,
} from "@/lib/supabase/provider-client";

export async function getOrCreateClaim() {
  const provider = await getProviderAccount();
  if (!provider) return null;

  const supabase = await createProviderSupabaseClient();

  // Look for an existing pending claim (deterministic — oldest first)
  const { data: existing } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return { provider, claim: existing };

  // Insert a new draft. If a concurrent request already created one,
  // the unique partial index will reject this — catch and re-fetch.
  const { data: created, error } = await supabase
    .from("facility_claims")
    .insert({
      provider_id: provider.id,
      facility_id: provider.facility_id ?? null,
      status: "pending",
      submission_step: 1,
      completion_pct: 0,
      facility_type: (provider.facility_type as string | null) ?? null,
      diagnostic_subtype: (provider.diagnostic_subtype as string | null) ?? null,
    })
    .select("*")
    .single();

  if (error) {
    // Likely a unique-index conflict from a race — fetch the winner
    const { data: raced } = await supabase
      .from("facility_claims")
      .select("*")
      .eq("provider_id", provider.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (raced) return { provider, claim: raced };
    console.error("Failed to create claim:", error.message);
    return { provider, claim: null };
  }

  return { provider, claim: created };
}

// Shared helper — all step actions use this to locate the claim
export async function findPendingClaimId(
  supabase: Awaited<ReturnType<typeof createProviderSupabaseClient>>,
  providerId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("facility_claims")
    .select("id")
    .eq("provider_id", providerId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("findPendingClaimId error:", error.message);
    return null;
  }
  return data?.id ?? null;
}

// Guarantees a pending claim row exists before a step action reads/writes
// it — the identity/location steps render from getOrCreateClaim, but
// auto-save calls can race ahead of that initial insert, so they fall
// back to creating (or re-fetching, if a concurrent request won the
// unique partial index) the row themselves.
export async function ensureClaimId(
  supabase: Awaited<ReturnType<typeof createProviderSupabaseClient>>,
  providerId: string,
  facilityId: string | null,
): Promise<string | null> {
  const existing = await findPendingClaimId(supabase, providerId);
  if (existing) return existing;

  const { data: providerAccount } = await supabase
    .from("provider_accounts")
    .select("facility_type, diagnostic_subtype")
    .eq("id", providerId)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from("facility_claims")
    .insert({
      provider_id: providerId,
      facility_id: facilityId,
      status: "pending",
      submission_step: 1,
      completion_pct: 0,
      facility_type: (providerAccount?.facility_type as string | null) ?? null,
      diagnostic_subtype: (providerAccount?.diagnostic_subtype as string | null) ?? null,
    })
    .select("id")
    .single();

  if (!error) return created?.id ?? null;

  // Unique-index conflict from a race — fetch the winner
  return findPendingClaimId(supabase, providerId);
}
