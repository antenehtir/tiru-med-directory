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

// Radiologist and Psychiatrist used to be their own solo entries here,
// alongside — and overlapping — "Specialist": a radiologist or psychiatrist
// picking "Specialist" and then Radiology/Psychiatry as their specialty
// describes the exact same doctor as picking the solo role did, so the same
// person could end up filed two different ways depending on which one a
// provider happened to click. Specialist is the one path now; the specialty
// picker is where Radiology and Psychiatry actually live.
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
    "Rheumatology",
    "Other",
  ],
  // Its own category now rather than a single subspecialty buried inside
  // Internal Medicine — an oncologist is filed under Internal Medicine only
  // by convention, and the subspecialty list already covers Gynecologic and
  // Pediatric Oncology separately, so "Oncology" as internal medicine's own
  // entry answered a narrower question than the specialty actually is.
  Oncology: [
    "Medical Oncology",
    "Radiation Oncology",
    "Surgical Oncology",
    "Gynecologic Oncology",
    "Pediatric Oncology",
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
    "Vascular Surgery",
    "Other",
  ],
  // Same reasoning as Oncology above — urology is its own field in practice,
  // not a subspecialty someone finds by first picking Surgery.
  Urology: [
    "General Urology",
    "Uro-oncology",
    "Pediatric Urology",
    "Andrology",
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
  // Psychiatry and Neurology used to share one category — two different
  // fields (mental health vs. the nervous system) that only look adjacent
  // because "neuro-" shows up in both. A psychiatrist and a neurologist are
  // not interchangeable, and filing both under one label made every
  // neurologist's record say "Psychiatry and Neurology" whether or not they
  // treat a single psychiatric condition.
  Psychiatry: [
    "General Psychiatry",
    "Child and Adolescent Psychiatry",
    "Neuropsychiatry",
    "Addiction Medicine",
    "Other",
  ],
  Neurology: [
    "General Neurology",
    "Epilepsy",
    "Stroke and Vascular Neurology",
    "Movement Disorders",
    "Neuromuscular Disorders",
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

// A patient reads "Specialist" (the role) next to "Pediatrics · General
// Pediatrics" (specialty · subspecialty) as three separate facts to
// reconcile into one idea — what kind of doctor this actually is. This maps
// every subspecialty and top-level specialty in MEDICAL_SPECIALTIES to the
// single natural title a patient would actually use ("General
// Pediatrician"), so the card and detail page can say the one true thing
// instead of the taxonomy's own field names. Curated explicitly rather than
// derived by suffix rule (-ology -> -ologist and similar patterns cover most
// entries but not all — "Pediatrics", "Dentistry", "ENT" and a handful of
// others are irregular, and a wrong guess reads worse than the duplication
// this replaces).
const SPECIALTY_PRACTITIONER_TITLES: Record<string, string> = {
  "Internal Medicine": "Internist",
  "General Internal Medicine": "Internist",
  "Cardiology": "Cardiologist",
  "Pulmonology and Critical Care Medicine": "Pulmonologist",
  "Endocrinology": "Endocrinologist",
  "Hematology": "Hematologist",
  "Gastroenterology and Hepatology": "Gastroenterologist",
  "Infectious Diseases": "Infectious Disease Specialist",
  "Nephrology": "Nephrologist",
  "Rheumatology": "Rheumatologist",

  "Oncology": "Oncologist",
  "Medical Oncology": "Medical Oncologist",
  "Radiation Oncology": "Radiation Oncologist",
  "Surgical Oncology": "Surgical Oncologist",

  "Surgery": "Surgeon",
  "General Surgery": "General Surgeon",
  "Cardiothoracic Surgery": "Cardiothoracic Surgeon",
  "Colorectal Surgery": "Colorectal Surgeon",
  "Endocrine and Breast Surgery": "Endocrine and Breast Surgeon",
  "Hepatobiliary Surgery": "Hepatobiliary Surgeon",
  "Maxillofacial Surgery": "Maxillofacial Surgeon",
  "Neurosurgery": "Neurosurgeon",
  "Orthopedic Surgery": "Orthopedic Surgeon",
  "Pediatric Surgery": "Pediatric Surgeon",
  "Plastic and Reconstructive Surgery": "Plastic Surgeon",
  "Trauma Surgery": "Trauma Surgeon",
  "Vascular Surgery": "Vascular Surgeon",

  "Urology": "Urologist",
  "General Urology": "Urologist",
  "Uro-oncology": "Uro-oncologist",
  "Pediatric Urology": "Pediatric Urologist",
  "Andrology": "Andrologist",

  "Obstetrics and Gynecology": "OB/GYN",
  "General OB/GYN": "OB/GYN",
  "Maternal-Fetal Medicine": "Maternal-Fetal Medicine Specialist",
  "Reproductive Endocrinology": "Reproductive Endocrinologist",
  "Gynecologic Oncology": "Gynecologic Oncologist",
  "Urogynecology": "Urogynecologist",

  "Pediatrics": "Pediatrician",
  "General Pediatrics": "General Pediatrician",
  "Neonatology": "Neonatologist",
  "Pediatric Cardiology": "Pediatric Cardiologist",
  "Pediatric Infectious Diseases": "Pediatric Infectious Disease Specialist",
  "Pediatric Nephrology": "Pediatric Nephrologist",
  "Pediatric Neurology": "Pediatric Neurologist",
  "Pediatric Oncology": "Pediatric Oncologist",

  "Psychiatry": "Psychiatrist",
  "General Psychiatry": "Psychiatrist",
  "Child and Adolescent Psychiatry": "Child and Adolescent Psychiatrist",
  "Neuropsychiatry": "Neuropsychiatrist",
  "Addiction Medicine": "Addiction Medicine Specialist",

  "Neurology": "Neurologist",
  "General Neurology": "Neurologist",
  "Epilepsy": "Epileptologist",
  "Stroke and Vascular Neurology": "Vascular Neurologist",
  "Movement Disorders": "Movement Disorder Specialist",
  "Neuromuscular Disorders": "Neuromuscular Specialist",

  "Radiology": "Radiologist",
  "Diagnostic Radiology": "Diagnostic Radiologist",
  "Interventional Radiology": "Interventional Radiologist",
  "Nuclear Medicine": "Nuclear Medicine Physician",
  "Neuroradiology": "Neuroradiologist",

  "Anesthesiology": "Anesthesiologist",
  "General Anesthesiology": "Anesthesiologist",
  "Pain Management": "Pain Management Specialist",
  "Critical Care Medicine": "Critical Care Specialist",

  "Dermatology": "Dermatologist",
  "General Dermatology": "Dermatologist",
  "Dermatopathology": "Dermatopathologist",
  "Cosmetic Dermatology": "Cosmetic Dermatologist",

  "Ophthalmology": "Ophthalmologist",
  "General Ophthalmology": "Ophthalmologist",
  "Retina": "Retina Specialist",
  "Cornea": "Cornea Specialist",
  "Glaucoma": "Glaucoma Specialist",
  "Oculoplastics": "Oculoplastic Surgeon",

  "ENT": "ENT Specialist",
  "General ENT": "ENT Specialist",
  "Head and Neck Surgery": "Head and Neck Surgeon",
  "Rhinology": "Rhinologist",
  "Otology": "Otologist",
  "Laryngology": "Laryngologist",

  "Orthopedics": "Orthopedic Surgeon",
  "General Orthopedics": "Orthopedic Surgeon",
  "Spine": "Spine Surgeon",
  "Sports Medicine": "Sports Medicine Specialist",
  "Joint Replacement": "Joint Replacement Surgeon",
  "Hand Surgery": "Hand Surgeon",

  "Dentistry": "Dentist",
  "General Dentistry": "Dentist",
  "Orthodontics": "Orthodontist",
  "Periodontics": "Periodontist",
  "Endodontics": "Endodontist",
  "Oral Surgery": "Oral Surgeon",
  "Prosthodontics": "Prosthodontist",
  "Pediatric Dentistry": "Pediatric Dentist",

  "Emergency Medicine": "Emergency Medicine Physician",
  "General Emergency Medicine": "Emergency Medicine Physician",
  "Trauma": "Trauma Specialist",

  "Family Medicine": "Family Physician",
  "General Family Medicine": "Family Physician",
  "Geriatrics": "Geriatrician",

  "Pathology": "Pathologist",
  "Anatomic Pathology": "Anatomic Pathologist",
  "Clinical Pathology": "Clinical Pathologist",
  "Forensic Pathology": "Forensic Pathologist",
};

// "Other" and "Other (specify)" are placeholders, not real answers — a
// provider who picked one either typed something into the follow-up field
// (which overwrites this value directly, so it never actually reaches here
// as literal "Other") or left it blank, and either way it has nothing to
// contribute to a title.
function isRealSpecialtyValue(value: string | undefined): value is string {
  const trimmed = value?.trim();
  return Boolean(trimmed) && trimmed !== "Other" && trimmed !== "Other (specify)";
}

// The one clean label for what kind of doctor this is — subspecialty wins
// when it names something more specific than its parent specialty, falling
// back to the specialty itself, and finally to whatever text is actually
// there rather than showing nothing.
export function specialistTitle(specialty: string, subspecialty: string): string {
  if (isRealSpecialtyValue(subspecialty)) {
    return SPECIALTY_PRACTITIONER_TITLES[subspecialty] ?? subspecialty;
  }
  if (isRealSpecialtyValue(specialty)) {
    return SPECIALTY_PRACTITIONER_TITLES[specialty] ?? specialty;
  }
  return "";
}

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
