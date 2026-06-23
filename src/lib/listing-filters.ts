import {
  extractSpecialtyMatchKeyword,
  filterFacilitiesByCategory,
  specialtyMatchesAliases,
  type FacilityCategoryFilter,
} from "@/lib/frontend-search-filters";
import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

export type ListingFilters = {
  type: FacilityCategoryFilter | "";
  subCity: string;
  area: string;
  specialty: string;
};

export const EMPTY_LISTING_FILTERS: ListingFilters = {
  type: "",
  subCity: "",
  area: "",
  specialty: "",
};

const FILTER_PARAM_KEYS = ["type", "subCity", "area", "specialty"] as const;

function isActiveFilterValue(value: string): boolean {
  const trimmed = value.trim();

  return trimmed.length > 0 && trimmed.toLowerCase() !== "all";
}

export function countActiveListingFilters(filters: ListingFilters): number {
  return FILTER_PARAM_KEYS.filter((key) => isActiveFilterValue(filters[key])).length;
}

export function readListingFiltersFromSearchParams(
  searchParams: URLSearchParams,
): ListingFilters {
  return {
    type: (searchParams.get("type") as FacilityCategoryFilter | null) ?? "",
    subCity: searchParams.get("subCity") ?? "",
    area: searchParams.get("area") ?? "",
    specialty: searchParams.get("specialty") ?? "",
  };
}

export function writeListingFiltersToSearchParams(
  params: URLSearchParams,
  filters: ListingFilters,
): void {
  for (const key of FILTER_PARAM_KEYS) {
    const value = filters[key];

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function facilityMatchesListingFilters(
  facility: Facility,
  filters: ListingFilters,
): boolean {
  if (filters.type && filterFacilitiesByCategory([facility], filters.type).length === 0) {
    return false;
  }

  if (filters.subCity) {
    const needle = normalize(filters.subCity);
    // Empty subCities means the facility covers all sub-cities (multi-branch or online)
    // — always include it regardless of sub-city filter
    const matchesSubCity =
      facility.subCities.length === 0 ||
      facility.subCities.some((sc) => {
        const normSc = normalize(sc);
        // Match if either contains the other (handles "kolfe" <-> "kolfe keranio")
        return normSc.includes(needle) || needle.includes(normSc);
      });

    if (!matchesSubCity) {
      return false;
    }
  }

  if (filters.area) {
    const areaText = normalize(
      [facility.area ?? "", facility.location, facility.address].join(" "),
    );

    if (!areaText.includes(normalize(filters.area))) {
      return false;
    }
  }

  if (filters.specialty) {
    const specialtyText = [
      facility.category,
      facility.subcategory,
      facility.name,
      ...facility.services,
    ].join(" ");

    if (!specialtyMatchesAliases(specialtyText, filters.specialty)) {
      return false;
    }
  }

  return true;
}

export function doctorMatchesListingFilters(
  doctor: Doctor,
  filters: ListingFilters,
): boolean {
  if (filters.subCity && !normalize(doctor.location).includes(normalize(filters.subCity))) {
    return false;
  }

  if (filters.area && !normalize(doctor.location).includes(normalize(filters.area))) {
    return false;
  }

  if (filters.specialty) {
    const keyword = normalize(extractSpecialtyMatchKeyword(filters.specialty));

    if (keyword && keyword !== "all specialties" && !normalize(doctor.specialty).includes(keyword)) {
      return false;
    }
  }

  return true;
}
