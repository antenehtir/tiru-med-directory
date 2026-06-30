import {
  createProviderSupabaseClient,
  getProviderAccount,
} from "@/lib/supabase/provider-client";

export async function getOrCreateClaim() {
  const provider = await getProviderAccount();
  if (!provider) return null;

  const supabase = await createProviderSupabaseClient();

  // Fetch the most recent claim regardless of status.
  // The previous WHERE status = 'pending' filter caused the ghost-claim bug:
  // after submission (status → 'pending_review'), no pending row existed so
  // this function silently created a fresh empty claim on every page load,
  // which zeroed out completion_pct and broke the dashboard display.
  const { data: existing } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return { provider, claim: existing };

  // No claim exists at all — first-time provider. Create the initial draft.
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
    // Concurrent request won the race — re-fetch regardless of status.
    const { data: raced } = await supabase
      .from("facility_claims")
      .select("*")
      .eq("provider_id", provider.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (raced) return { provider, claim: raced };
    console.error("Failed to create claim:", error.message);
    return { provider, claim: null };
  }

  return { provider, claim: created };
}

// Returns the claim id for editable claims (pending or rejected), null for locked ones.
// Flips a rejected claim back to pending on first edit so it re-enters the normal flow.
// Returns null for pending_review/approved — callers must not write to locked claims.
export async function findPendingClaimId(
  supabase: Awaited<ReturnType<typeof createProviderSupabaseClient>>,
  providerId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("facility_claims")
    .select("id, status")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("findPendingClaimId error:", error.message);
    return null;
  }
  if (!data) return null;
  const status = data.status as string;
  if (status === "pending_review" || status === "approved") return null;
  if (status === "rejected") {
    // Provider is re-editing — restore to pending so the claim re-enters the flow.
    await supabase
      .from("facility_claims")
      .update({ status: "pending" })
      .eq("id", data.id as string);
  }
  return (data.id as string) ?? null;
}

// Guarantees an editable claim row exists before a step action reads/writes it.
// Returns null when the claim is locked (pending_review or approved) — step actions
// should treat null as a no-op and return early without writing anything.
export async function ensureClaimId(
  supabase: Awaited<ReturnType<typeof createProviderSupabaseClient>>,
  providerId: string,
  facilityId: string | null,
): Promise<string | null> {
  // Fetch the most recent claim regardless of status — the previous status = 'pending'
  // filter here was a second trigger of the ghost-claim bug: after submission, every
  // step action auto-save call would find nothing and insert a new empty claim.
  const { data: existing } = await supabase
    .from("facility_claims")
    .select("id, status")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const status = existing.status as string;
    if (status === "pending_review" || status === "approved") return null;
    if (status === "rejected") {
      await supabase
        .from("facility_claims")
        .update({ status: "pending" })
        .eq("id", existing.id as string);
    }
    return existing.id as string;
  }

  // No claim at all — create one.
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

  // Unique-index conflict from a race — re-fetch.
  const { data: raced } = await supabase
    .from("facility_claims")
    .select("id, status")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!raced) return null;
  const racedStatus = raced.status as string;
  if (racedStatus === "pending_review" || racedStatus === "approved") return null;
  return raced.id as string;
}
