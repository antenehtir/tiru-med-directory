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

// Surgeries that belong to a different specialty, removed from a facility's
// text before the aliases above are tested against it.
//
// The alias list cannot express this on its own. Dropping bare "surgery" was
// measured against the live directory and cost four facilities — Medstar,
// Tazma, Nordic and ACL ENT all list their general theatre as the single word
// "Surgery" — to fix one. Removing the qualified phrase first keeps those and
// drops exactly the three that were wrong: Smile Specialty Dental Center
// (Dental Surgery), Dream Orthopaedics (Orthopaedic and Spinal Surgery) and
// Glow Skincare (Hair Transplant Surgery).
//
// A hospital that lists both keeps its match, because removing "Dental
// Surgery" leaves "General Surgery" standing. "neurosurgery" is deliberately
// absent from the qualifiers: it is an explicit alias above.
export const QUALIFIED_SURGERY_PATTERN = new RegExp(
  "\\b(?:dental|oral|maxillofacial|hair\\s+transplant|plastic|cosmetic|aesthetic|reconstructive|" +
    "orthopedic|orthopaedic|spinal|spine|eye|ophthalmic|refractive|cataract|lasik)\\s*" +
    "(?:and\\s+\\w+\\s+)?surg\\w+",
  "gi",
);

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
    // "speech therapy" and "language therapy" used to live here, which filed
    // Amina Speech and Language Therapy as a physiotherapy clinic. They are
    // different professions treating different things, and a parent looking
    // for help with a child's speech is not helped by a list of physios.
    aliases: ["physiotherapy", "physical therapy", "occupational therapy"],
  },
  {
    display: "Speech Therapy",
    // Deliberately narrow. "speech" alone would match "speech and hearing"
    // departments and any prose mentioning the word; these are the phrases a
    // facility actually uses to say it offers the service.
    aliases: [
      "speech therapy",
      "speech and language",
      "language therapy",
      "speech-language",
      "speech pathology",
      "swallowing therapy",
    ],
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
