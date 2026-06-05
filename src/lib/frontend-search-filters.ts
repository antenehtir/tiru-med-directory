import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

export type FacilityCategoryFilter = "hospital" | "clinic" | "laboratory";

export function normalizeSearchParam(
  value: string | string[] | undefined,
): string {
  const source = Array.isArray(value) ? value[0] : value;

  return source?.trim() ?? "";
}

export function normalizeFacilityCategoryParam(
  value: string | string[] | undefined,
): FacilityCategoryFilter | undefined {
  const normalized = normalizeSearchParam(value).toLowerCase();

  if (
    normalized === "hospital" ||
    normalized === "clinic" ||
    normalized === "laboratory"
  ) {
    return normalized;
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
        facility.workingHours,
        facility.availabilityNote,
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

export function filterFacilitiesByCategory(
  facilities: Facility[],
  category: FacilityCategoryFilter | undefined,
): Facility[] {
  if (!category) {
    return facilities;
  }

  return facilities.filter((facility) => {
    const searchableText = normalizeQuery(
      [
        facility.category,
        facility.subcategory,
        facility.name,
        ...facility.services,
      ].join(" "),
    );

    if (category === "clinic") {
      return (
        searchableText.includes("clinic") ||
        searchableText.includes("health center") ||
        searchableText.includes("primary care")
      );
    }

    if (category === "hospital") {
      return searchableText.includes("hospital");
    }

    return (
      searchableText.includes("laboratory") ||
      searchableText.includes("diagnostic") ||
      searchableText.includes("lab")
    );
  });
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
    return "Hospitals";
  }

  if (category === "clinic") {
    return "Clinics";
  }

  if (category === "laboratory") {
    return "Laboratories";
  }

  return undefined;
}

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

function matchesTokens(values: string[], query: string): boolean {
  return values.some((value) => normalizeQuery(value).includes(query));
}
