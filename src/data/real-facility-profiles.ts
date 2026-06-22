import type {
  Facility,
  FacilityContactChannel,
  FacilityContactChannelType,
} from "@/types/facility";

import extractedFacilityProfiles from "../../docs/data-intake/simple-facility-profiles/tiru-med-directory-facility-profiles.simple.json";

type ExtractedFacilityProfile = {
  record_number: number;
  name: string;
  category: string;
  specialty_or_services: string;
  special_services: string;
  sub_city: string;
  area: string;
  address: string;
  phone: string;
  hours: string;
  email: string;
  website: string;
  telegram: string;
  whatsapp: string;
  booking: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  google_maps: string;
  raw_text: string;
  extraction_notes: string;
};

type ExtractedFacilityProfilesPayload = {
  records: ExtractedFacilityProfile[];
};

export type RealFacilityProfile = ExtractedFacilityProfile & {
  slug: string;
};

const extractedRecords = (
  extractedFacilityProfiles as ExtractedFacilityProfilesPayload
).records;

// Manually verified coordinates for facilities, keyed by record_number.
// record_number is stable per source record (see docs/data-intake/simple-facility-profiles).
const knownCoordinatesByRecordNumber: Record<
  number,
  { latitude: number; longitude: number }
> = {
  1: { latitude: 9.0054, longitude: 38.7636 }, // Lancet General Hospital (bole)
  2: { latitude: 8.9927, longitude: 38.7468 }, // Silkroad General Hospital (sarbet)
  3: { latitude: 8.9956, longitude: 38.7598 }, // Hallelujah General Hospital (gotera)
  4: { latitude: 9.0089, longitude: 38.7892 }, // Ethio-Istanbul General Hospital (bole)
  5: { latitude: 9.0142, longitude: 38.7401 }, // Amin General Hospital (lideta)
  6: { latitude: 9.0285, longitude: 38.7418 }, // Girum Hospital (addis ketema)
  7: { latitude: 9.0198, longitude: 38.7634 }, // Meqrez General Hospital (kazanchis)
  8: { latitude: 9.0076, longitude: 38.7891 }, // St. Gabriel General Hospital (bole)
  9: { latitude: 9.0081, longitude: 38.7887 }, // Addis Hiwot General Hospital (bole)
  10: { latitude: 9.0156, longitude: 38.8012 }, // MCM Korea Hospital (gerji)
};

// Approximate per-sub-city bounding boxes used to spread out facilities that
// don't have a manually verified coordinate above.
type CoordinateRange = {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
};

const subCityCoordinateRanges: Record<string, CoordinateRange> = {
  bole: { latMin: 9.0, latMax: 9.02, lngMin: 38.78, lngMax: 38.81 },
  kirkos: { latMin: 9.01, latMax: 9.025, lngMin: 38.75, lngMax: 38.78 },
  yeka: { latMin: 9.02, latMax: 9.05, lngMin: 38.79, lngMax: 38.83 },
  arada: { latMin: 9.025, latMax: 9.04, lngMin: 38.74, lngMax: 38.76 },
  lideta: { latMin: 9.01, latMax: 9.025, lngMin: 38.73, lngMax: 38.75 },
  "nifas silk-lafto": { latMin: 8.98, latMax: 9.0, lngMin: 38.74, lngMax: 38.77 },
  "akaki kaliti": { latMin: 8.87, latMax: 8.92, lngMin: 38.78, lngMax: 38.82 },
  "kolfe keranio": { latMin: 9.01, latMax: 9.04, lngMin: 38.7, lngMax: 38.73 },
  gulele: { latMin: 9.04, latMax: 9.07, lngMin: 38.73, lngMax: 38.76 },
  "addis ketema": { latMin: 9.025, latMax: 9.04, lngMin: 38.73, lngMax: 38.75 },
  "lemi kura": { latMin: 9.03, latMax: 9.06, lngMin: 38.81, lngMax: 38.85 },
  "sheger city": { latMin: 8.98, latMax: 9.01, lngMin: 38.85, lngMax: 38.9 },
};

// Aliases / common misspellings found in the source data that map onto a
// sub-city range above.
const subCityAliases: Record<string, string> = {
  kolfe: "kolfe keranio",
  gullele: "gulele",
};

// Used for facilities with no single physical location ("online" or
// "multiple" branches) instead of a sub-city bounding box.
const ADDIS_ABABA_CITY_CENTER = { latitude: 9.0222, longitude: 38.7468 };

const baseSlugCounts = extractedRecords.reduce<Map<string, number>>(
  (counts, record) => {
    const baseSlug = createBaseSlug(record.name, record.record_number);
    counts.set(baseSlug, (counts.get(baseSlug) ?? 0) + 1);
    return counts;
  },
  new Map(),
);

export const realFacilityProfiles: RealFacilityProfile[] = extractedRecords.map(
  (record) => {
    const baseSlug = createBaseSlug(record.name, record.record_number);
    const slug =
      (baseSlugCounts.get(baseSlug) ?? 0) > 1
        ? `${baseSlug}-${record.record_number}`
        : baseSlug;

    return {
      ...record,
      slug,
    };
  },
);

export const realFacilities: Facility[] = realFacilityProfiles.map(
  mapRealFacilityProfileToFacility,
);

const realFacilitiesBySlug = new Map(
  realFacilities.map((facility) => [facility.slug, facility]),
);

export function getRealFacilityBySlug(slug: string): Facility | undefined {
  return realFacilitiesBySlug.get(slug.trim().toLowerCase());
}

export function getSimilarRealFacilities(
  facility: Facility,
  limit = 3,
): Facility[] {
  const sameCategory = realFacilities.filter(
    (candidate) =>
      candidate.slug !== facility.slug && candidate.category === facility.category,
  );
  const otherFacilities = realFacilities.filter(
    (candidate) =>
      candidate.slug !== facility.slug && candidate.category !== facility.category,
  );

  return [...sameCategory, ...otherFacilities].slice(0, limit);
}

function mapRealFacilityProfileToFacility(
  profile: RealFacilityProfile,
): Facility {
  const services = getFacilityServices(profile);
  const location = [profile.area, profile.sub_city].filter(Boolean).join(", ");
  const hasHours = Boolean(profile.hours);
  const hasPhone = Boolean(profile.phone);
  const hasMap = Boolean(profile.google_maps);
  const normalizedSubCity = profile.sub_city.trim().toLowerCase();
  const isOnlineOnly = normalizedSubCity === "online";
  const isMultiBranch = normalizedSubCity === "multiple";
  const coordinates =
    knownCoordinatesByRecordNumber[profile.record_number] ??
    (isOnlineOnly || isMultiBranch
      ? ADDIS_ABABA_CITY_CENTER
      : estimateCoordinatesForFacility(profile));

  return {
    id: `real-facility-${profile.record_number}`,
    name: profile.name,
    slug: profile.slug,
    category: profile.category,
    subcategory: profile.specialty_or_services || profile.category,
    services,
    location: location || profile.address,
    address: profile.address,
    workingHours: hasHours
      ? profile.hours
      : "Contact provider for current hours.",
    verificationStatus: "community-submitted",
    isOpen: profile.hours.trim().toLowerCase() === "24/7",
    availabilityNote: hasHours ? profile.hours : null,
    contactActionLabel: hasPhone ? "Call provider" : "Contact provider",
    directionsActionLabel: hasMap ? "Open map" : "View location",
    contactChannels: createFacilityContactChannels(profile),
    detailHref: `/facilities/${profile.slug}`,
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    onlineOnly: isOnlineOnly ? true : undefined,
    subCity: profile.sub_city || undefined,
  };
}

function resolveSubCityRange(subCity: string): CoordinateRange | undefined {
  const segments = subCity
    .toLowerCase()
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const normalized = subCityAliases[segment] ?? segment;
    const range = subCityCoordinateRanges[normalized];

    if (range) {
      return range;
    }
  }

  return undefined;
}

function estimateCoordinatesForFacility(
  profile: RealFacilityProfile,
): { latitude: number; longitude: number } | undefined {
  const range = resolveSubCityRange(profile.sub_city);

  if (!range) {
    return undefined;
  }

  const latitudeFraction = hashToUnitInterval(`${profile.slug}-lat`);
  const longitudeFraction = hashToUnitInterval(`${profile.slug}-lng`);

  return {
    latitude: roundCoordinate(
      range.latMin + latitudeFraction * (range.latMax - range.latMin),
    ),
    longitude: roundCoordinate(
      range.lngMin + longitudeFraction * (range.lngMax - range.lngMin),
    ),
  };
}

// Deterministic, dependency-free hash so the same facility always lands at
// the same spread-out point within its sub-city range across builds.
function hashToUnitInterval(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return (hash % 10000) / 10000;
}

function roundCoordinate(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function getFacilityServices(profile: RealFacilityProfile): string[] {
  const values = [
    ...splitList(profile.specialty_or_services),
    ...splitList(profile.special_services),
  ];
  const uniqueValues = Array.from(new Set(values));

  return uniqueValues.length > 0 ? uniqueValues : [profile.category];
}

function createFacilityContactChannels(
  profile: RealFacilityProfile,
): FacilityContactChannel[] {
  const channels: FacilityContactChannel[] = [];

  addChannel(channels, profile, "phone", "Phone", profile.phone, getPhoneHref);
  addChannel(channels, profile, "email", "Email", profile.email, getEmailHref);
  addChannel(channels, profile, "website", "Website", profile.website, getWebHref);
  addChannel(
    channels,
    profile,
    "social",
    "Telegram",
    profile.telegram,
    getWebHref,
  );
  addChannel(
    channels,
    profile,
    "whatsapp",
    "WhatsApp",
    profile.whatsapp,
    getWebHref,
  );
  addChannel(
    channels,
    profile,
    "appointment",
    "Booking",
    profile.booking,
    getWebHref,
  );
  addChannel(
    channels,
    profile,
    "social",
    "Facebook",
    profile.facebook,
    getWebHref,
  );
  addChannel(
    channels,
    profile,
    "social",
    "Instagram",
    profile.instagram,
    getWebHref,
  );
  addChannel(
    channels,
    profile,
    "social",
    "TikTok",
    profile.tiktok,
    getWebHref,
  );
  addChannel(
    channels,
    profile,
    "social",
    "LinkedIn",
    profile.linkedin,
    getWebHref,
  );
  addChannel(
    channels,
    profile,
    "maps",
    "Google Maps",
    profile.google_maps,
    getWebHref,
  );

  return channels;
}

function addChannel(
  channels: FacilityContactChannel[],
  profile: RealFacilityProfile,
  channelType: FacilityContactChannelType,
  label: string,
  value: string,
  getHref: (value: string) => string | undefined,
) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return;
  }

  channels.push({
    id: `${profile.slug}-${label.toLowerCase().replace(/\s+/g, "-")}`,
    channelType,
    label,
    value: normalizedValue,
    href: getHref(normalizedValue),
  });
}

function createBaseSlug(name: string, recordNumber: number): string {
  const slug = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `facility-${recordNumber}`;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPhoneHref(value: string): string | undefined {
  const firstPhone = value
    .split(/[\/|,;]/)
    .map((phone) => phone.trim())
    .find(Boolean);

  if (!firstPhone) {
    return undefined;
  }

  const telValue = firstPhone.replace(/[^\d+]/g, "");
  return telValue ? `tel:${telValue}` : undefined;
}

function getEmailHref(value: string): string | undefined {
  return value.includes("@") ? `mailto:${value}` : undefined;
}

function getWebHref(value: string): string | undefined {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^[\w.-]+\.[a-z]{2,}/i.test(value)) {
    return `https://${value}`;
  }

  return undefined;
}
