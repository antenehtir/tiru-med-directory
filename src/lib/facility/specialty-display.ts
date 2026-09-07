import { SPECIALTIES } from "@/lib/provider/onboarding-config";
import { SPECIALTY_OPTIONS } from "@/lib/constants/specialty-options";
import { specialtyMatchesAliases } from "@/lib/frontend-search-filters";

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

// Which specialties a facility actually offers, judged the same way the
// homepage chips and the specialty pages judge it: by matching the curated
// alias list against everything the facility lists.
//
// getFacilityMedicalSpecialties above requires an exact SPECIALTIES value, and
// most of the imported directory does not have one — Babi Specialty Dental
// Clinic's only service is the sentence "Comprehensive dental health care
// services". Exact matching reads that as no specialty at all, which is how a
// dental clinic came to be offered a dermatology clinic and a psychotherapy
// centre to compare itself against. The alias rule reads it as Dental, which
// is what a person reading the same words concludes.
export function getFacilitySpecialtyLabels(facility: {
  services: string[];
  customServiceCategories?: Record<string, string[]>;
}): string[] {
  const custom = Object.values(facility.customServiceCategories ?? {}).flat();
  const text = Array.from(new Set([...facility.services, ...custom]))
    .filter(Boolean)
    .join(" ");
  if (!text) return [];
  return SPECIALTY_OPTIONS.filter((label) => specialtyMatchesAliases(text, label));
}
