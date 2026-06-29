export type DoctorEntry = {
  id: string;
  full_name: string;
  title: string;
  role: string;
  role_other: string;
  specialty: string;
  languages: string[];
  available_days: string[];
  available_hours: string;
  appointment_required: boolean;
  bio: string;
};

export const DOCTOR_TITLES = ["Dr.", "Mr.", "Mrs.", "Ms.", "Prof.", "Other"] as const;

export const DOCTOR_ROLES = [
  "General Practitioner",
  "Specialist",
  "Surgeon",
  "Dentist",
  "Nurse",
  "Midwife",
  "Pharmacist",
  "Lab Technician",
  "Physiotherapist",
  "Radiologist",
  "Psychiatrist",
  "Nutritionist",
  "Optometrist",
  "Other",
] as const;

// Roles where a free-text specialty field is meaningful
export const CLINICAL_ROLES_WITH_SPECIALTY = [
  "General Practitioner",
  "Specialist",
  "Surgeon",
  "Dentist",
  "Psychiatrist",
  "Radiologist",
] as const;

export const DOCTOR_LANGUAGES = [
  "Amharic",
  "English",
  "Afaan Oromo",
  "Tigrinya",
  "Somali",
  "Arabic",
  "French",
  "Other",
] as const;

export const DOCTOR_AVAILABLE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function createEmptyDoctor(): DoctorEntry {
  return {
    id: crypto.randomUUID(),
    full_name: "",
    title: "",
    role: "",
    role_other: "",
    specialty: "",
    languages: [],
    available_days: [],
    available_hours: "",
    appointment_required: false,
    bio: "",
  };
}
