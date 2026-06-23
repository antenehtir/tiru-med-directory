import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminFacilityList } from "@/components/admin/AdminFacilityList";

async function getFacilities() {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("facilities")
    .select("id, slug, name, category, sub_city, area, verification_status, record_number, phone, working_hours, emergency_service")
    .order("record_number", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export default async function AdminFacilitiesPage() {
  const facilities = await getFacilities();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facility Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {facilities.length} facilities · manage badges and records
          </p>
        </div>
        <Link
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          href="/admin"
        >
          ← Dashboard
        </Link>
      </div>
      <AdminFacilityList facilities={facilities} />
    </div>
  );
}
