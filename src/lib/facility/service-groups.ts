import {
  MAIN_SERVICES,
  IMAGING_SERVICES,
  BASIC_LAB_CATEGORIES,
  PHARMACY_CATEGORIES,
  LAB_TESTS,
  HOME_CARE_SERVICES,
  AMBULANCE_VEHICLE_TYPES,
} from "@/lib/provider/onboarding-config";
import { getFacilityMedicalSpecialties } from "@/lib/facility/specialty-display";
import type { Facility } from "@/types/facility";

type ServiceGroupDef = {
  // Matches the customServiceCategories key used for this section in
  // Step3ServicesForm (see addCustomService(key)/customInputs), so a
  // categorized custom "other" entry lands in the same group as the
  // predefined pills it was added alongside.
  key: string;
  label: string;
  predefined?: readonly string[];
};

// No stored category column for predefined services — these are fixed
// catalog values from onboarding (src/lib/provider/onboarding-config.ts),
// not user data, so the grouping is derived from the same static lists
// Step 3 uses, in the same order they appear there.
const SERVICE_GROUP_DEFS: ServiceGroupDef[] = [
  { key: "general", label: "General Services", predefined: MAIN_SERVICES },
  { key: "imaging", label: "Imaging & Diagnostics", predefined: IMAGING_SERVICES },
  ...Object.entries(BASIC_LAB_CATEGORIES).map(([category, tests]) => ({
    key: `basiclab-${category}`,
    label: category,
    predefined: tests,
  })),
  { key: "basiclab-other-test", label: "Other Lab Tests" },
  { key: "pharmacy", label: "Medication Categories", predefined: PHARMACY_CATEGORIES },
  { key: "lab", label: "Tests & Procedures", predefined: LAB_TESTS },
  { key: "homecare", label: "Home Care Services", predefined: HOME_CARE_SERVICES },
  { key: "ambulance", label: "Vehicle Types", predefined: AMBULANCE_VEHICLE_TYPES },
  { key: "other", label: "Other Services" },
];

export type FacilityServiceGroup = { label: string; services: string[] };

// Groups a facility's flat `services` array under the same category
// structure used during onboarding, so the public page reads as sections
// instead of one unlabeled wall of pills. Only groups with at least one
// matched service are returned, in a fixed, onboarding-mirroring order.
export function groupFacilityServices(facility: Facility): FacilityServiceGroup[] {
  const specialties = new Set(getFacilityMedicalSpecialties(facility.services));

  const seen = new Set<string>();
  const uniqueServices = facility.services.filter((service) => {
    if (specialties.has(service)) return false;
    const key = service.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Reverse index: custom-entry value -> the category key it was tagged
  // with (see supabase/migrations_draft/035_custom_service_categories.sql).
  const customValueToKey = new Map<string, string>();
  for (const [key, values] of Object.entries(facility.customServiceCategories ?? {})) {
    for (const value of values) customValueToKey.set(value, key);
  }

  const remaining = new Set(uniqueServices);
  const groups: FacilityServiceGroup[] = [];

  for (const def of SERVICE_GROUP_DEFS) {
    const matched = uniqueServices.filter(
      (service) =>
        remaining.has(service) &&
        (customValueToKey.get(service) === def.key || def.predefined?.includes(service)),
    );
    if (matched.length > 0) {
      for (const service of matched) remaining.delete(service);
      groups.push({ label: def.label, services: matched });
    }
  }

  // Legacy custom entries saved before category-tagging existed (or any
  // value that doesn't match a known catalog list) — still shown, not
  // silently dropped.
  if (remaining.size > 0) {
    groups.push({
      label: "Additional Services",
      services: uniqueServices.filter((service) => remaining.has(service)),
    });
  }

  return groups;
}
