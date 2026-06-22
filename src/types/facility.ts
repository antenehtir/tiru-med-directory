import type { VerificationStatus } from "./verification";

export type FacilityVerificationStatus = VerificationStatus;

export type FacilityContactChannelType =
  | "phone"
  | "email"
  | "whatsapp"
  | "website"
  | "maps"
  | "social"
  | "appointment";

export type FacilityContactChannel = {
  id: string;
  channelType: FacilityContactChannelType;
  label: string;
  value: string;
  href?: string;
};

export type Facility = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  services: string[];
  location: string;
  address: string;
  workingHours: string;
  verificationStatus: FacilityVerificationStatus;
  isOpen: boolean;
  availabilityNote: string | null;
  contactActionLabel: string;
  directionsActionLabel: string;
  contactChannels?: FacilityContactChannel[];
  detailHref?: string;
  latitude?: number;
  longitude?: number;
  onlineOnly?: boolean;
  logoUrl?: string;
  subCity?: string;
};
