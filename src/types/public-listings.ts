import type { VerificationStatus } from "./verification";

export type PublicProviderType =
  | "facility"
  | "doctor"
  | "pharmacy"
  | "diagnostics";

export type PublicDiagnosticsType = "laboratory" | "imaging" | "mixed";

export type PublicContactChannelType =
  | "phone"
  | "directions"
  | "website"
  | "email"
  | "preview";

export type PublicContactChannel = {
  id: string;
  type: PublicContactChannelType;
  label: string;
  value: string;
  href?: string;
  isPublic: true;
};

export type PublicLocation = {
  id?: string;
  slug?: string;
  name: string;
  displayName: string;
  locationType?: "country" | "city" | "area";
};

export type PublicProviderVerification = {
  status: VerificationStatus;
  label: string;
  note: string;
};

export type PublicProviderCard = {
  id: string;
  slug: string;
  name: string;
  providerType: PublicProviderType;
  categoryLabel: string;
  summary: string;
  locationLabel: string;
  verificationStatus: VerificationStatus;
  listingHref: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  services: string[];
  specialties: string[];
  affiliations: string[];
  availabilityPreview?: string;
  telemedicinePreview?: string;
  pickupPreview?: string;
  deliveryPreview?: string;
  diagnosticsType?: PublicDiagnosticsType;
  hoursPreview?: string;
};

export type PublicProviderDetail = PublicProviderCard & {
  description: string;
  location: PublicLocation;
  address?: string;
  contactChannels: PublicContactChannel[];
  workingHours: string;
  verification: PublicProviderVerification;
  relatedProviderIds: string[];
  correctionHref: string;
};
