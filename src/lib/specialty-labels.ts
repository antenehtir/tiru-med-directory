// Plain-language names for specialties, shown wherever a specialty is named to
// a visitor: the homepage chips, the specialty page headline, the breadcrumb.
//
// The clinical term stays first because it is what a referral letter, a sign
// above a door, or a doctor will say. The bracket is the translation for
// everyone else. "Ophthalmology" alone asks the reader to already know the
// word; "Ophthalmology (Eye care)" does not.
//
// These are DISPLAY labels only. The keys are the stored values that the alias
// map, the ?specialty= URL parameter, and every matcher key off — changing
// those would break existing links and the matching at once.
const PUBLIC_LABELS: Record<string, string> = {
  // Supplied wording.
  "Ophthalmology (Eye Care)": "Ophthalmology (Eye care)",
  "Dermatology": "Dermatology (Skin care)",
  "Psychiatry & Mental Health": "Psychiatry (Psychological care)",
  "ENT (Ear, Nose, Throat)": "ENT (Head and neck care)",

  // Proposed wording, following the same rule: name the body part or the
  // person, not the discipline, and keep it to two or three words.
  "Pediatrics": "Pediatrics (Children's care)",
  "General Surgery": "Surgery (Operations)",
  "Internal Medicine": "Internal Medicine (Adult general care)",
  "Gynecology & Obstetrics": "Gynecology & Obstetrics (Women's health)",
  "Maternal & Child Health": "Maternal & Child Health (Mother and baby care)",
  "Cardiology": "Cardiology (Heart care)",
  "Orthopedics": "Orthopedics (Bone and joint care)",
  "Neurology": "Neurology (Brain and nerve care)",
  "Oncology": "Oncology (Cancer care)",
  "Gastroenterology": "Gastroenterology (Digestive care)",
  "Dental": "Dental (Teeth and gums)",
  "Physiotherapy": "Physiotherapy (Movement and recovery)",
  "Nutrition": "Nutrition (Food and diet)",
};

// Full public label, clinical term plus plain-language bracket.
export function specialtyPublicLabel(specialty: string): string {
  return PUBLIC_LABELS[specialty] ?? specialty;
}

// Just the plain-language part, for places too tight for the full pair.
// Returns an empty string when a specialty has no translation.
export function specialtyPlainPart(specialty: string): string {
  const full = PUBLIC_LABELS[specialty];
  const match = full ? /\(([^)]*)\)\s*$/.exec(full) : null;
  return match ? match[1] : "";
}
