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

export const specialtySubFilters = [
  "All specialties",
  "Internal Medicine",
  "Pediatrics",
  "Gynecology",
  "General Surgery",
  "Cardiology",
  "Orthopedics",
  "ENT",
  "Dermatology",
  "Psychiatry",
  "Ophthalmology",
  "Physiotherapy",
  "Dental",
  "Neurology",
  "Oncology",
  "Gastroenterology",
];

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
  const keyword = normalizeQuery(specialty);

  if (!keyword || keyword === "all specialties") {
    return facilities;
  }

  return facilities.filter((facility) =>
    matchesTokens(
      [facility.name, facility.category, facility.subcategory, ...facility.services],
      keyword,
    ),
  );
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
      return (
        searchableText.includes("general hospital") ||
        searchableText.includes("hospital")
      );
    }

    if (category === "specialty") {
      return (
        searchableText.includes("specialty center") ||
        searchableText.includes("specialty")
      );
    }

    if (category === "pharmacy") {
      return searchableText.includes("pharmacy");
    }

    if (category === "ambulance") {
      return searchableText.includes("ambulance");
    }

    if (category === "home-care") {
      return searchableText.includes("home care");
    }

    return (
      searchableText.includes("laboratory") ||
      searchableText.includes("diagnostic") ||
      searchableText.includes("lab") ||
      searchableText.includes("imaging") ||
      searchableText.includes("radiology")
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
