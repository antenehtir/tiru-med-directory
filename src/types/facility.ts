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

export type FacilityScheduleRow = {
  days: string[];
  open: string;
  close: string;
  closed: boolean;
};

// Alias kept for backward compat with FacilityDoctor.available_schedule
export type FacilityDoctorScheduleRow = FacilityScheduleRow;

export type FacilityDoctor = {
  id: string;
  full_name: string;
  title: string;
  role: string;
  role_other: string;
  specialty: string;
  subspecialty: string;
  languages: string[];
  available_schedule: FacilityDoctorScheduleRow[];
  appointment_required: boolean;
  bio: string;
  photo_url: string;
};

export type FacilityAppointmentModality = {
  type: "phone" | "telegram" | "whatsapp" | "online" | "in_person";
  label: string;
  value: string;
};

// Field names (including the snake_case maps_link) match the shape the
// onboarding repeater has always saved into facility_claims.proposed_branches
// and, on approval, facilities.branches — kept as-is here rather than
// translated to camelCase, the same way FacilityDoctor's nested JSON fields
// (full_name, available_schedule) are left in their stored shape.
export type FacilityBranch = {
  name: string;
  area: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  maps_link: string;
  phone: string;
};

export type Facility = {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  services: string[];
  /** Category-tagged custom "other" service entries, keyed the same way as
   *  onboarding's customInputs (e.g. "basiclab-Basic Blood Workup", "general").
   *  See supabase/migrations_draft/035_custom_service_categories.sql. */
  customServiceCategories?: Record<string, string[]>;
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
  photoUrl?: string;
  /** Up to 4 gallery photos; photoUrl mirrors the first entry for back-compat. */
  photoUrls?: string[];
  updatedAt?: string;
  subCity?: string;
  subCities: string[];
  area?: string;
  isActive?: boolean;
  doctors?: FacilityDoctor[];
  emergencyType?: string | null;
  walkinAppointment?: string | null;
  appointmentModalities?: FacilityAppointmentModality[];
  schedule?: FacilityScheduleRow[];
  paymentMethods?: string[];
  insuranceNote?: string | null;
  patientGroups?: string[];
  /** Additional locations beyond the primary one — the entry-count a
   *  provider chose during onboarding (2, "more than 6", etc.), one less
   *  than the number of physical branches since the primary location isn't
   *  repeated here. Undefined/0 means a single-location facility. */
  branchCount?: number;
  branches?: FacilityBranch[];
};
