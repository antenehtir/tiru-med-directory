import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import {
  computeFacilityLicenseInfo,
  licenseStatusNeedsAttention,
  type FacilityLicenseInfo,
  type LicenseClaimRow,
} from "@/lib/licenses/license-status";

// Licenses live only on facility_claims — facilities has no license columns
// at all (deliberately: facilities is the publicly-readable table, and
// license documents must stay private). Shared by the Facility Directory,
// the admin dashboard's license stat card, and the Compliance view so they
// can't disagree about which claim is "the" current one for a facility.
export async function getLatestLicenseByFacilityId(): Promise<Map<string, LicenseClaimRow>> {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("facility_claims")
    .select(
      "facility_id, created_at, proposed_license_url, proposed_license_issue_date, proposed_license_expiry_date, proposed_business_license_url, proposed_business_license_issue_date, proposed_business_license_expiry_date",
    )
    .not("facility_id", "is", null)
    .order("created_at", { ascending: false });

  const map = new Map<string, LicenseClaimRow>();
  if (error || !data) return map;

  for (const row of data) {
    const facilityId = row.facility_id as string;
    // Already sorted newest-first — first occurrence per facility_id wins.
    if (!map.has(facilityId)) map.set(facilityId, row);
  }
  return map;
}

export type FacilityWithLicenseIssue = {
  id: string;
  slug: string;
  name: string;
  category: string;
  area: string | null;
  sub_city: string | null;
  licenseInfo: FacilityLicenseInfo;
};

// Powers the Compliance view and the dashboard's "License issues" stat
// count — active facilities whose worst license status needs admin
// attention (Expired or Missing).
export async function getFacilitiesWithLicenseIssues(): Promise<FacilityWithLicenseIssue[]> {
  const supabase = await createAdminSupabaseClient();
  const [{ data: facilities, error }, licenseByFacilityId] = await Promise.all([
    supabase
      .from("facilities")
      .select("id, slug, name, category, area, sub_city")
      .eq("is_active", true),
    getLatestLicenseByFacilityId(),
  ]);

  if (error || !facilities) return [];

  return facilities
    .map((facility) => ({
      ...facility,
      licenseInfo: computeFacilityLicenseInfo(licenseByFacilityId.get(facility.id)),
    }))
    .filter((facility) => licenseStatusNeedsAttention(facility.licenseInfo.worst))
    .sort((a, b) => {
      const aExpiry = a.licenseInfo.operating.expiryDate ?? a.licenseInfo.business.expiryDate;
      const bExpiry = b.licenseInfo.operating.expiryDate ?? b.licenseInfo.business.expiryDate;
      if (!aExpiry && !bExpiry) return 0;
      if (!aExpiry) return 1;
      if (!bExpiry) return -1;
      return aExpiry.localeCompare(bExpiry);
    });
}
