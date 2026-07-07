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
    "Other",
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
    "Other",
  ],
  "Obstetrics & Gynecology": [
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
    "Pediatric Neurology",
    "Pediatric Oncology",
    "Other",
  ],
  "Psychiatry & Neurology": [
    "General Psychiatry",
    "Child & Adolescent Psychiatry",
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
  Anesthesiology: ["General Anesthesiology", "Pain Management", "Critical Care", "Other"],
  Dermatology: ["General Dermatology", "Dermatopathology", "Cosmetic Dermatology", "Other"],
  Ophthalmology: ["General Ophthalmology", "Retina", "Cornea", "Glaucoma", "Oculoplastics", "Other"],
  ENT: ["General ENT", "Head & Neck Surgery", "Rhinology", "Otology", "Laryngology", "Other"],
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
  "Emergency Medicine": ["General Emergency Medicine", "Trauma", "Critical Care", "Other"],
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
