import { SPECIALTIES } from "@/lib/provider/onboarding-config";

const SPECIALTY_SET = new Set<string>(SPECIALTIES);

// Cross-references a facility's services array against the Medical
// specialties checklist (Step 3 onboarding) to pull out just the specialties.
export function getFacilityMedicalSpecialties(services: string[]): string[] {
  const seen = new Set<string>();
  return services.filter((service) => {
    if (!SPECIALTY_SET.has(service)) return false;
    const key = service.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Presentational-only label for the public facility detail page. Does not
// change facility.category, which remains the stored/filterable value.
export function getFacilityTypeDisplayLabel(facility: {
  category: string;
  services: string[];
}): string {
  if (facility.category !== "Specialty Center") return facility.category;

  const specialties = getFacilityMedicalSpecialties(facility.services);
  if (specialties.length === 1) return `${specialties[0]} Specialty Center`;
  if (specialties.length >= 2) return "Multi-specialty Center";
  return facility.category;
}
