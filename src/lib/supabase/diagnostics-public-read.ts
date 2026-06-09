import { seedDiagnostics } from "@/data";
import {
  coercePublicList,
  coercePublicText,
  getPublicProviderDetailPath,
  mapSeedDiagnosticsProviderToPublicCard,
  normalizeCategoryLabel,
  normalizePublicDiagnosticsType,
  normalizePublicSlug,
} from "@/lib/public-listing-mappers";
import type {
  PublicDiagnosticsType,
  PublicProviderCard,
} from "@/types/public-listings";
import type { VerificationStatus } from "@/types/verification";

import {
  getSupabasePublicClient,
  getSupabasePublicClientStatus,
} from "./public-client";

const DIAGNOSTICS_PUBLIC_SELECT = [
  "id",
  "slug",
  "display_name",
  "diagnostic_provider_type",
  "category",
  "description",
  "city",
  "area",
  "address_public",
  "landmark_public",
  "services_public",
  "sample_collection_modes",
  "opening_hours_public",
  "result_turnaround_public",
  "appointment_required_preview",
  "walk_in_available",
  "home_sample_collection_preview",
  "listing_status",
  "visibility_status",
  "verification_status",
  "last_confirmed_at",
].join(", ");

type SupabaseDiagnosticsListingStatus =
  | "draft"
  | "pending"
  | "active"
  | "rejected"
  | "archived"
  | "suspended";

type SupabaseDiagnosticsVisibilityStatus = "public" | "hidden" | "internal";

type SupabaseDiagnosticsVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "disputed"
  | "expired";

type SupabaseDiagnosticsPublicRow = {
  id: string;
  slug: string;
  display_name: string;
  diagnostic_provider_type: string;
  category: string | null;
  description: string | null;
  city: string | null;
  area: string | null;
  address_public: string | null;
  landmark_public: string | null;
  services_public: string[] | null;
  sample_collection_modes: string[] | null;
  opening_hours_public: string | null;
  result_turnaround_public: string | null;
  appointment_required_preview: boolean;
  walk_in_available: boolean;
  home_sample_collection_preview: boolean;
  listing_status: SupabaseDiagnosticsListingStatus;
  visibility_status: SupabaseDiagnosticsVisibilityStatus;
  verification_status: SupabaseDiagnosticsVerificationStatus;
  last_confirmed_at: string | null;
};

type DiagnosticsPublicReadUnavailableReason =
  | "missing-env"
  | "client-unavailable";

type DiagnosticsPublicReadErrorReason = "query-failed";

type DiagnosticsPublicReadSafeErrorCode =
  | "DIAGNOSTICS_PUBLIC_READ_FAILED"
  | "DIAGNOSTICS_PUBLIC_NETWORK_OR_FETCH_FAILED"
  | "DIAGNOSTICS_PUBLIC_PERMISSION_DENIED"
  | "DIAGNOSTICS_PUBLIC_SCHEMA_UNAVAILABLE"
  | "DIAGNOSTICS_PUBLIC_COLUMN_MISMATCH";

export type DiagnosticsPublicReadResult =
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
      reason: DiagnosticsPublicReadUnavailableReason;
      missingKeys: string[];
      message: string;
    }
  | {
      status: "error";
      source: "static-fallback";
      cards: PublicProviderCard[];
      fallbackRecommended: true;
      reason: DiagnosticsPublicReadErrorReason;
      errorCode: DiagnosticsPublicReadSafeErrorCode;
      message: string;
    };

export async function getSupabasePublicDiagnosticsCards(): Promise<DiagnosticsPublicReadResult> {
  const fallbackCards = getStaticDiagnosticsFallbackCards();
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
        "Supabase public listing environment is unavailable. Static diagnostics data was returned.",
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
        "Supabase public client is unavailable. Static diagnostics data was returned.",
    };
  }

  const { data, error } = await client
    .from("diagnostic_providers")
    .select(DIAGNOSTICS_PUBLIC_SELECT)
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
      errorCode: getSafeDiagnosticsPublicReadErrorCode(error),
      message:
        "Supabase diagnostics public read failed. Static diagnostics data was returned.",
    };
  }

  const rows = (data ?? []) as unknown as SupabaseDiagnosticsPublicRow[];

  return {
    status: "success",
    source: "supabase",
    cards: rows.map(mapSupabaseDiagnosticsRowToPublicCard),
    fallbackRecommended: false,
  };
}

function getStaticDiagnosticsFallbackCards(): PublicProviderCard[] {
  return seedDiagnostics.map(mapSeedDiagnosticsProviderToPublicCard);
}

function mapSupabaseDiagnosticsRowToPublicCard(
  row: SupabaseDiagnosticsPublicRow,
): PublicProviderCard {
  const providerType = "diagnostics";
  const slug = normalizePublicSlug(row.slug, row.id);
  const categoryLabel = normalizeCategoryLabel(
    row.category ?? createDiagnosticsProviderTypeLabel(row.diagnostic_provider_type),
    providerType,
  );
  const sampleCollectionModes = coercePublicList(row.sample_collection_modes);

  return {
    id: row.id,
    slug,
    name: coercePublicText(row.display_name, "Diagnostics provider name not listed"),
    providerType,
    categoryLabel,
    summary: coercePublicText(
      row.description,
      "Diagnostics provider details not listed",
    ),
    locationLabel: createLocationLabel(row),
    verificationStatus: mapSupabaseDiagnosticsVerificationStatus(
      row.verification_status,
    ),
    listingHref: getPublicProviderDetailPath({
      id: row.id,
      slug,
      providerType,
    }),
    primaryActionLabel: "Contact preview",
    secondaryActionLabel: "Location preview",
    services: coercePublicList(row.services_public).map(createPublicListLabel),
    specialties: [],
    affiliations: [],
    availabilityPreview: createAvailabilityPreview(row, sampleCollectionModes),
    diagnosticsType: mapSupabaseDiagnosticsProviderType(
      row.diagnostic_provider_type,
    ),
    hoursPreview: coercePublicText(
      row.opening_hours_public,
      "Hours not listed",
    ),
  };
}

function createDiagnosticsProviderTypeLabel(providerType: string): string {
  const labels: Record<string, string> = {
    laboratory: "Laboratory",
    imaging_center: "Imaging Center",
    radiology_center: "Radiology Center",
    pathology_service: "Pathology Service",
    mixed_diagnostic_center: "Mixed Diagnostic Center",
    facility_diagnostic_department: "Facility Diagnostic Department",
    home_sample_collection_provider: "Home Sample Collection",
  };

  return labels[providerType] ?? providerType.replaceAll("_", " ");
}

function mapSupabaseDiagnosticsProviderType(
  providerType: string,
): PublicDiagnosticsType {
  if (providerType === "laboratory" || providerType === "pathology_service") {
    return "laboratory";
  }

  if (
    providerType === "imaging_center" ||
    providerType === "radiology_center"
  ) {
    return "imaging";
  }

  return normalizePublicDiagnosticsType("mixed");
}

function createPublicListLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function createLocationLabel(row: SupabaseDiagnosticsPublicRow): string {
  const locationParts = [row.area, row.city]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return locationParts.length > 0
    ? locationParts.join(", ")
    : "Location not listed";
}

function createAvailabilityPreview(
  row: SupabaseDiagnosticsPublicRow,
  sampleCollectionModes: string[],
): string {
  const parts = [
    ...sampleCollectionModes.map(createPublicListLabel),
    row.walk_in_available ? "Walk-in preview available" : "",
    row.appointment_required_preview ? "Appointment preview required" : "",
    row.home_sample_collection_preview
      ? "Home sample collection preview available"
      : "",
    coercePublicText(row.result_turnaround_public, ""),
    row.last_confirmed_at ? "Listing confirmation date available" : "",
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0
    ? parts.join(" · ")
    : "Sample collection and turnaround details not listed";
}

function mapSupabaseDiagnosticsVerificationStatus(
  status: SupabaseDiagnosticsVerificationStatus,
): VerificationStatus {
  if (status === "verified") {
    return "verified";
  }

  if (status === "pending") {
    return "pending";
  }

  return "community-submitted";
}

function getSafeDiagnosticsPublicReadErrorCode(
  error: unknown,
): DiagnosticsPublicReadSafeErrorCode {
  const text = getSafeErrorSearchText(error);

  if (
    text.includes("fetch failed") ||
    text.includes("failed to fetch") ||
    text.includes("network")
  ) {
    return "DIAGNOSTICS_PUBLIC_NETWORK_OR_FETCH_FAILED";
  }

  if (text.includes("permission denied")) {
    return "DIAGNOSTICS_PUBLIC_PERMISSION_DENIED";
  }

  if (text.includes("could not find") || text.includes("schema cache")) {
    return "DIAGNOSTICS_PUBLIC_SCHEMA_UNAVAILABLE";
  }

  if (text.includes("column")) {
    return "DIAGNOSTICS_PUBLIC_COLUMN_MISMATCH";
  }

  return "DIAGNOSTICS_PUBLIC_READ_FAILED";
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
