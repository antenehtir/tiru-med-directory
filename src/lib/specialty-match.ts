import { getSpecialtyAliases, matchesAnyAlias } from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

// A facility is "specialist-focused" for a specialty when the specialty is in
// its own NAME and it is not a general hospital or medical plaza.
//
// This proxy was chosen by measuring the alternatives against the live data.
// Including `subcategory` looked stronger but was not: it classified Habari
// Medical Plaza as specialist in seven of eight specialties, which by
// definition makes it specialist in none. The name is the claim a facility
// makes about itself, and excluding the two general categories stops
// "Lancet General Hospital" qualifying on the word "General Surgery".
const GENERAL_CATEGORIES = new Set(["general hospital", "medical plaza"]);

export function isSpecialistFocused(facility: Facility, specialty: string): boolean {
  const aliases = getSpecialtyAliases(specialty);
  if (!aliases.length) return false;
  if (GENERAL_CATEGORIES.has((facility.category ?? "").trim().toLowerCase())) return false;
  return matchesAnyAlias(facility.name ?? "", aliases);
}

// Ranks facilities whose main business is this specialty above general
// facilities that list it among many services.
//
// Worth building because the split is real in every specialty measured against
// 106 active facilities — Psychiatry 6 specialist / 4 general, Dermatology 5/7,
// Surgery 9/11, Ophthalmology 2/8, Pediatrics 3/23. Order within each group is
// preserved, so this only ever moves specialists up; it never reshuffles peers.
export function rankBySpecialtyFocus(facilities: Facility[], specialty: string): Facility[] {
  if (!specialty) return facilities;
  const specialists: Facility[] = [];
  const general: Facility[] = [];
  for (const facility of facilities) {
    (isSpecialistFocused(facility, specialty) ? specialists : general).push(facility);
  }
  return [...specialists, ...general];
}

// The service a facility lists that caused it to match, so a general hospital
// appearing in an eye-care list can show why it earned its place. Falls back to
// the specialty's own display label when the match came from the facility name
// rather than from a listed service.
export function matchedServiceLabel(
  facility: Facility,
  specialty: string,
  fallbackLabel: string,
): string {
  const aliases = getSpecialtyAliases(specialty);
  if (!aliases.length) return fallbackLabel;
  const custom = Object.values(facility.customServiceCategories ?? {}).flat();
  const services = [...(facility.services ?? []), ...custom].filter(Boolean);
  const direct = services.find((service) => matchesAnyAlias(service, aliases));
  return direct ?? fallbackLabel;
}

// Short display label for a specialty key. The keys carry parenthetical
// disambiguation ("Ophthalmology (Eye Care)") that reads as clutter in a
// headline or a pill.
export function specialtyDisplayLabel(specialty: string): string {
  return specialty.replace(/\s*\([^)]*\)\s*/g, "").trim() || specialty;
}
