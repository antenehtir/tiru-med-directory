import { Suspense } from "react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminFacilityList } from "@/components/admin/AdminFacilityList";
import { computeFacilityLicenseInfo } from "@/lib/licenses/license-status";
import { getLatestLicenseByFacilityId } from "@/lib/admin/facility-licenses";

async function getFacilities() {
  const supabase = await createAdminSupabaseClient();
  const [{ data, error }, licenseByFacilityId] = await Promise.all([
    supabase
      .from("facilities")
      .select("id, slug, name, category, sub_city, area, verification_status, record_number, phone, working_hours, emergency_service, is_active, deactivation_category, deactivated_at")
      .order("record_number", { ascending: true }),
    getLatestLicenseByFacilityId(),
  ]);

  if (error) return [];

  return (data ?? []).map((facility) => ({
    ...facility,
    licenseInfo: computeFacilityLicenseInfo(licenseByFacilityId.get(facility.id)),
  }));
}

export default async function AdminFacilitiesPage() {
  const facilities = await getFacilities();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Facility Directory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {facilities.length} facilities · manage badges and records
        </p>
      </div>
      <Suspense fallback={null}>
        <AdminFacilityList facilities={facilities} />
      </Suspense>
    </div>
  );
}
