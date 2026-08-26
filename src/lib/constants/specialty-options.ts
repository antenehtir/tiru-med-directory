export const SPECIALTY_OPTIONS = [
  "Internal Medicine",
  "Pediatrics",
  "Maternal & Child Health",
  "Gynecology & Obstetrics",
  "General Surgery",
  "Cardiology",
  "Orthopedics",
  "ENT (Ear, Nose, Throat)",
  "Dermatology",
  "Psychiatry & Mental Health",
  "Ophthalmology (Eye Care)",
  "Physiotherapy",
  "Dental",
  "Neurology",
  "Oncology",
  "Gastroenterology",
  "Multiple specialties",
  "Other",
] as const;

// Canonical Surgery alias list — the single source for both this Nearby pill
// and SPECIALTY_ALIAS_MAP["General Surgery"] in frontend-search-filters.ts.
// Previously each defined its own literal array (7 vs 18 matching facilities
// on the live data), so a user got a different "Surgery" depending on which
// page they were on. "neurosurgery" and "surgeon" are explicit entries
// rather than relying on word-boundary matching on "surgery": the shared
// matcher requires a word boundary before an alias, and "surgery" occurring
// mid-word inside "neurosurgery" has no boundary there, while "surgeon" isn't
// a substring of "surgery" at all (they diverge at the 6th letter).
export const SURGERY_ALIASES = [
  "general surgery",
  "surgical",
  "surgery",
  "laparoscopic",
  "neurosurgery",
  "surgeon",
];

// Nearby page specialty pills — organized by actual Addis Ababa
// healthcare patterns, not the generic filter modal list.
// Each entry: display label shown on pill, and the keyword aliases
// matched against facility text via matchesAnyAlias().
export const NEARBY_SPECIALTY_PILLS: {
  display: string;
  aliases: string[];
}[] = [
  {
    display: "MCH",
    aliases: ["pediatric", "paediatric", "paeds", "maternal", "child health",
              "mch", "obstetric", "gynecology", "gynaecology", "gyn-obs",
              "gyni-obs", "nicu"],
  },
  {
    display: "Internal Medicine",
    aliases: ["internal medicine"],
  },
  {
    display: "Surgery",
    aliases: SURGERY_ALIASES,
  },
  {
    display: "ENT",
    aliases: ["ent", "e.n.t", "ear, nose", "otolaryngol"],
  },
  {
    display: "Dermatology",
    aliases: ["dermatology", "dermatovenerology"],
  },
  {
    display: "Psychiatry",
    aliases: ["psychiatry", "psychiatric", "mental health", "psychotherapy",
              "psychological", "substance rehab"],
  },
  {
    display: "Cardiology",
    aliases: ["cardiology", "cardiac", "cardiovascular"],
  },
  {
    display: "Neurology",
    aliases: ["neurology", "neurologic", "neurosurgery", "stroke", "spine"],
  },
  {
    display: "Dental",
    aliases: ["dental", "dentistry", "orthodontic"],
  },
  {
    display: "Physiotherapy",
    aliases: ["physiotherapy", "physical therapy", "occupational therapy",
              "speech therapy", "language therapy"],
  },
  {
    display: "Eye Care",
    aliases: ["ophthalmology", "optometry", "eye care", "eye clinic",
              "eye center"],
  },
  {
    display: "Orthopedics",
    aliases: ["orthopedic", "orthopaedic"],
  },
  {
    display: "Oncology",
    aliases: ["oncology", "oncologic"],
  },
  {
    display: "Gastroenterology",
    aliases: ["gastroenterology", "gastro"],
  },
  {
    display: "Fertility",
    aliases: ["fertility", "reproductive", "infertility", "ivf"],
  },
  {
    display: "Nutrition",
    aliases: ["nutrition", "nutritional", "dietitian", "dietary"],
  },
  {
    display: "Medical Plaza",
    aliases: ["medical plaza", "multispecialt", "multiple specialt"],
  },
];

export const SUB_CITIES = [
  "Addis Ketema",
  "Akaki Kaliti",
  "Arada",
  "Bole",
  "Gulele",
  "Kirkos",
  "Kolfe Keranio",
  "Lemi Kura",
  "Lideta",
  "Nifas Silk-Lafto",
  "Sheger City",
  "Yeka",
] as const;
