export const SPECIALTY_OPTIONS = [
  "Internal Medicine",
  "Pediatrics & Maternal-Child Health",
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
    aliases: ["general surgery", "surgical", "laparoscopic", "surgery"],
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
