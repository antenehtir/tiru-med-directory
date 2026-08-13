import { createClient } from "@supabase/supabase-js";

import type {
  Facility,
  FacilityAppointmentModality,
  FacilityContactChannel,
  FacilityContactChannelType,
  FacilityDoctor,
  FacilityScheduleRow,
} from "@/types/facility";
import { realFacilities } from "@/data/real-facility-profiles";

type DBFacility = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  sub_city: string | null;
  area: string | null;
  location: string | null;
  phone: string | null;
  phone_2: string | null;
  email: string | null;
  website: string | null;
  maps_link: string | null;
  working_hours: string | null;
  emergency_service: boolean;
  emergency_type: string | null;
  walkin_appointment: string | null;
  appointment_modalities: unknown;
  services: unknown;
  special_services: unknown;
  custom_service_categories: unknown;
  logo_url: string | null;
  photo_url: string | null;
  photo_urls: unknown;
  booking_link: string | null;
  instagram: string | null;
  facebook: string | null;
  telegram: string | null;
  whatsapp: string | null;
  latitude: number | null;
  longitude: number | null;
  verification_status: string;
  record_number: number | null;
  is_active: boolean | null;
  doctors: unknown;
  schedule: unknown;
  payment_methods: unknown;
  insurance_note: string | null;
  patient_groups: unknown;
  updated_at: string | null;
};

function makeChannel(
  slug: string,
  channelType: FacilityContactChannelType,
  label: string,
  value: string | null | undefined,
  href: string,
): FacilityContactChannel | null {
  const v = value?.trim();
  if (!v) return null;
  return {
    id: `${slug}-${label.toLowerCase().replace(/\s+/g, "-")}`,
    channelType,
    label,
    value: v,
    href,
  };
}

function toStringArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return (raw as string[]).filter(Boolean);
  if (typeof raw === "string" && raw.trim())
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function mapDBRowToFacility(row: DBFacility): Facility {
  const contactChannels: FacilityContactChannel[] = [
    makeChannel(row.slug, "phone", "Phone", row.phone, `tel:${(row.phone ?? "").replace(/\s/g, "")}`),
    makeChannel(row.slug, "phone", "Phone 2", row.phone_2, `tel:${(row.phone_2 ?? "").replace(/\s/g, "")}`),
    makeChannel(row.slug, "email", "Email", row.email, `mailto:${row.email ?? ""}`),
    makeChannel(row.slug, "website", "Website", row.website, row.website ?? ""),
    makeChannel(row.slug, "maps", "Google Maps", row.maps_link, row.maps_link ?? ""),
    makeChannel(row.slug, "whatsapp", "WhatsApp", row.whatsapp, ""),
    makeChannel(row.slug, "social", "Telegram", row.telegram, ""),
    makeChannel(row.slug, "social", "Instagram", row.instagram, row.instagram ?? ""),
    makeChannel(row.slug, "social", "Facebook", row.facebook, row.facebook ?? ""),
    makeChannel(row.slug, "appointment", "Booking", row.booking_link, row.booking_link ?? ""),
  ].filter((c): c is FacilityContactChannel => c !== null);

  const rawSubCity = (row.sub_city ?? "").trim().toLowerCase();
  const isMultiOrOnline =
    rawSubCity === "multiple" || rawSubCity === "online" || rawSubCity === "";
  const subCities = isMultiOrOnline
    ? []
    : rawSubCity.split("/").map((s) => s.trim()).filter(Boolean);

  const workingHours = row.working_hours ?? "Contact provider for current hours.";
  const isOpen = workingHours.trim().toLowerCase() === "24/7";

  const services = [
    ...toStringArray(row.services),
    ...toStringArray(row.special_services),
  ].filter(Boolean);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory ?? row.category,
    services: services.length > 0 ? services : [row.category],
    customServiceCategories:
      row.custom_service_categories && typeof row.custom_service_categories === "object"
        ? (row.custom_service_categories as Record<string, string[]>)
        : undefined,
    location:
      [row.area, row.sub_city].filter(Boolean).join(", ") ||
      row.location ||
      "",
    address: "",
    workingHours,
    verificationStatus:
      (row.verification_status as Facility["verificationStatus"]) ??
      "community-submitted",
    isOpen,
    availabilityNote: row.working_hours ?? null,
    contactActionLabel: row.phone ? "Call provider" : "Contact provider",
    directionsActionLabel: row.maps_link ? "Open map" : "View location",
    contactChannels,
    detailHref: `/facilities/${row.slug}`,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    onlineOnly: rawSubCity === "online" ? true : undefined,
    logoUrl: row.logo_url ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    // Falls back to the legacy single-URL column for rows saved before
    // migration 032 (supabase/migrations_draft/032_*.sql) adds photo_urls.
    photoUrls: Array.isArray(row.photo_urls)
      ? (row.photo_urls as string[]).filter(Boolean)
      : row.photo_url
        ? [row.photo_url]
        : [],
    updatedAt: row.updated_at ?? undefined,
    subCity: row.sub_city ?? undefined,
    subCities,
    area: row.area ?? undefined,
    isActive: row.is_active ?? true,
    doctors: Array.isArray(row.doctors) ? (row.doctors as FacilityDoctor[]) : undefined,
    emergencyType: row.emergency_type ?? null,
    walkinAppointment: row.walkin_appointment ?? null,
    appointmentModalities: Array.isArray(row.appointment_modalities)
      ? (row.appointment_modalities as FacilityAppointmentModality[])
      : undefined,
    schedule: Array.isArray(row.schedule) ? (row.schedule as FacilityScheduleRow[]) : undefined,
    paymentMethods: toStringArray(row.payment_methods),
    insuranceNote: row.insurance_note ?? null,
    patientGroups: toStringArray(row.patient_groups),
  };
}

export async function getFacilityBySlug(slug: string): Promise<Facility | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      const { getRealFacilityBySlug } = await import("@/data/real-facility-profiles");
      return getRealFacilityBySlug(slug) ?? null;
    }

    return mapDBRowToFacility(data as DBFacility);
  } catch {
    const { getRealFacilityBySlug } = await import("@/data/real-facility-profiles");
    return getRealFacilityBySlug(slug) ?? null;
  }
}

export async function getSimilarFacilities(
  facility: Facility,
  limit = 3,
): Promise<Facility[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .eq("is_active", true)
      .eq("category", facility.category)
      .neq("slug", facility.slug)
      .limit(limit);

    if (error || !data || data.length === 0) {
      const { getSimilarRealFacilities } = await import("@/data/real-facility-profiles");
      return getSimilarRealFacilities(facility);
    }

    return data.map((row) => mapDBRowToFacility(row as DBFacility));
  } catch {
    const { getSimilarRealFacilities } = await import("@/data/real-facility-profiles");
    return getSimilarRealFacilities(facility);
  }
}

let cachedFacilities: Facility[] | null = null;
let cacheTime = 0;
// Bounds staleness for getFacilitiesFromDB() consumers to match the 60s
// route-level revalidate on listing pages (was 1hr — the root cause of
// listing pages needing manual cache-busting redeploys to show new data).
const CACHE_TTL = 60 * 1000;

export async function getFacilitiesFromDB(): Promise<Facility[]> {
  if (cachedFacilities && Date.now() - cacheTime < CACHE_TTL) {
    return cachedFacilities;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase
      .from("facilities")
      .select("*")
      .eq("is_active", true)
      .order("record_number", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Falling back to static facilities data:", error?.message);
      return realFacilities;
    }

    const mapped = data.map((row) => mapDBRowToFacility(row as DBFacility));
    cachedFacilities = mapped;
    cacheTime = Date.now();
    return mapped;
  } catch (err) {
    console.warn("DB fetch failed, using static fallback:", err);
    return realFacilities;
  }
}
