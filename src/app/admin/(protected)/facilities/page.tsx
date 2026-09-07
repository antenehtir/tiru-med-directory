import Link from "next/link";
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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facility Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {facilities.length} facilities · manage badges and records
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          href="/admin/facilities/new"
        >
          <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          </svg>
          New facility
        </Link>
      </div>
      <Suspense fallback={null}>
        <AdminFacilityList facilities={facilities} />
      </Suspense>
    </div>
  );
}
