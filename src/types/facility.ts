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
};
