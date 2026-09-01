// Sub-city values are stored lower-cased and inconsistently ("nifas silk-lafto",
// "Lemi Kura", "kolfe"). Title-casing happens at render time only — the stored
// values stay exactly as they are, because matching (subCityMatches) and the
// filter params both work off the raw strings, and rewriting them in the
// database would be a migration with no user-visible benefit.
//
// Hyphens and slashes are word boundaries too: "nifas silk-lafto" must become
// "Nifas Silk-Lafto", not "Nifas Silk-lafto", and the multi-value rows
// ("arada / bole") have to capitalise on both sides of the separator.
export function toTitleCaseLocation(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|[\s\-/])([a-z])/g, (_match, boundary: string, letter: string) => boundary + letter.toUpperCase());
}

// The label that sits in the card's locality slot when no distance is known.
// Falls back through sub-city, then the free-text area, so the slot is never
// empty on a card that has any location information at all.
export function facilityLocalityLabel(facility: {
  subCities?: string[] | null;
  location?: string | null;
}): string {
  const subCity = (facility.subCities ?? []).find((value) => value?.trim());
  if (subCity) return toTitleCaseLocation(subCity);
  return "";
}
