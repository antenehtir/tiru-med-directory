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
  "Fertility",
  "Nutrition",
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
//
// "retina"/"retinal" was added the same way the others were: LA VISTA
// Specialty Eye Clinic lists "Surgical Retina" — qualifier AFTER the surgery
// word rather than before, the one shape the pattern otherwise only tests one
// way round — and without a matching branch here it read as bare "Surgical",
// tagging an eye clinic with the general Surgery specialty and, downstream,
// offering ENT surgical centres as "similar facilities" to it.
export const QUALIFIED_SURGERY_PATTERN = new RegExp(
  "\\b(?:dental|oral|maxillofacial|hair\\s+transplant|plastic|cosmetic|aesthetic|reconstructive|" +
    "orthopedic|orthopaedic|spinal|spine|eye|ophthalmic|refractive|cataract|lasik|retinal?)\\s*" +
    "(?:and\\s+\\w+\\s+)?surg\\w+" +
    "|\\bsurg\\w+\\s+retinal?\\b",
  "gi",
);

// Canonical Pediatrics alias list — pulled out to a named export (like
// SURGERY_ALIASES above) so it can double as the WeakMap key
// QUALIFIED_PEDIATRIC_PATTERN below is keyed on in frontend-search-filters.ts.
export const PEDIATRICS_ALIASES = ["pediatric", "paediatric", "paeds", "nicu", "neonatolog"];

// A pediatric-flavoured sub-service of a DIFFERENT specialty, removed from a
// facility's text before the aliases above are tested against it — the same
// reasoning as QUALIFIED_SURGERY_PATTERN just above. "Pediatric Eye Care" is
// an eye clinic's own service, not evidence the clinic also practises
// general pediatric medicine.
//
// This was not hypothetical: LA VISTA Specialty Eye Clinic's only
// pediatric-flavoured listing is exactly "Pediatric Eye Care", and matching
// it as the general Pediatrics specialty put a maternal/children's hospital
// and an ENT centre (both of which separately list their own "Pediatric ENT"
// / "Pediatric X" sub-services) into its "Similar facilities" rail — an eye
// clinic, an ENT clinic and an MCH hospital sharing nothing but the word
// "pediatric" used three different ways.
export const QUALIFIED_PEDIATRIC_PATTERN = new RegExp(
  "\\bp(?:a)?ediatric\\w*\\s+(?:eye|ophthalm\\w*|ent\\b|ear|nose|throat|dental|dentistry|dermatolog\\w*|" +
    "cardiolog\\w*|neurolog\\w*|orthop(?:a)?edic\\w*|urolog\\w*|surg\\w*|psychiatr\\w*|gastroenterolog\\w*)",
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
    // NearbyPage.tsx does not run these aliases through the generic
    // matcher for this pill — it tests facility.category and subcategory
    // directly instead — because "multispecialt"/"multiple specialt" used
    // to live here and matched any Specialty Center merely DESCRIBED as
    // multi-specialty ("Comprehensive multispecialty care"), mixing ordinary
    // specialty centers into a pill meant for one specific facility type
    // (Medical Plaza category, or "Medical Complex" by name/subcategory).
    // Kept here as the record of what this pill means, not as live matching
    // logic.
    // Covers both Medical Plaza (the category) and Medical Complex (a
    // describesAs synonym filed under Specialty Center) — the pill's own
    // label used to name only the first, which read as though a Medical
    // Complex listing wasn't included at all.
    display: "Medical Plaza/Complex",
    aliases: ["medical plaza", "medical complex"],
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
