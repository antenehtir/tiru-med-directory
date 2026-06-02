import type { VerificationStatus } from "./verification";

export type DoctorTelemedicineStatus = "available" | "planned" | "not-available";

export type Doctor = {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  facility: string;
  location: string;
  availability: string;
  verificationStatus: VerificationStatus;
  telemedicineStatus: DoctorTelemedicineStatus;
  profileInitials: string;
  profileActionLabel: string;
  bookingActionLabel: string;
  detailHref?: string;
};
