import {
  resolveFacilityCardCategoryKey,
  type FacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";
import { calculateDistanceKm, formatDistanceKm, type Coordinates } from "@/lib/nearby-distance";
import { resolveNearbyFacilityCoordinates } from "@/lib/nearby-coordinates";
import { isFacilityOpenNow } from "@/lib/schedule-availability";
import type { Facility } from "@/types/facility";

// Open now / Nearest first / Type — the refinement set specialty pages
// (SpecialtyResults) originated and /search's facility results now share.
// One implementation of the filter+sort logic and one of the pill row,
// so the two surfaces can't quietly drift into different behavior the way
// the matcher functions did earlier in this project's history.

export const LISTING_TYPE_LABELS: Record<FacilityCategoryFilter, string> = {
  hospital: "Hospitals",
  specialty: "Specialty centers",
  clinic: "Clinics",
  diagnostics: "Diagnostics / Lab",
  pharmacy: "Pharmacies",
  ambulance: "Ambulance",
  "home-care": "Home care",
};

// Only the categories actually present in this facility set — offering
// "Pharmacies" inside an all-hospital result list would be a dead end.
// The full 7-category taxonomy, not the 4 specialty pages used to hand-list:
// nothing stops a specialty or a search query matching a home-care or
// ambulance listing, and the same "only what's present" rule should apply
// regardless of which of those 7 happens to show up.
export function availableListingTypes(facilities: Facility[]): FacilityCategoryFilter[] {
  const present = new Set<FacilityCardCategoryKey>();
  for (const facility of facilities) present.add(resolveFacilityCardCategoryKey(facility));
  return (Object.keys(LISTING_TYPE_LABELS) as FacilityCategoryFilter[]).filter((key) =>
    present.has(key),
  );
}

export type ListingRefinementOptions = {
  // "" means the type pill row's own filtering is a no-op — used by /search,
  // which already filters facilities by type through its existing Filter
  // modal / URL-params pipeline before this ever runs. Specialty pages have
  // no earlier type-filtering step, so they pass their real selection here.
  typeKey: FacilityCategoryFilter | "";
  openOnly: boolean;
  nearestFirst: boolean;
  userLocation: Coordinates | null;
};

// Type filter + open-now filter, then a distance sort when nearestFirst has
// coordinates to sort by. Returns the input list in its own order otherwise
// — deliberately not opinionated about what "default order" means, since
// that differs per caller (specialty pages rank by specialist focus on top
// of this; /search leaves its query-relevance order alone).
export function applyListingRefinements(
  facilities: Facility[],
  options: ListingRefinementOptions,
): Facility[] {
  const filtered = facilities.filter((facility) => {
    if (options.typeKey && resolveFacilityCardCategoryKey(facility) !== options.typeKey) {
      return false;
    }
    if (options.openOnly && !isFacilityOpenNow(facility)) return false;
    return true;
  });

  if (!options.nearestFirst || !options.userLocation) return filtered;

  const userLocation = options.userLocation;
  return filtered
    .map((facility) => ({ facility, coords: resolveNearbyFacilityCoordinates(facility) }))
    .filter((entry): entry is { facility: Facility; coords: Coordinates } => Boolean(entry.coords))
    .sort((a, b) => calculateDistanceKm(userLocation, a.coords) - calculateDistanceKm(userLocation, b.coords))
    .map((entry) => entry.facility);
}

// Once coordinates exist, a card's locality slot should carry the distance
// rather than the sub-city the visitor just superseded by asking for
// nearest-first.
export function distanceLabelsByFacilityId(
  facilities: Facility[],
  userLocation: Coordinates | null,
): Record<string, string> | undefined {
  if (!userLocation) return undefined;
  const map: Record<string, string> = {};
  for (const facility of facilities) {
    const coords = resolveNearbyFacilityCoordinates(facility);
    if (coords) map[facility.id] = formatDistanceKm(calculateDistanceKm(userLocation, coords));
  }
  return map;
}
