import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminClaimsList, type Claim } from "@/components/admin/AdminClaimsList";

async function getClaims(): Promise<Claim[]> {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("provider_accounts")
    .select(`
      id, email, display_name, phone, claimant_role, claimant_role_other,
      claimant_phone, facility_official_phone_claimed, work_email,
      referral_source, verification_status_internal, verification_call_notes,
      facility_id, created_at,
      facilities ( id, name, category, phone, sub_city, area, verification_status )
    `)
    .in("verification_status_internal", ["call_pending", "unverified"])
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((row) => ({
    ...row,
    facilities: (Array.isArray(row.facilities) ? row.facilities[0] : row.facilities) ?? null,
  })) as Claim[];
}

export default async function AdminClaimsPage() {
  const claims = await getClaims();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Claim Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify provider claims by calling the facility&apos;s official number
        </p>
      </div>
      <AdminClaimsList claims={claims} />
    </div>
  );
}
