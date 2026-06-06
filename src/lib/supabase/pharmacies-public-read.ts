import { seedPharmacies } from "@/data";
import {
  coercePublicList,
  coercePublicText,
  createPublicVerification,
  getPublicProviderDetailPath,
  mapSeedPharmacyToPublicCard,
  normalizeCategoryLabel,
  normalizePublicSlug,
} from "@/lib/public-listing-mappers";
import type {
  PublicProviderCard,
  PublicProviderDetail,
} from "@/types/public-listings";
import type { VerificationStatus } from "@/types/verification";

import {
  getSupabasePublicClient,
  getSupabasePublicClientStatus,
} from "./public-client";

const PHARMACIES_PUBLIC_SELECT = [
  "id",
  "slug",
  "display_name",
  "pharmacy_type",
  "description",
  "city",
  "area",
  "address_public",
  "landmark_public",
  "service_modes",
  "opening_hours_public",
  "delivery_available",
  "pickup_available",
  "accepts_prescription_upload_preview",
  "listing_status",
  "visibility_status",
  "verification_status",
  "last_confirmed_at",
].join(", ");

type SupabasePharmacyListingStatus =
  | "draft"
  | "pending"
  | "active"
  | "rejected"
  | "archived"
  | "suspended";

type SupabasePharmacyVisibilityStatus = "public" | "hidden" | "internal";

type SupabasePharmacyVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "disputed"
  | "expired";

type SupabasePharmacyPublicRow = {
  id: string;
  slug: string;
  display_name: string;
  pharmacy_type: string | null;
  description: string | null;
  city: string | null;
  area: string | null;
  address_public: string | null;
  landmark_public: string | null;
  service_modes: string[] | null;
  opening_hours_public: string | null;
  delivery_available: boolean;
  pickup_available: boolean;
  accepts_prescription_upload_preview: boolean;
  listing_status: SupabasePharmacyListingStatus;
  visibility_status: SupabasePharmacyVisibilityStatus;
  verification_status: SupabasePharmacyVerificationStatus;
  last_confirmed_at: string | null;
};

type PharmaciesPublicReadUnavailableReason =
  | "missing-env"
  | "client-unavailable"
  | "invalid-slug";

type PharmaciesPublicReadErrorReason = "query-failed";

type PharmaciesPublicReadSafeErrorCode =
  | "PHARMACIES_PUBLIC_READ_FAILED"
  | "PHARMACIES_PUBLIC_NETWORK_OR_FETCH_FAILED"
  | "PHARMACIES_PUBLIC_PERMISSION_DENIED"
  | "PHARMACIES_PUBLIC_SCHEMA_UNAVAILABLE"
  | "PHARMACIES_PUBLIC_COLUMN_MISMATCH";

export type PharmaciesPublicReadResult =
  | {
      status: "success";
      source: "supabase";
      cards: PublicProviderCard[];
      fallbackRecommended: false;
    }
  | {
      status: "unavailable";
      source: "static-fallback";
      cards: PublicProviderCard[];
      fallbackRecommended: true;
      reason: PharmaciesPublicReadUnavailableReason;
      missingKeys: string[];
      message: string;
    }
  | {
      status: "error";
      source: "static-fallback";
      cards: PublicProviderCard[];
      fallbackRecommended: true;
      reason: PharmaciesPublicReadErrorReason;
      errorCode: PharmaciesPublicReadSafeErrorCode;
      message: string;
    };

export type PharmacyPublicDetailReadResult =
  | {
      status: "success";
      source: "supabase";
      detail: PublicProviderDetail;
      fallbackRecommended: false;
    }
  | {
      status: "not-found";
      source: "static-fallback";
      detail: null;
      fallbackRecommended: true;
      reason: "not-found";
      message: string;
    }
  | {
      status: "unavailable";
      source: "static-fallback";
      detail: null;
      fallbackRecommended: true;
      reason: PharmaciesPublicReadUnavailableReason;
      missingKeys: string[];
      message: string;
    }
  | {
      status: "error";
      source: "static-fallback";
      detail: null;
      fallbackRecommended: true;
      reason: PharmaciesPublicReadErrorReason;
      errorCode: PharmaciesPublicReadSafeErrorCode;
      message: string;
    };

export async function getSupabasePublicPharmacyCards(): Promise<PharmaciesPublicReadResult> {
  const fallbackCards = getStaticPharmacyFallbackCards();
  const clientStatus = getSupabasePublicClientStatus();

  if (!clientStatus.isAvailable) {
    return {
      status: "unavailable",
      source: "static-fallback",
      cards: fallbackCards,
      fallbackRecommended: true,
      reason: "missing-env",
      missingKeys: clientStatus.missingKeys,
      message:
        "Supabase public listing environment is unavailable. Static pharmacy data was returned.",
    };
  }

  const client = getSupabasePublicClient();

  if (!client) {
    return {
      status: "unavailable",
      source: "static-fallback",
      cards: fallbackCards,
      fallbackRecommended: true,
      reason: "client-unavailable",
      missingKeys: [],
      message:
        "Supabase public client is unavailable. Static pharmacy data was returned.",
    };
  }

  const { data, error } = await client
    .from("pharmacies")
    .select(PHARMACIES_PUBLIC_SELECT)
    .eq("listing_status", "active")
    .eq("visibility_status", "public")
    .order("display_name", { ascending: true });

  if (error) {
    return {
      status: "error",
      source: "static-fallback",
      cards: fallbackCards,
      fallbackRecommended: true,
      reason: "query-failed",
      errorCode: getSafePharmaciesPublicReadErrorCode(error),
      message:
        "Supabase pharmacies public read failed. Static pharmacy data was returned.",
    };
  }

  const rows = (data ?? []) as unknown as SupabasePharmacyPublicRow[];

  return {
    status: "success",
    source: "supabase",
    cards: rows.map(mapSupabasePharmacyRowToPublicCard),
    fallbackRecommended: false,
  };
}

export async function getSupabasePublicPharmacyDetailBySlug(
  slug: string,
): Promise<PharmacyPublicDetailReadResult> {
  const requestedSlug = slug.trim();

  if (!requestedSlug) {
    return {
      status: "unavailable",
      source: "static-fallback",
      detail: null,
      fallbackRecommended: true,
      reason: "invalid-slug",
      missingKeys: [],
      message:
        "Pharmacy detail slug is unavailable. Use not-found handling.",
    };
  }

  const clientStatus = getSupabasePublicClientStatus();

  if (!clientStatus.isAvailable) {
    return {
      status: "unavailable",
      source: "static-fallback",
      detail: null,
      fallbackRecommended: true,
      reason: "missing-env",
      missingKeys: clientStatus.missingKeys,
      message:
        "Supabase public listing environment is unavailable. Use not-found handling for pharmacy detail.",
    };
  }

  const client = getSupabasePublicClient();

  if (!client) {
    return {
      status: "unavailable",
      source: "static-fallback",
      detail: null,
      fallbackRecommended: true,
      reason: "client-unavailable",
      missingKeys: [],
      message:
        "Supabase public client is unavailable. Use not-found handling for pharmacy detail.",
    };
  }

  const { data, error } = await client
    .from("pharmacies")
    .select(PHARMACIES_PUBLIC_SELECT)
    .eq("slug", requestedSlug)
    .eq("listing_status", "active")
    .eq("visibility_status", "public")
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      source: "static-fallback",
      detail: null,
      fallbackRecommended: true,
      reason: "query-failed",
      errorCode: getSafePharmaciesPublicReadErrorCode(error),
      message:
        "Supabase pharmacy detail public read failed. Use not-found handling.",
    };
  }

  if (!data) {
    return {
      status: "not-found",
      source: "static-fallback",
      detail: null,
      fallbackRecommended: true,
      reason: "not-found",
      message:
        "Supabase pharmacy detail was not found as an active public listing. Use not-found handling.",
    };
  }

  return {
    status: "success",
    source: "supabase",
    detail: mapSupabasePharmacyRowToPublicDetail(
      data as unknown as SupabasePharmacyPublicRow,
    ),
    fallbackRecommended: false,
  };
}

function getStaticPharmacyFallbackCards(): PublicProviderCard[] {
  return seedPharmacies.map(mapSeedPharmacyToPublicCard);
}

function mapSupabasePharmacyRowToPublicCard(
  row: SupabasePharmacyPublicRow,
): PublicProviderCard {
  const providerType = "pharmacy";
  const slug = normalizePublicSlug(row.slug, row.id);
  const pharmacyTypeLabel = createPharmacyTypeLabel(row.pharmacy_type);
  const serviceModes = coercePublicList(row.service_modes).map(
    createServiceModeLabel,
  );
  const locationLabel = createLocationLabel(row);

  return {
    id: row.id,
    slug,
    name: coercePublicText(row.display_name, "Pharmacy name not listed"),
    providerType,
    categoryLabel: normalizeCategoryLabel(pharmacyTypeLabel, providerType),
    summary: coercePublicText(row.description, "Pharmacy details not listed"),
    locationLabel,
    verificationStatus: mapSupabasePharmacyVerificationStatus(
      row.verification_status,
    ),
    listingHref: getPublicProviderDetailPath({
      id: row.id,
      slug,
      providerType,
    }),
    primaryActionLabel: "View details",
    secondaryActionLabel: "More information",
    services: serviceModes,
    specialties: [],
    affiliations: [],
    availabilityPreview: createFreshnessLabel(row.last_confirmed_at),
    pickupPreview: row.pickup_available
      ? "Pickup preview available"
      : "Pickup preview not listed",
    deliveryPreview: row.delivery_available
      ? "Delivery preview available"
      : "Delivery preview not listed",
    hoursPreview: coercePublicText(
      row.opening_hours_public,
      "Hours not listed",
    ),
  };
}

function mapSupabasePharmacyRowToPublicDetail(
  row: SupabasePharmacyPublicRow,
): PublicProviderDetail {
  const card = mapSupabasePharmacyRowToPublicCard(row);
  const address = createAddressLabel(row);

  return {
    ...card,
    description: card.summary,
    location: {
      name: card.locationLabel,
      displayName: card.locationLabel,
    },
    address,
    contactChannels: [],
    workingHours: card.hoursPreview ?? "Hours not listed",
    verification: createPublicVerification({
      status: card.verificationStatus,
      note: "Supabase public pharmacy discovery preview. Verification evidence, inventory, prescriptions, orders, payments, and private staff details are not exposed in public reads.",
    }),
    relatedProviderIds: [],
    correctionHref: `/corrections?listing=${card.slug}`,
  };
}

function createPharmacyTypeLabel(pharmacyType: string | null): string {
  if (!pharmacyType) {
    return "Pharmacy";
  }

  const labels: Record<string, string> = {
    retail: "Retail pharmacy",
    hospital_pharmacy: "Hospital pharmacy",
    compounding: "Compounding pharmacy",
    specialty: "Specialty pharmacy",
    wholesale_preview: "Wholesale preview",
    online_preview: "Online pharmacy preview",
  };

  return labels[pharmacyType] ?? pharmacyType.replaceAll("_", " ");
}

function createServiceModeLabel(serviceMode: string): string {
  const labels: Record<string, string> = {
    pickup: "Pickup",
    delivery_preview: "Delivery preview",
    walk_in: "Walk-in",
    phone_inquiry: "Phone inquiry",
    prescription_upload_preview: "Prescription upload preview",
  };

  return labels[serviceMode] ?? serviceMode.replaceAll("_", " ");
}

function createLocationLabel(row: SupabasePharmacyPublicRow): string {
  const locationParts = [row.area, row.city]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return locationParts.length > 0
    ? locationParts.join(", ")
    : "Location not listed";
}

function createAddressLabel(row: SupabasePharmacyPublicRow): string | undefined {
  const addressParts = [row.address_public, row.landmark_public]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return addressParts.length > 0 ? addressParts.join(", ") : undefined;
}

function createFreshnessLabel(lastConfirmedAt: string | null): string {
  return lastConfirmedAt
    ? "Listing confirmation date available"
    : "Listing confirmation not listed";
}

function mapSupabasePharmacyVerificationStatus(
  status: SupabasePharmacyVerificationStatus,
): VerificationStatus {
  if (status === "verified") {
    return "verified";
  }

  if (status === "pending") {
    return "pending";
  }

  return "community-submitted";
}

function getSafePharmaciesPublicReadErrorCode(
  error: unknown,
): PharmaciesPublicReadSafeErrorCode {
  const text = getSafeErrorSearchText(error);

  if (
    text.includes("fetch failed") ||
    text.includes("failed to fetch") ||
    text.includes("network")
  ) {
    return "PHARMACIES_PUBLIC_NETWORK_OR_FETCH_FAILED";
  }

  if (text.includes("permission denied")) {
    return "PHARMACIES_PUBLIC_PERMISSION_DENIED";
  }

  if (text.includes("could not find") || text.includes("schema cache")) {
    return "PHARMACIES_PUBLIC_SCHEMA_UNAVAILABLE";
  }

  if (text.includes("column")) {
    return "PHARMACIES_PUBLIC_COLUMN_MISMATCH";
  }

  return "PHARMACIES_PUBLIC_READ_FAILED";
}

function getSafeErrorSearchText(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "";
  }

  const safeFields = ["message", "details", "hint", "code"] as const;
  const record = error as Partial<Record<(typeof safeFields)[number], unknown>>;

  return safeFields
    .map((field) => record[field])
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}
