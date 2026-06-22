import type { Facility } from "@/types/facility";

export type AreaOption = {
  label: string;
  value: string;
};

const subCityDisplayOverrides: Record<string, string> = {
  kolfe: "Kolfe Keranio",
  gullele: "Gulele",
};

const excludedSegments = new Set(["multiple", "online"]);

function toTitleCase(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getSubCityDisplayLabel(rawSegment: string): string {
  return subCityDisplayOverrides[rawSegment] ?? toTitleCase(rawSegment);
}

function getSubCitySegments(subCity?: string): string[] {
  if (!subCity) {
    return [];
  }

  return subCity
    .split("/")
    .map((segment) => segment.trim().toLowerCase())
    .filter((segment) => segment.length > 0 && !excludedSegments.has(segment));
}

export function getAreaOptionsForFacilities(facilities: Facility[]): AreaOption[] {
  const values = new Set<string>();

  for (const facility of facilities) {
    for (const segment of getSubCitySegments(facility.subCity)) {
      values.add(segment);
    }
  }

  return [...values]
    .map((value) => ({ value, label: getSubCityDisplayLabel(value) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function facilityMatchesArea(facility: Facility, areaValue: string): boolean {
  if (areaValue === "all") {
    return true;
  }

  if (getSubCitySegments(facility.subCity).includes(areaValue)) {
    return true;
  }

  return Boolean(facility.location?.toLowerCase().includes(areaValue));
}
