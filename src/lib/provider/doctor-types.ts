// Structurally identical to the ScheduleRow type exported by the (client-only)
// ScheduleBuilder component — redefined here so this shared, directive-free
// types file never imports from a "use client" module.
export type DoctorScheduleRow = {
  days: string[];
  open: string;
  close: string;
  closed: boolean;
};

export type DoctorEntry = {
  id: string;
  full_name: string;
  title: string;
  role: string;
  role_other: string;
  specialty: string;
  subspecialty: string;
  languages: string[];
  available_schedule: DoctorScheduleRow[];
  appointment_required: boolean;
  bio: string;
  photo_url: string;
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

// Roles where the specialty/subspecialty picker is meaningful
export const CLINICAL_ROLES = [
  "General Practitioner",
  "Specialist",
  "Surgeon",
  "Dentist",
  "Psychiatrist",
  "Radiologist",
  "Emergency Medicine",
] as const;

// The doctor side of the same vocabulary the facility checklist uses
// (SPECIALTIES in onboarding-config.ts). The two drifted: a hospital ticked
// "Infectious Diseases" while a doctor at that hospital was filed under
// "Infectious Disease", and "Plastic and Reconstructive Surgery" faced
// "Plastic Surgery" — the same field under two names, which no search or
// filter can join back together. Where a term names the same thing on both
// sides it is now spelled the same on both sides, and "&" is written "and"
// throughout to match.
//
// Renaming stored values is safe here and was checked before doing it: the
// live directory holds exactly two doctor records, "Pediatrics" and "General
// Pediatrics", neither of which is renamed.
export const MEDICAL_SPECIALTIES: Record<string, string[]> = {
  "Internal Medicine": [
    "General Internal Medicine",
    "Cardiology",
    "Pulmonology and Critical Care Medicine",
    "Endocrinology",
    "Hematology",
    "Gastroenterology and Hepatology",
    "Infectious Diseases",
    "Nephrology",
    "Oncology",
    "Rheumatology",
    "Other",
  ],
  Surgery: [
    "General Surgery",
    "Cardiothoracic Surgery",
    "Colorectal Surgery",
    "Endocrine and Breast Surgery",
    "Hepatobiliary Surgery",
    "Maxillofacial Surgery",
    "Neurosurgery",
    "Orthopedic Surgery",
    "Pediatric Surgery",
    "Plastic and Reconstructive Surgery",
    "Trauma Surgery",
    "Urology",
    "Vascular Surgery",
    "Other",
  ],
  "Obstetrics and Gynecology": [
    "General OB/GYN",
    "Maternal-Fetal Medicine",
    "Reproductive Endocrinology",
    "Gynecologic Oncology",
    "Urogynecology",
    "Other",
  ],
  Pediatrics: [
    "General Pediatrics",
    "Neonatology",
    "Pediatric Cardiology",
    "Pediatric Infectious Diseases",
    "Pediatric Nephrology",
    "Pediatric Neurology",
    "Pediatric Oncology",
    "Pediatric Surgery",
    "Other",
  ],
  "Psychiatry and Neurology": [
    "General Psychiatry",
    "Child and Adolescent Psychiatry",
    "Neurology",
    "Neuropsychiatry",
    "Addiction Medicine",
    "Other",
  ],
  Radiology: [
    "Diagnostic Radiology",
    "Interventional Radiology",
    "Nuclear Medicine",
    "Neuroradiology",
    "Other",
  ],
  Anesthesiology: ["General Anesthesiology", "Pain Management", "Critical Care Medicine", "Other"],
  Dermatology: ["General Dermatology", "Dermatopathology", "Cosmetic Dermatology", "Other"],
  Ophthalmology: ["General Ophthalmology", "Retina", "Cornea", "Glaucoma", "Oculoplastics", "Other"],
  ENT: ["General ENT", "Head and Neck Surgery", "Rhinology", "Otology", "Laryngology", "Other"],
  Orthopedics: [
    "General Orthopedics",
    "Spine",
    "Sports Medicine",
    "Joint Replacement",
    "Hand Surgery",
    "Other",
  ],
  Dentistry: [
    "General Dentistry",
    "Orthodontics",
    "Periodontics",
    "Endodontics",
    "Oral Surgery",
    "Prosthodontics",
    "Pediatric Dentistry",
    "Other",
  ],
  "Emergency Medicine": ["General Emergency Medicine", "Trauma", "Critical Care Medicine", "Other"],
  "Family Medicine": ["General Family Medicine", "Geriatrics", "Sports Medicine", "Other"],
  Pathology: ["Anatomic Pathology", "Clinical Pathology", "Forensic Pathology", "Other"],
  Other: ["Other (specify)"],
};

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

// Providers sometimes type a title straight into the name field during
// onboarding (e.g. full_name = "Dr Kale-Ab Tesfaye" or "Dr. Kale-Ab Tesfaye")
// in addition to selecting a title from the dropdown — rendering
// "{title} {full_name}" unconditionally then shows "Dr. Dr Kale-Ab Tesfaye".
// This strips any leading title-like prefix from the name field (stored data
// may still carry one from before input normalization was added) before
// comparing it to the selected title, so every display location renders the
// name exactly once regardless of what's already saved.
export function stripDoctorNamePrefix(fullName: string): string {
  const trimmed = fullName?.trim() ?? "";
  return trimmed.replace(/^(dr|doctor|mr|mrs|ms|prof)\.?\s+/i, "").trim();
}

export function formatDoctorDisplayName(title: string, fullName: string): string {
  const trimmedTitle = title?.trim();
  if (!trimmedTitle || trimmedTitle === "Other" || !fullName) return fullName;

  const cleanedName = stripDoctorNamePrefix(fullName);
  if (!cleanedName) return fullName;

  return `${trimmedTitle} ${cleanedName}`;
}

export function createEmptyDoctor(): DoctorEntry {
  return {
    id: crypto.randomUUID(),
    full_name: "",
    title: "",
    role: "",
    role_other: "",
    specialty: "",
    subspecialty: "",
    languages: [],
    available_schedule: [{ days: [], open: "", close: "", closed: false }],
    appointment_required: false,
    bio: "",
    photo_url: "",
  };
}
