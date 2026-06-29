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
  available_days: string[];
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

export const MEDICAL_SPECIALTIES: Record<string, string[]> = {
  "Internal Medicine": [
    "General Internal Medicine",
    "Cardiology",
    "Endocrinology",
    "Gastroenterology",
    "Hematology",
    "Infectious Disease",
    "Nephrology",
    "Oncology",
    "Pulmonology",
    "Rheumatology",
  ],
  Surgery: [
    "General Surgery",
    "Cardiothoracic Surgery",
    "Colorectal Surgery",
    "Neurosurgery",
    "Orthopedic Surgery",
    "Pediatric Surgery",
    "Plastic Surgery",
    "Urology",
    "Vascular Surgery",
  ],
  "Obstetrics & Gynecology": [
    "General OB/GYN",
    "Maternal-Fetal Medicine",
    "Reproductive Endocrinology",
    "Gynecologic Oncology",
    "Urogynecology",
  ],
  Pediatrics: [
    "General Pediatrics",
    "Neonatology",
    "Pediatric Cardiology",
    "Pediatric Neurology",
    "Pediatric Oncology",
  ],
  "Psychiatry & Neurology": [
    "General Psychiatry",
    "Child & Adolescent Psychiatry",
    "Neurology",
    "Neuropsychiatry",
    "Addiction Medicine",
  ],
  Radiology: [
    "Diagnostic Radiology",
    "Interventional Radiology",
    "Nuclear Medicine",
    "Neuroradiology",
  ],
  Anesthesiology: ["General Anesthesiology", "Pain Management", "Critical Care"],
  Dermatology: ["General Dermatology", "Dermatopathology", "Cosmetic Dermatology"],
  Ophthalmology: ["General Ophthalmology", "Retina", "Cornea", "Glaucoma", "Oculoplastics"],
  ENT: ["General ENT", "Head & Neck Surgery", "Rhinology", "Otology", "Laryngology"],
  Orthopedics: [
    "General Orthopedics",
    "Spine",
    "Sports Medicine",
    "Joint Replacement",
    "Hand Surgery",
  ],
  Dentistry: [
    "General Dentistry",
    "Orthodontics",
    "Periodontics",
    "Endodontics",
    "Oral Surgery",
    "Prosthodontics",
    "Pediatric Dentistry",
  ],
  "Emergency Medicine": ["General Emergency Medicine", "Trauma", "Critical Care"],
  "Family Medicine": ["General Family Medicine", "Geriatrics", "Sports Medicine"],
  Pathology: ["Anatomic Pathology", "Clinical Pathology", "Forensic Pathology"],
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

export const DOCTOR_AVAILABLE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

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
    available_days: [],
    available_schedule: [{ days: [], open: "", close: "", closed: false }],
    appointment_required: false,
    bio: "",
    photo_url: "",
  };
}
