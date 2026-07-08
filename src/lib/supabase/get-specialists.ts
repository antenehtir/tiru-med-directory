import { createClient } from "@supabase/supabase-js";
import { toSlug } from "@/lib/slugify";
import type { DoctorEntry, DoctorScheduleRow } from "@/lib/provider/doctor-types";

export type SpecialistListItem = {
  id: string;
  slug: string;
  fullName: string;
  title: string;
  role: string;
  specialty: string;
  subspecialty: string;
  photoUrl: string | null;
  languages: string[];
  appointmentRequired: boolean;
  facilityId: string;
  facilityName: string;
  facilitySlug: string;
  facilityCategory: string;
  facilityArea: string;
  facilitySubCity: string;
  facilityPhone: string;
  facilityBadge: string;
  facilityLatitude: number | null;
  facilityLongitude: number | null;
};

export type SpecialistDetail = SpecialistListItem & {
  bio: string;
  availableSchedule: DoctorScheduleRow[];
  facilityEmail: string | null;
  facilityWebsite: string | null;
  facilityWhatsapp: string | null;
  facilityTelegram: string | null;
  facilityMapsLink: string | null;
};

type DBFacilityRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  area: string | null;
  sub_city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  telegram: string | null;
  maps_link: string | null;
  latitude: number | null;
  longitude: number | null;
  verification_status: string;
  doctors: unknown;
};

const FACILITY_SELECT =
  "id, slug, name, category, area, sub_city, phone, email, website, whatsapp, telegram, maps_link, latitude, longitude, verification_status, doctors";

function flattenFacilityDoctors(row: DBFacilityRow): SpecialistDetail[] {
  const doctors = Array.isArray(row.doctors) ? (row.doctors as DoctorEntry[]) : [];

  return doctors
    .filter((doctor) => doctor?.full_name?.trim())
    .map((doctor) => {
      const idFragment = (doctor.id ?? "").slice(0, 6);
      const slug = `${toSlug(doctor.full_name)}-${row.slug}-${idFragment}`;
      const role =
        doctor.role === "Other" && doctor.role_other ? doctor.role_other : (doctor.role ?? "");

      return {
        id: doctor.id,
        slug,
        fullName: doctor.full_name,
        title: doctor.title ?? "",
        role,
        specialty: doctor.specialty ?? "",
        subspecialty: doctor.subspecialty ?? "",
        photoUrl: doctor.photo_url || null,
        languages: Array.isArray(doctor.languages) ? doctor.languages : [],
        appointmentRequired: Boolean(doctor.appointment_required),
        facilityId: row.id,
        facilityName: row.name,
        facilitySlug: row.slug,
        facilityCategory: row.category,
        facilityArea: row.area ?? "",
        facilitySubCity: row.sub_city ?? "",
        facilityPhone: row.phone ?? "",
        facilityBadge: row.verification_status ?? "community-submitted",
        bio: doctor.bio ?? "",
        availableSchedule: Array.isArray(doctor.available_schedule)
          ? doctor.available_schedule
          : [],
        facilityEmail: row.email ?? null,
        facilityWebsite: row.website ?? null,
        facilityWhatsapp: row.whatsapp ?? null,
        facilityTelegram: row.telegram ?? null,
        facilityMapsLink: row.maps_link ?? null,
        facilityLatitude: row.latitude ?? null,
        facilityLongitude: row.longitude ?? null,
      };
    });
}

// Same in-memory-cache-with-TTL pattern as getFacilitiesFromDB() in
// get-facilities.ts — doctors aren't in their own table, so every request
// would otherwise re-flatten every active facility's doctors jsonb column.
let cachedSpecialists: SpecialistDetail[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000;

async function fetchAllSpecialists(): Promise<SpecialistDetail[]> {
  if (cachedSpecialists && Date.now() - cacheTime < CACHE_TTL) {
    return cachedSpecialists;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase
      .from("facilities")
      .select(FACILITY_SELECT)
      .eq("is_active", true)
      .not("doctors", "is", null);

    if (error || !data) {
      console.warn("Failed to fetch specialists:", error?.message);
      return cachedSpecialists ?? [];
    }

    const flattened = (data as DBFacilityRow[]).flatMap(flattenFacilityDoctors);
    cachedSpecialists = flattened;
    cacheTime = Date.now();
    return flattened;
  } catch (err) {
    console.warn("Specialists fetch failed:", err);
    return cachedSpecialists ?? [];
  }
}

export async function getAllSpecialists(): Promise<SpecialistListItem[]> {
  return fetchAllSpecialists();
}

export async function getSpecialistBySlug(slug: string): Promise<SpecialistDetail | null> {
  const specialists = await fetchAllSpecialists();
  return specialists.find((specialist) => specialist.slug === slug) ?? null;
}
