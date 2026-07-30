import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminClaimsList, type Claim } from "@/components/admin/AdminClaimsList";

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
      provider_accounts (
        id, email, display_name, phone, claimant_role, claimant_role_other,
        claimant_phone, facility_official_phone_claimed, work_email,
        referral_source, verification_status_internal, verification_call_notes,
        facility_name, created_at
      ),
      facilities ( id, name, category, phone, sub_city, area, verification_status )
    `)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  if (error) return [];

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
        facilities: (Array.isArray(row.facilities) ? row.facilities[0] : row.facilities) ?? null,
      };
    })
    .filter((claim): claim is NonNullable<typeof claim> => claim !== null) as Claim[];
}

export default async function AdminClaimsPage() {
  const claims = await getClaims();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Provider Submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review claims on existing facilities and new facility listing requests
        </p>
      </div>
      <AdminClaimsList claims={claims} />
    </div>
  );
}
