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

// How alike two facilities are, as overlap divided by combined range.
//
// Counting shared specialties alone favours whoever offers the most of
// everything: on Smile Specialty Dental Center's page it put a large
// multi-specialty surgical centre above Babi Specialty Dental Clinic, because
// the big facility happened to share two labels while the dental clinic shared
// one. Two dental clinics are alike; a dental clinic and a nine-specialty
// hospital that also does dentistry are not, and a patient comparing options
// means the former.
//
// Dividing by the union corrects that. Babi shares 1 of a combined 2 and
// scores 0.5; a facility sharing 2 of a combined 9 scores 0.22.
export function specialtyOverlapScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter((s) => setB.has(s)).length;
  if (shared === 0) return 0;
  const union = new Set([...a, ...b]).size;
  return shared / union;
}

// The specialty two facilities have in common, for showing a reader why a
// comparison was offered at all. Returns the first shared label rather than
// all of them: the card has room for one chip, and one true reason answers the
// question better than a list nobody reads.
export function sharedSpecialtyLabel(
  a: { services: string[]; customServiceCategories?: Record<string, string[]> },
  b: { services: string[]; customServiceCategories?: Record<string, string[]> },
): string | undefined {
  const mine = new Set(getFacilitySpecialtyLabels(a));
  return getFacilitySpecialtyLabels(b).find((s) => mine.has(s));
}

// Drops a specialty that a compound one already contains.
//
// A facility can legitimately hold both "Gastroenterology" and
// "Gastroenterology and Hepatology" — the first came from the checklist, the
// second from the department's own name — but printing both says the same
// word twice and implies two separate services where there is one.
//
// Only conjunctions count. The parts are taken by splitting on " and ", so
// "Gastroenterology and Hepatology" absorbs "Gastroenterology" and
// "Hepatology", while "Pediatric Cardiology" absorbs nothing: a modifier is
// not a conjunction, and a hospital offering both paediatric and adult
// cardiology must keep both. That distinction is the whole rule — a plain
// substring test would have silently deleted "Cardiology" from every facility
// that also lists "Pediatric Cardiology".
export function absorbCompoundSpecialties(specialties: string[]): string[] {
  const absorbed = new Set<string>();

  for (const specialty of specialties) {
    if (!/\sand\s/i.test(specialty)) continue;
    for (const part of specialty.split(/\s+and\s+/i)) {
      const trimmed = part.trim();
      if (trimmed && trimmed.toLowerCase() !== specialty.toLowerCase()) {
        absorbed.add(trimmed.toLowerCase());
      }
    }
  }

  return specialties.filter((specialty) => !absorbed.has(specialty.toLowerCase()));
}
