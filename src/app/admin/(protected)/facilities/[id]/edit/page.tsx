import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminFacilityEditor } from "@/components/admin/AdminFacilityEditor";

async function getFacility(id: string) {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("facilities")
    .select(
      "id, slug, name, category, verification_status, record_number, services, special_services, custom_service_categories, schedule, working_hours, payment_methods, insurance_note, walkin_appointment, appointment_modalities, emergency_type, phone, phone_2, whatsapp, telegram, email, website, instagram, facebook, tiktok, linkedin, latitude, longitude, maps_link, sub_city, area, branches, branch_count",
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Record<string, unknown>;
}

export default async function AdminFacilityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const facility = await getFacility(id);
  if (!facility) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit facility</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {String(facility.name)} · Services & Specialties and Contact & Social only. Saves write
          directly to the live listing — the CS / Official badge is unaffected.
        </p>
      </div>
      <AdminFacilityEditor facility={facility} />
    </div>
  );
}
