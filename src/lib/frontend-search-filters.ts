import { SPECIALTY_OPTIONS } from "@/lib/constants/specialty-options";
import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

export type FacilityCategoryFilter =
  | "hospital"
  | "specialty"
  | "clinic"
  | "diagnostics"
  | "pharmacy"
  | "ambulance"
  | "home-care";

export const specialtySubFilters = ["All specialties", ...SPECIALTY_OPTIONS];

// Maps each SPECIALTY_OPTIONS label to the set of keywords that should match it.
// Uses word-boundary regex — "ent" must appear as a standalone word, not inside "center".
const SPECIALTY_ALIAS_MAP: Record<string, string[]> = {
  "Internal Medicine": ["internal medicine"],
  "Pediatrics & Maternal-Child Health": ["pediatric", "paediatric", "maternal", "child health", "mch"],
  "Gynecology & Obstetrics": ["gynecology", "gynaecology", "obstetric", "gyn-obs", "gyni-obs"],
  "General Surgery": ["general surgery", "surgical"],
  "Cardiology": ["cardiology", "cardiac", "cardiovascular"],
  "Orthopedics": ["orthopedic", "orthopaedic"],
  "ENT (Ear, Nose, Throat)": ["ent", "e.n.t", "ear, nose", "otolaryngol", "otorino"],
  "Dermatology": ["dermatology", "dermatovenerology"],
  "Psychiatry & Mental Health": ["psychiatry", "psychiatric", "mental health", "psychotherapy", "psychological"],
  "Ophthalmology (Eye Care)": ["ophthalmology", "optometry", "eye care", "eye clinic", "eye center"],
  "Physiotherapy": ["physiotherapy", "physical therapy"],
  "Dental": ["dental", "dentistry", "orthodontic"],
  "Neurology": ["neurology", "neurologic", "neurosurgery"],
  "Oncology": ["oncology", "oncologic"],
  "Gastroenterology": ["gastroenterology"],
  "Multiple specialties": ["multispecialty", "multi-specialty", "multiple specialt"],
  "Other": [],
};

function buildAliasPattern(alias: string): RegExp {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Bare alphabetic word stems (>= 5 letters, no spaces/punctuation) get a
  // trailing \w* so plural/inflected forms match too — e.g. the alias
  // "orthopaedic" must also match the data's "Orthopaedics". Short
  // abbreviations (e.g. "ent", "mch") and multi-word phrases keep an exact
  // word-boundary match so they don't become loose prefix matches.
  const isWordStem = /^[a-zA-Z]{5,}$/.test(alias);
  const suffix = isWordStem ? "\\w*" : "";
  return new RegExp(`\\b${escaped}${suffix}\\b`, "i");
}

// Shared by specialtyMatchesAliases and any other alias-list-based matcher
// (e.g. NearbyPage's specialty pills) so they all get the same stem-length
// safety logic in buildAliasPattern instead of re-implementing it.
export function matchesAnyAlias(text: string, aliases: string[]): boolean {
  return aliases.some((alias) => buildAliasPattern(alias).test(text));
}

export function specialtyMatchesAliases(text: string, label: string): boolean {
  const aliases = SPECIALTY_ALIAS_MAP[label];
  if (!aliases || aliases.length === 0) return false;

  return matchesAnyAlias(text, aliases);
}

// Kept for backward compatibility — still used to derive short display labels (e.g. NearbyPage pills).
export function extractSpecialtyMatchKeyword(label: string): string {
  return label
    .replace(/\s*\([^)]*\)/g, "")
    .split("&")[0]
    .trim();
}

export function normalizeSearchParam(
  value: string | string[] | undefined,
): string {
  const source = Array.isArray(value) ? value[0] : value;

  return source?.trim() ?? "";
}

export function filterFacilitiesBySpecialtyKeyword(
  facilities: Facility[],
  specialty: string,
): Facility[] {
  if (!specialty || specialty.toLowerCase() === "all specialties") {
    return facilities;
  }

  const searchText = (facility: Facility) =>
    [facility.name, facility.category, facility.subcategory, ...facility.services].join(" ");

  return facilities.filter((facility) => specialtyMatchesAliases(searchText(facility), specialty));
}

export function normalizeFacilityCategoryParam(
  value: string | string[] | undefined,
): FacilityCategoryFilter | undefined {
  const normalized = normalizeSearchParam(value).toLowerCase();

  if (
    normalized === "hospital" ||
    normalized === "specialty" ||
    normalized === "clinic" ||
    normalized === "diagnostics" ||
    normalized === "laboratory" ||
    normalized === "pharmacy" ||
    normalized === "ambulance" ||
    normalized === "home-care"
  ) {
    return normalized === "laboratory" ? "diagnostics" : normalized;
  }

  return undefined;
}

export function filterFacilitiesByQuery(
  facilities: Facility[],
  query: string,
): Facility[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return facilities;
  }

  return facilities.filter((facility) =>
    matchesTokens(
      [
        facility.name,
        facility.category,
        facility.subcategory,
        facility.location,
        facility.address,
        facility.subCity ?? "",
        facility.area ?? "",
        facility.workingHours,
        facility.availabilityNote ?? "",
        facility.verificationStatus,
        ...facility.services,
      ],
      normalizedQuery,
    ),
  );
}

export function filterDoctorsByQuery(
  doctors: Doctor[],
  query: string,
): Doctor[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return doctors;
  }

  return doctors.filter((doctor) =>
    matchesTokens(
      [
        doctor.name,
        doctor.specialty,
        doctor.facility,
        doctor.location,
        doctor.availability,
        doctor.verificationStatus,
        doctor.telemedicineStatus,
      ],
      normalizedQuery,
    ),
  );
}

// Maps each UI filter value to the DB category strings it should match.
// The `category` field on each Facility record comes directly from the source data
// and is already correctly set — we match on it directly instead of text-searching.
const FACILITY_CATEGORY_DB_MAP: Record<FacilityCategoryFilter, string[]> = {
  hospital: ["General Hospital"],
  specialty: ["Specialty Center", "Medical Plaza"],
  clinic: ["Clinic", "Healthcare Facility"],
  diagnostics: ["Diagnostic Center"],
  pharmacy: ["Pharmacy"],
  ambulance: ["Ambulance Service"],
  "home-care": ["Home Care"],
};

export function filterFacilitiesByCategory(
  facilities: Facility[],
  category: FacilityCategoryFilter | undefined,
): Facility[] {
  if (!category) {
    return facilities;
  }

  const allowedCategories = FACILITY_CATEGORY_DB_MAP[category];

  if (!allowedCategories) {
    return facilities;
  }

  return facilities.filter((facility) => allowedCategories.includes(facility.category));
}

export function filterDoctorsBySpecialty(
  doctors: Doctor[],
  specialty: string,
): Doctor[] {
  const normalizedSpecialty = normalizeQuery(specialty);

  if (!normalizedSpecialty) {
    return doctors;
  }

  return doctors.filter((doctor) =>
    normalizeQuery(doctor.specialty).includes(normalizedSpecialty),
  );
}

export function getFacilityCategoryLabel(
  category: FacilityCategoryFilter | undefined,
): string | undefined {
  if (category === "hospital") {
    return "General Hospitals";
  }

  if (category === "specialty") {
    return "Specialty Centers";
  }

  if (category === "clinic") {
    return "Clinics";
  }

  if (category === "diagnostics") {
    return "Diagnostics";
  }

  if (category === "pharmacy") {
    return "Pharmacies";
  }

  if (category === "ambulance") {
    return "Ambulance";
  }

  if (category === "home-care") {
    return "Home Care";
  }

  return undefined;
}

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

function matchesTokens(values: string[], query: string): boolean {
  return values.some((value) => normalizeQuery(value).includes(query));
}
