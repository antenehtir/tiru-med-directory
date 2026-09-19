import { Suspense } from "react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminClaimsList, type Claim } from "@/components/admin/AdminClaimsList";
import type { AccountChange } from "@/components/admin/AdminAccountChangeList";

// Pending name/role/phone change requests from submitted or verified
// providers. Empty (not an error) until migration 066 creates the table.
async function getAccountChanges(): Promise<AccountChange[]> {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("account_change_requests")
    .select(`
      id, field, current_value, requested_value, reason, created_at,
      provider_accounts ( display_name, email, facility_name )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id as string,
    field: row.field as string,
    current_value: (row.current_value as string | null) ?? null,
    requested_value: row.requested_value as string,
    reason: row.reason as string,
    created_at: row.created_at as string,
    provider:
      ((Array.isArray(row.provider_accounts) ? row.provider_accounts[0] : row.provider_accounts) as AccountChange["provider"]) ??
      null,
  }));
}

// A provider only belongs in this queue once they've actually submitted for
// review (facility_claims.status = 'pending_review') — a provider still
// filling out onboarding has a claim in status 'pending' (draft) and must
// NOT appear here. Previously this queried provider_accounts filtered on
// verification_status_internal, a column that's never set at signup and
// defaults to 'unverified' for the entire onboarding process — so every new
// provider showed up here immediately, before submitting anything.
async function getClaims(): Promise<Claim[]> {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("facility_claims")
    .select(`
      facility_id,
      submitted_at,
      proposed_phone,
      proposed_sub_city,
      proposed_area,
      provider_accounts (
        id, email, display_name, phone, claimant_role, claimant_role_other,
        claimant_phone, facility_official_phone_claimed, facility_phone, work_email,
        referral_source, verification_status_internal, verification_call_notes,
        facility_name, created_at
      ),
      facilities ( id, slug, name, category, phone, sub_city, area, verification_status )
    `)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  if (error) return [];

  // A provider sent back once and submitting again is a different review:
  // the admin should check the thing that was wrong last time first. Every
  // rejection is in the audit log, so that is where the history comes from.
  const providerIds = (data ?? [])
    .map((row) => {
      const provider = Array.isArray(row.provider_accounts) ? row.provider_accounts[0] : row.provider_accounts;
      return provider?.id as string | undefined;
    })
    .filter((id): id is string => Boolean(id));
  const rejections = new Map<string, { count: number; lastReason: string; lastRejectedAt: string }>();
  if (providerIds.length > 0) {
    const { data: rejectedRows } = await supabase
      .from("audit_log")
      .select("entity_id, note, created_at")
      .eq("action", "reject_claim")
      .in("entity_id", providerIds)
      .order("created_at", { ascending: false });
    for (const row of rejectedRows ?? []) {
      const id = row.entity_id as string;
      const existing = rejections.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        rejections.set(id, {
          count: 1,
          lastReason: String(row.note ?? "")
            .replace(/^Claim rejected:\s*/, "")
            .replace(/\s*Call notes:[\s\S]*$/, "")
            .trim(),
          lastRejectedAt: row.created_at as string,
        });
      }
    }
  }

  return (data ?? [])
    .map((row) => {
      const provider = Array.isArray(row.provider_accounts)
        ? row.provider_accounts[0]
        : row.provider_accounts;
      if (!provider) return null;

      return {
        ...provider,
        // facility_claims.facility_id is the canonical source for the
        // Claims-vs-New-Listings split (see AdminClaimsList) — it's set at
        // claim creation for existing-facility claims and stays null for
        // new listings until admin approval creates the facilities row.
        facility_id: row.facility_id,
        submitted_at: row.submitted_at,
        proposed_phone: (row.proposed_phone as string | null) ?? null,
        proposed_sub_city: (row.proposed_sub_city as string | null) ?? null,
        proposed_area: (row.proposed_area as string | null) ?? null,
        resubmission: rejections.get(provider.id as string) ?? null,
        facilities: (Array.isArray(row.facilities) ? row.facilities[0] : row.facilities) ?? null,
      };
    })
    .filter((claim): claim is NonNullable<typeof claim> => claim !== null) as Claim[];
}

export default async function AdminClaimsPage() {
  const [claims, accountChanges] = await Promise.all([getClaims(), getAccountChanges()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Provider Submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review claims on existing facilities and new facility listing requests
        </p>
      </div>
      <Suspense fallback={null}>
        <AdminClaimsList accountChanges={accountChanges} claims={claims} />
      </Suspense>
    </div>
  );
}
