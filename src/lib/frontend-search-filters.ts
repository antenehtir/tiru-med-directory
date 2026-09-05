import { SPECIALTY_OPTIONS, SURGERY_ALIASES } from "@/lib/constants/specialty-options";
import { stripDoctorNamePrefix } from "@/lib/provider/doctor-types";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";
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
  "Pediatrics": ["pediatric", "paediatric", "paeds", "nicu", "neonatolog"],
  "Maternal & Child Health": ["maternal", "child health", "mch"],
  // Added "obgyn"/"ob-gyn"/"ob/gyn": Habari Medical Plaza tags itself "OBGYN"
  // and matched none of the five original aliases, silently undercounting.
  "Gynecology & Obstetrics": ["gynecology", "gynaecology", "obstetric", "gyn-obs", "gyni-obs", "obgyn", "ob-gyn", "ob/gyn"],
  // Canonical list shared with the Nearby page's "Surgery" pill — see
  // SURGERY_ALIASES in specialty-options.ts for why.
  "General Surgery": SURGERY_ALIASES,
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

// The same word-boundary machinery, minus the closing \b, for tokens the
// VISITOR typed rather than aliases we curated.
//
// The distinction is real and measured. An alias is a complete term we chose,
// so "ent" must not slide into "enterology" and the closing \b earns its
// place. A typed token is a prefix of what someone means: "lab" is how people
// ask for "Laboratory", "test" for "tests". Holding query tokens to the alias
// rule made every short query fail against the data's own longer wording —
// "lab test" returned 0 of 106 while three facilities tag "Comprehensive
// Laboratory and Diagnostic tests".
//
// Prefix semantics cost nothing measurable: dialysis 20, physiotherapy 6,
// MRI 8, endoscopy 1 and ent 12 are all unchanged, and "ear" — the token most
// likely to over-reach — gains no facilities at all.
function buildQueryTokenPattern(token: string): RegExp {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}`, "i");
}

// Every token must appear somewhere in the text, in any order.
export function matchesQueryTokens(text: string, tokens: string[]): boolean {
  return tokens.every((token) => buildQueryTokenPattern(token).test(text));
}

export function splitQueryTokens(query: string): string[] {
  return query.trim().split(/\s+/).filter(Boolean);
}

// Read-only accessor for a specialty's alias list. The map itself stays
// private so it has exactly one owner, but the specialty landing page needs
// the same aliases to decide which listed service caused a match and which
// facilities are specialist-focused — reimplementing them there is how the
// two would drift apart.
export function getSpecialtyAliases(label: string): string[] {
  return SPECIALTY_ALIAS_MAP[label] ?? [];
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

// URL spellings that are not themselves taxonomy keys. Deliberately separate
// from the derived set below, so adding an alias stays an explicit decision
// rather than something that arrives by copying the key list.
const FACILITY_CATEGORY_PARAM_ALIASES: Record<string, FacilityCategoryFilter> = {
  laboratory: "diagnostics",
};

// Derived from FACILITY_CATEGORY_DB_MAP rather than re-listing its keys. Every
// hand-maintained copy of that list in this codebase has drifted from the
// taxonomy at least once, and the failure mode is silent rather than loud:
// filterFacilitiesByCategory returns the UNFILTERED list for a key it cannot
// resolve, so a stale value shows every facility instead of raising anything.
// Deriving means a category added to the map is understood here immediately.
export function normalizeFacilityCategoryParam(
  value: string | string[] | undefined,
): FacilityCategoryFilter | undefined {
  const normalized = normalizeSearchParam(value).toLowerCase();
  if (!normalized) return undefined;

  if (Object.prototype.hasOwnProperty.call(FACILITY_CATEGORY_DB_MAP, normalized)) {
    return normalized as FacilityCategoryFilter;
  }

  return FACILITY_CATEGORY_PARAM_ALIASES[normalized];
}

export function filterFacilitiesByQuery(
  facilities: Facility[],
  query: string,
): Facility[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return facilities;
  }

  return facilities.filter(
    (facility) =>
      // Sub-cities are matched with the shared matcher rather than the plain
      // substring scan below, so canonical names like "Kolfe Keranio" resolve
      // against the short form actually stored ("kolfe").
      (facility.subCities ?? []).some((subCity) =>
        subCityMatches(subCity, normalizedQuery),
      ) ||
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

// Specialists sourced from facilities.doctors (see get-specialists.ts) — the
// data actually shown on /specialists, distinct from the separate `doctors`-
// table-backed Doctor[] above. Strips a leading title ("Dr.", "Dr", "Doctor")
// from both the query and the stored name before comparing, consistent with
// stripDoctorNamePrefix's use elsewhere, so "anteneh" and "dr anteneh" both
// match a specialist saved as "Anteneh Tirusew".
export function filterSpecialistsByQuery(
  specialists: SpecialistListItem[],
  query: string,
): SpecialistListItem[] {
  const normalizedQuery = normalizeQuery(stripDoctorNamePrefix(query));

  if (!normalizedQuery) {
    return specialists;
  }

  return specialists.filter((specialist) =>
    matchesTokens(
      [
        stripDoctorNamePrefix(specialist.fullName),
        specialist.specialty,
        specialist.subspecialty,
        specialist.facilityName,
        specialist.facilityArea,
        specialist.facilitySubCity,
      ],
      normalizedQuery,
    ),
  );
}

// The one place that adds up "how many results does this query return" across
// all three result types. /search's own result count and the autocomplete's
// service-tag suggestions both need this number and must agree on it — a
// service row promising "5 facilities" for a query /search itself resolves to
// 6 (5 facilities + 1 specialist) is a visible, confusing seam. Call this
// rather than summing the three filter calls inline a second time.
export function countQueryMatches(
  facilities: Facility[],
  doctors: Doctor[],
  specialists: SpecialistListItem[],
  query: string,
): number {
  return (
    filterFacilitiesByQuery(facilities, query).length +
    filterDoctorsByQuery(doctors, query).length +
    filterSpecialistsByQuery(specialists, query).length
  );
}

// Maps each UI filter value to the DB category strings it should match.
// The `category` field on each Facility record comes directly from the source data
// and is already correctly set — we match on it directly instead of text-searching.
// Exported so consumers that need the category taxonomy itself (e.g. the
// facility card's category badge) can derive it from this single map instead
// of re-deriving their own category-guessing heuristic.
export const FACILITY_CATEGORY_DB_MAP: Record<FacilityCategoryFilter, string[]> = {
  hospital: ["General Hospital"],
  specialty: ["Specialty Center", "Medical Plaza"],
  clinic: ["Clinic", "Healthcare Facility"],
  diagnostics: ["Diagnostic Center"],
  pharmacy: ["Pharmacy"],
  ambulance: ["Ambulance Service"],
  "home-care": ["Home Care"],
};

// Canonical category values, DERIVED from FACILITY_CATEGORY_DB_MAP rather
// than retyped. The first entry for each key is the value new records must
// store; later entries are legacy synonyms that still map but are not offered
// as choices (e.g. "Medical Plaza", "Healthcare Facility").
//
// Anything a provider can pick at signup MUST come from here. The signup form
// previously kept its own list with "Hospital", "Laboratory / Diagnostics"
// and "Other", none of which are in the map — approving those claims wrote an
// unmappable facilities.category, so the facility never appeared under any
// category filter.
export const FACILITY_CATEGORY_OPTIONS: string[] = Object.values(
  FACILITY_CATEGORY_DB_MAP,
).map((dbNames) => dbNames[0]);

// True when a stored category resolves to a real category key. Used at the
// claim-approval boundary so an unmappable value is caught before it becomes
// an invisible facility row.
export function isMappedFacilityCategory(category: string | null | undefined): boolean {
  if (!category) return false;
  const needle = category.trim().toLowerCase();
  return Object.values(FACILITY_CATEGORY_DB_MAP).some((dbNames) =>
    dbNames.some((dbName) => dbName.toLowerCase() === needle),
  );
}

// Generic over the facility shape so callers carrying extra fields (e.g.
// /nearby's NearbyFacility, which adds resolved coordinates) can share this
// one implementation instead of keeping a private copy that drifts.
export function filterFacilitiesByCategory<T extends Pick<Facility, "category">>(
  facilities: T[],
  category: FacilityCategoryFilter | undefined,
): T[] {
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
    return "Diagnostics / Lab";
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

// The single sub-city matcher, shared by free-text search
// (filterFacilitiesByQuery) and the filter dropdown
// (facilityMatchesListingFilters). These had drifted: the dropdown compared
// bidirectionally and found all 8 "kolfe" facilities when asked for the
// canonical "Kolfe Keranio", while search compared one way only and returned
// zero for the same term.
//
// The reverse direction is word-boundary guarded. A plain
// query.includes(stored) would make a search for "yekatit hospital" match
// every facility in "yeka", because "yeka" is a substring of "yekatit".
export function subCityMatches(storedSubCity: string, needle: string): boolean {
  const stored = normalizeQuery(storedSubCity);
  const query = normalizeQuery(needle);
  if (!stored || !query) return false;

  // stored value contains the query: "kolfe / nifas silk-lafto" vs "kolfe"
  if (stored.includes(query)) return true;

  // stored value is a short form of the query: "kolfe" vs "kolfe keranio"
  if (!query.startsWith(stored)) return false;
  const nextChar = query.charAt(stored.length);
  return nextChar === "" || !/[a-z0-9]/.test(nextChar);
}

// Free-text search now runs on the SAME matcher the specialty chips use.
//
// It used to be a contiguous substring scan, and the two paths had drifted
// three times. The scan was also badly wrong on short queries: "ent" returned
// 88 of 106 facilities, 76 of them false — gastroENTerology, dENTistry,
// cENTer, treatmENT, adolescENT. matchesAnyAlias applies word boundaries, so
// the same query returns 12 with none of those.
//
// The query is split on whitespace and every token must match somewhere in the
// record, rather than the whole phrase having to appear contiguously in one
// field — so "lab test" finds "Comprehensive Laboratory and Diagnostic tests",
// which no contiguous scan ever could.
//
// Each token anchors to a word start and then runs free to the end of the
// word, which is what a typed prefix means. The opening \b is the part doing
// the work: it is what stops "ent" reaching gastroENTerology.
function matchesTokens(values: string[], query: string): boolean {
  const tokens = splitQueryTokens(query);
  if (tokens.length === 0) return true;
  return matchesQueryTokens(values.filter(Boolean).join(" "), tokens);
}
