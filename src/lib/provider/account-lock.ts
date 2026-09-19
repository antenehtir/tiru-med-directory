import type { createProviderSupabaseClient } from "@/lib/supabase/provider-client";

type ProviderClient = Awaited<ReturnType<typeof createProviderSupabaseClient>>;

// Name, role and phone numbers are what the verification call checked. Once
// a provider has submitted for review or been approved, changing them goes
// through an admin (requestAccountChange in the settings actions). Migration 066 enforces the
// same rule in the database.
export async function isAccountLocked(
  supabase: ProviderClient,
  provider: { id: string; status?: string | null },
): Promise<boolean> {
  if (provider.status === "approved") return true;
  const { count } = await supabase
    .from("facility_claims")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", provider.id)
    .eq("status", "pending_review");
  return (count ?? 0) > 0;
}
