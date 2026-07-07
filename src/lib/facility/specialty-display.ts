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
