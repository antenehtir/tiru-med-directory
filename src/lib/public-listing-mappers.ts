import type {
  SeedDiagnosticsProvider,
  SeedDoctor,
  SeedFacility,
  SeedLocation,
  SeedPharmacy,
  SeedProviderType,
  SeedService,
  SeedSpecialty,
} from "@/data/seed-types";
import type {
  PublicContactChannel,
  PublicDiagnosticsType,
  PublicLocation,
  PublicProviderCard,
  PublicProviderDetail,
  PublicProviderType,
  PublicProviderVerification,
} from "@/types/public-listings";
import type { VerificationStatus } from "@/types/verification";

const DEFAULT_TEXT = "Details not available yet";
const DEFAULT_LOCATION = "Location not listed";
const DEFAULT_HOURS = "Hours not listed";
const DEFAULT_PRIMARY_ACTION = "View details";
const DEFAULT_SECONDARY_ACTION = "More information";

const providerBasePaths: Record<PublicProviderType, string> = {
  facility: "/facilities",
  doctor: "/doctors",
  pharmacy: "/pharmacies",
  diagnostics: "/diagnostics",
};

const providerDefaultCategoryLabels: Record<PublicProviderType, string> = {
  facility: "Facility",
  doctor: "Doctor",
  pharmacy: "Pharmacy",
  diagnostics: "Diagnostics provider",
};

const verificationLabels: Record<VerificationStatus, string> = {
  verified: "Verified preview",
  pending: "Pending verification",
  "community-submitted": "Community submitted",
};

export function normalizePublicProviderType(
  providerType: SeedProviderType | PublicProviderType | string | undefined,
): PublicProviderType {
  if (
    providerType === "facility" ||
    providerType === "doctor" ||
    providerType === "pharmacy" ||
    providerType === "diagnostics"
  ) {
    return providerType;
  }

  return "facility";
}

export function normalizeCategoryLabel(
  category: string | null | undefined,
  providerType: PublicProviderType,
): string {
  return coercePublicText(category, providerDefaultCategoryLabels[providerType]);
}

export function normalizePublicDiagnosticsType(
  diagnosticsType: string | null | undefined,
): PublicDiagnosticsType {
  if (
    diagnosticsType === "laboratory" ||
    diagnosticsType === "imaging" ||
    diagnosticsType === "mixed"
  ) {
    return diagnosticsType;
  }

  return "mixed";
}

export function coercePublicText(
  value: string | null | undefined,
  fallback = DEFAULT_TEXT,
): string {
  const normalized = value?.trim();

  return normalized ? normalized : fallback;
}

export function coercePublicList(
  values: readonly string[] | null | undefined,
): string[] {
  if (!values) {
    return [];
  }

  return values
    .map((value) => value.trim())
    .filter((value, index, list) => value && list.indexOf(value) === index);
}

export function normalizePublicSlug(
  value: string | null | undefined,
  fallbackId: string,
): string {
  const source = coercePublicText(value, fallbackId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return source || fallbackId;
}

export function getPublicProviderDetailPath(input: {
  id: string;
  slug?: string | null;
  providerType: PublicProviderType;
}): string {
  const routeSlug = normalizePublicSlug(input.slug, input.id);

  if (
    input.providerType === "facility" ||
    input.providerType === "doctor" ||
    input.providerType === "pharmacy"
  ) {
    return `${providerBasePaths[input.providerType]}/${routeSlug}`;
  }

  return providerBasePaths[input.providerType];
}

export function mapSeedLocationToPublicLocation(
  location: SeedLocation | undefined,
  fallbackName = DEFAULT_LOCATION,
): PublicLocation {
  if (!location) {
    return {
      name: fallbackName,
      displayName: fallbackName,
    };
  }

  return {
    id: location.id,
    slug: location.slug,
    name: coercePublicText(location.name, fallbackName),
    displayName: coercePublicText(location.displayName, fallbackName),
    locationType: location.locationType,
  };
}

export function mapSeedServiceToPublicLabel(service: SeedService): string {
  return coercePublicText(service.name);
}

export function mapSeedSpecialtyToPublicLabel(
  specialty: SeedSpecialty,
): string {
  return coercePublicText(specialty.name);
}

export function createPublicVerification(input: {
  status: VerificationStatus;
  note?: string;
}): PublicProviderVerification {
  return {
    status: input.status,
    label: verificationLabels[input.status],
    note:
      input.note ??
      "Sample-only trust label. This is not a real verified claim.",
  };
}

export function createPreviewContactChannel(input: {
  id: string;
  label: string | null | undefined;
  value?: string | null;
  type?: PublicContactChannel["type"];
}): PublicContactChannel | null {
  const label = coercePublicText(input.label, "");

  if (!label) {
    return null;
  }

  return {
    id: input.id,
    type: input.type ?? "preview",
    label,
    value: coercePublicText(input.value, label),
    isPublic: true,
  };
}

export function mapSeedFacilityToPublicCard(
  facility: SeedFacility,
): PublicProviderCard {
  return mapFacilityLikeSeedToPublicCard(facility, "facility");
}

export function mapSeedPharmacyToPublicCard(
  pharmacy: SeedPharmacy,
): PublicProviderCard {
  return {
    ...mapFacilityLikeSeedToPublicCard(pharmacy, "pharmacy"),
    pickupPreview: pharmacy.pickupAvailablePreview
      ? "Pickup preview available"
      : "Pickup preview not listed",
    deliveryPreview: pharmacy.deliveryReadyPreview
      ? "Delivery-ready preview"
      : "Delivery preview not listed",
  };
}

export function mapSeedDiagnosticsProviderToPublicCard(
  diagnosticsProvider: SeedDiagnosticsProvider,
): PublicProviderCard {
  return {
    ...mapFacilityLikeSeedToPublicCard(diagnosticsProvider, "diagnostics"),
    diagnosticsType: normalizePublicDiagnosticsType(
      diagnosticsProvider.diagnosticsType,
    ),
  };
}

export function mapSeedDoctorToPublicCard(
  doctor: SeedDoctor,
): PublicProviderCard {
  const providerType: PublicProviderType = "doctor";
  const specialty = coercePublicText(doctor.specialty, "Specialty not listed");
  const facility = coercePublicText(doctor.facility, "");

  return {
    id: doctor.id,
    slug: normalizePublicSlug(doctor.slug, doctor.id),
    name: coercePublicText(doctor.name, "Doctor name not listed"),
    providerType,
    categoryLabel: specialty,
    summary: facility
      ? `${specialty} at ${facility}`
      : `${specialty} profile preview`,
    locationLabel: coercePublicText(doctor.location, DEFAULT_LOCATION),
    verificationStatus: doctor.verificationStatus,
    listingHref: getPublicProviderDetailPath({
      id: doctor.id,
      slug: doctor.slug,
      providerType,
    }),
    primaryActionLabel: coercePublicText(
      doctor.profileActionLabel,
      DEFAULT_PRIMARY_ACTION,
    ),
    secondaryActionLabel: coercePublicText(
      doctor.bookingActionLabel,
      DEFAULT_SECONDARY_ACTION,
    ),
    services: [],
    specialties: [specialty],
    affiliations: facility ? [facility] : [],
    availabilityPreview: coercePublicText(
      doctor.availability,
      "Availability not listed",
    ),
    telemedicinePreview: mapTelemedicinePreview(doctor.telemedicineStatus),
  };
}

export function mapSeedFacilityToPublicDetail(
  facility: SeedFacility,
  options: PublicDetailMapOptions = {},
): PublicProviderDetail {
  return mapFacilityLikeSeedToPublicDetail(facility, "facility", options);
}

export function mapSeedPharmacyToPublicDetail(
  pharmacy: SeedPharmacy,
  options: PublicDetailMapOptions = {},
): PublicProviderDetail {
  return {
    ...mapFacilityLikeSeedToPublicDetail(pharmacy, "pharmacy", options),
    pickupPreview: pharmacy.pickupAvailablePreview
      ? "Pickup preview available"
      : "Pickup preview not listed",
    deliveryPreview: pharmacy.deliveryReadyPreview
      ? "Delivery-ready preview"
      : "Delivery preview not listed",
  };
}

export function mapSeedDiagnosticsProviderToPublicDetail(
  diagnosticsProvider: SeedDiagnosticsProvider,
  options: PublicDetailMapOptions = {},
): PublicProviderDetail {
  return {
    ...mapFacilityLikeSeedToPublicDetail(
      diagnosticsProvider,
      "diagnostics",
      options,
    ),
    diagnosticsType: normalizePublicDiagnosticsType(
      diagnosticsProvider.diagnosticsType,
    ),
  };
}

export function mapSeedDoctorToPublicDetail(
  doctor: SeedDoctor,
  options: PublicDetailMapOptions = {},
): PublicProviderDetail {
  const card = mapSeedDoctorToPublicCard(doctor);
  const location = mapSeedLocationToPublicLocation(
    options.locationsById?.[doctor.locationId],
    card.locationLabel,
  );

  return {
    ...card,
    description: card.summary,
    location,
    contactChannels: [],
    workingHours: coercePublicText(doctor.availability, DEFAULT_HOURS),
    verification: createPublicVerification({
      status: doctor.verificationStatus,
      note: doctor.verificationNote,
    }),
    relatedProviderIds: [...doctor.affiliatedFacilityIds],
    correctionHref: `/corrections?listing=${card.slug}`,
  };
}

type FacilityLikeSeed = SeedFacility | SeedPharmacy | SeedDiagnosticsProvider;

type PublicDetailMapOptions = {
  locationsById?: Record<string, SeedLocation | undefined>;
};

function mapFacilityLikeSeedToPublicCard(
  provider: FacilityLikeSeed,
  providerType: PublicProviderType,
): PublicProviderCard {
  return {
    id: provider.id,
    slug: normalizePublicSlug(provider.slug, provider.id),
    name: coercePublicText(provider.name, "Provider name not listed"),
    providerType,
    categoryLabel: normalizeCategoryLabel(provider.category, providerType),
    summary: coercePublicText(provider.subcategory),
    locationLabel: coercePublicText(provider.location, DEFAULT_LOCATION),
    verificationStatus: provider.verificationStatus,
    listingHref: getPublicProviderDetailPath({
      id: provider.id,
      slug: provider.slug,
      providerType,
    }),
    primaryActionLabel: coercePublicText(
      provider.contactActionLabel,
      DEFAULT_PRIMARY_ACTION,
    ),
    secondaryActionLabel: coercePublicText(
      provider.directionsActionLabel,
      DEFAULT_SECONDARY_ACTION,
    ),
    services: coercePublicList(provider.services),
    specialties: [],
    affiliations: [],
    availabilityPreview: coercePublicText(provider.availabilityNote),
    hoursPreview: coercePublicText(provider.workingHours, DEFAULT_HOURS),
  };
}

function mapFacilityLikeSeedToPublicDetail(
  provider: FacilityLikeSeed,
  providerType: PublicProviderType,
  options: PublicDetailMapOptions,
): PublicProviderDetail {
  const card = mapFacilityLikeSeedToPublicCard(provider, providerType);
  const location = mapSeedLocationToPublicLocation(
    options.locationsById?.[provider.locationId],
    card.locationLabel,
  );
  const contactChannels = [
    createPreviewContactChannel({
      id: `${provider.id}-primary-action`,
      label: provider.contactActionLabel,
      type: "preview",
    }),
    createPreviewContactChannel({
      id: `${provider.id}-directions-action`,
      label: provider.directionsActionLabel,
      value: provider.address,
      type: "directions",
    }),
  ].filter((channel): channel is PublicContactChannel => Boolean(channel));

  return {
    ...card,
    description: `${card.summary}. ${card.services.length > 0 ? `Services include ${card.services.join(", ")}.` : DEFAULT_TEXT}`,
    location,
    address: coercePublicText(provider.address, undefined),
    contactChannels,
    workingHours: coercePublicText(provider.workingHours, DEFAULT_HOURS),
    verification: createPublicVerification({
      status: provider.verificationStatus,
      note: provider.verificationNote,
    }),
    relatedProviderIds: [],
    correctionHref: `/corrections?listing=${card.slug}`,
  };
}

function mapTelemedicinePreview(
  status: SeedDoctor["telemedicineStatus"],
): string {
  if (status === "available") {
    return "Telemedicine preview available";
  }

  if (status === "planned") {
    return "Telemedicine planned";
  }

  return "Telemedicine not listed";
}
