import { createClient } from "@supabase/supabase-js";

import type {
  Facility,
  FacilityContactChannel,
  FacilityContactChannelType,
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
  services: unknown;
  special_services: unknown;
  logo_url: string | null;
  photo_url: string | null;
  booking_link: string | null;
  instagram: string | null;
  facebook: string | null;
  telegram: string | null;
  latitude: number | null;
  longitude: number | null;
  verification_status: string;
  record_number: number | null;
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
    makeChannel(row.slug, "social", "Telegram", row.telegram, row.telegram ?? ""),
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
    subCity: row.sub_city ?? undefined,
    subCities,
    area: row.area ?? undefined,
  };
}

let cachedFacilities: Facility[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000;

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
