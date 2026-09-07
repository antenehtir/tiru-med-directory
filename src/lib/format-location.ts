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

// `location` is stored as "<area>, <sub-city>" — "Megenagna, Afarensis Bldg,
// Bole". Printed whole it reads as one street address whose last part happens
// to be "Bole", which is misleading: Bole is the sub-city, not the next line of
// the address, and a reader looking for the building goes hunting for a place
// called Bole on that street.
//
// Splitting it also removes a duplication on the cards, where the sub-city
// already has its own chip above and then appeared again as the tail of the
// address line.
//
// The sub-city is matched off the END of the string only, and only when it is
// preceded by a comma, so an area genuinely named after its sub-city
// ("bole homes, bole") keeps the area half intact.
export function splitFacilityAddress(facility: {
  location?: string | null;
  subCities?: string[] | null;
}): { street: string; subCity: string } {
  const location = facility.location?.trim() ?? "";
  const subCity = (facility.subCities ?? []).find((value) => value?.trim())?.trim() ?? "";

  if (!location) return { street: "", subCity: toTitleCaseLocation(subCity) };
  if (!subCity) return { street: location, subCity: "" };

  const escaped = subCity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const street = location.replace(new RegExp(`\\s*,\\s*${escaped}\\s*$`, "i"), "").trim();

  // If stripping consumed everything, the location WAS just the sub-city and
  // there is no street half to show.
  return {
    street: street && street.toLowerCase() !== subCity.toLowerCase() ? street : "",
    subCity: toTitleCaseLocation(subCity),
  };
}

// "Bole" alone is ambiguous — it names a sub-city, a road and a
// neighbourhood. Saying which one it is costs two words.
export function subCityLabel(subCity: string): string {
  return subCity ? `${subCity} Sub-city` : "";
}
