// One-off data audit for the four proposed homepage "near me" specialty
// sections (Internal Medicine, Pediatrics, Surgery, Gynecology & Obstetrics).
// Read-only. Reuses production logic rather than reimplementing it:
//   - getFacilitiesFromDB() for the real is_active=true facility set, with the
//     same services+special_services dedup used everywhere else.
//   - specialtyMatchesAliases()/matchesAnyAlias() — the exact alias matcher
//     powering /search's specialty filter and Nearby's specialty pills.
//   - resolveFacilityCoordinates() — the exact coordinate resolution Nearby
//     uses, including its maps_link-text fallback parsing.
//   - resolveFacilityCardCategoryKey() — the exact category taxonomy resolver
//     used by the card system, for the Ambulance/Pharmacy sanity count.
//
// Run: node --no-warnings --env-file=.env.local --loader ./scripts/ts-paths-loader.mjs scripts/probe-specialty-coverage.ts

import { getFacilitiesFromDB } from "../src/lib/supabase/get-facilities";
import {
  specialtyMatchesAliases,
  matchesAnyAlias,
} from "../src/lib/frontend-search-filters";
import { NEARBY_SPECIALTY_PILLS } from "../src/lib/constants/specialty-options";
import { resolveFacilityCoordinates } from "../src/lib/nearby-distance";
import {
  resolveFacilityCardCategoryKey,
} from "../src/components/cards/facility-category-style";
import type { Facility, FacilityContactChannel } from "../src/types/facility";

// Task's four target specialties mapped onto the two alias lists that
// actually exist in production. "Surgery" has no exact match in
// SPECIALTY_ALIAS_MAP (closest is "General Surgery", a narrower set) but
// does have a dedicated, broader entry on NEARBY_SPECIALTY_PILLS — both are
// tested and reported since they diverge.
const TARGETS: {
  task: string;
  filterModalLabel: string | null; // key into SPECIALTY_ALIAS_MAP (frontend-search-filters.ts)
  nearbyPillDisplay: string | null; // display key into NEARBY_SPECIALTY_PILLS
  looseSubstrings: string[]; // step 2's intentionally loose partial-match probes
}[] = [
  {
    task: "Internal Medicine",
    filterModalLabel: "Internal Medicine",
    nearbyPillDisplay: "Internal Medicine",
    looseSubstrings: ["internal med"],
  },
  {
    task: "Pediatrics",
    filterModalLabel: "Pediatrics",
    nearbyPillDisplay: null, // folded into the "MCH" pill on Nearby — see report
    looseSubstrings: ["pediat", "paediat"],
  },
  {
    task: "Surgery",
    filterModalLabel: "General Surgery",
    nearbyPillDisplay: "Surgery",
    looseSubstrings: ["surg"],
  },
  {
    task: "Gynecology & Obstetrics",
    filterModalLabel: "Gynecology & Obstetrics",
    nearbyPillDisplay: null, // folded into the "MCH" pill on Nearby — see report
    looseSubstrings: ["gyn", "obstet"],
  },
];

function mergedTagsForFacility(facility: Facility): string[] {
  // facility.services is already the deduped services+special_services union
  // (see get-facilities.ts mapDBRowToFacility). Add customServiceCategories'
  // values and dedupe again to get the true 3-way union the task asks for —
  // this also lets us measure whether custom values add anything NOT already
  // present in services/special_services.
  const customValues = Object.values(facility.customServiceCategories ?? {}).flat();
  return Array.from(new Set([...facility.services, ...customValues])).filter(Boolean);
}

function facilityCoordinatesViaNearbyFacilityPath(facility: Facility) {
  // Mirrors mapFacilityToNearbyFacility in src/app/nearby/page.tsx exactly:
  // builds fallback search text from maps contact channels, then resolves.
  const mapsText = (facility.contactChannels ?? [])
    .filter((c: FacilityContactChannel) => c.channelType === "maps")
    .map((c: FacilityContactChannel) => [c.href, c.value].filter(Boolean).join(" "))
    .join(" ");
  return resolveFacilityCoordinates(facility, mapsText);
}

function facilityCoordinatesViaNearbySpecialistPath(facility: Facility) {
  // Mirrors mapSpecialistToNearbySpecialist: lat/lng only, NO maps_link
  // fallback. This is a real production asymmetry, not a script shortcut.
  return resolveFacilityCoordinates(
    { latitude: facility.latitude, longitude: facility.longitude },
    undefined,
  );
}

type VariantHit = { raw: string; count: number };

function auditVariants(
  facilities: Facility[],
  getTags: (f: Facility) => string[],
  substrings: string[],
): VariantHit[] {
  const counts = new Map<string, number>();
  for (const facility of facilities) {
    const seenOnThisFacility = new Set<string>();
    for (const tag of getTags(facility)) {
      const lower = tag.toLowerCase();
      if (!substrings.some((s) => lower.includes(s))) continue;
      if (seenOnThisFacility.has(tag)) continue;
      seenOnThisFacility.add(tag);
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([raw, count]) => ({ raw, count }))
    .sort((a, b) => b.count - a.count);
}

async function main() {
  const facilities = await getFacilitiesFromDB();
  console.log(`Loaded ${facilities.length} is_active=true facilities from getFacilitiesFromDB().`);
  console.log(
    `(This is the production "live" set — no separate verification_status filter is applied ` +
    `anywhere else in the app for counts like the homepage "105+ Healthcare Providers" stat, ` +
    `so this audit uses the same definition of "live" for comparability.)\n`,
  );

  const report: Record<string, unknown> = {};

  // ── STEP 1 + partial STEP 3 setup ──────────────────────────────────────
  for (const target of TARGETS) {
    const section: Record<string, unknown> = {};

    // Step 1: raw coverage via the production filter-modal alias matcher
    // (SPECIALTY_ALIAS_MAP), tested against the full 3-way merged tag list.
    const matchModal = facilities.filter((f) =>
      target.filterModalLabel
        ? specialtyMatchesAliases(mergedTagsForFacility(f).join(" "), target.filterModalLabel)
        : false,
    );
    section.rawCount_filterModalAliases = matchModal.length;

    // Same count via the Nearby-pill alias list, where one exists — this is
    // the list this feature would most plausibly reuse, and it sometimes
    // differs in coverage from the filter-modal list (e.g. Surgery).
    const nearbyPill = NEARBY_SPECIALTY_PILLS.find((p) => p.display === target.nearbyPillDisplay);
    if (nearbyPill) {
      const matchNearby = facilities.filter((f) =>
        matchesAnyAlias(mergedTagsForFacility(f).join(" "), nearbyPill.aliases),
      );
      section.rawCount_nearbyPillAliases = matchNearby.length;
      section.nearbyPillAliasesUsed = nearbyPill.aliases;
    } else {
      section.rawCount_nearbyPillAliases = null;
      section.note_nearbyPill = "No standalone Nearby pill for this specialty — see report narrative.";
    }

    // Does folding in customServiceCategories change the count versus
    // services+special_services alone? Tests the task's literal 3-way claim.
    const matchServicesOnly = facilities.filter((f) =>
      target.filterModalLabel
        ? specialtyMatchesAliases(f.services.join(" "), target.filterModalLabel)
        : false,
    );
    section.rawCount_servicesAndSpecialOnly_noCustomCategories = matchServicesOnly.length;

    // Step 2: loose substring variant audit over individual merged tags.
    section.variants_mergedTags = auditVariants(
      facilities,
      mergedTagsForFacility,
      target.looseSubstrings,
    );

    // Step 3: specialist-record (facility.doctors[].specialty/subspecialty) path.
    const specialistTagText = (f: Facility) =>
      (f.doctors ?? []).map((d) => `${d.specialty ?? ""} ${d.subspecialty ?? ""}`);
    const specialistRawFields = (f: Facility) =>
      (f.doctors ?? []).flatMap((d) => [d.specialty, d.subspecialty].filter((v): v is string => Boolean(v?.trim())));

    const facilitiesWithMatchingDoctor = facilities.filter((f) =>
      target.filterModalLabel
        ? specialistTagText(f).some((t) => specialtyMatchesAliases(t, target.filterModalLabel!))
        : false,
    );
    const matchingDoctorCount = facilities.reduce((sum, f) => {
      if (!target.filterModalLabel) return sum;
      const hits = (f.doctors ?? []).filter((d) =>
        specialtyMatchesAliases(`${d.specialty ?? ""} ${d.subspecialty ?? ""}`, target.filterModalLabel!),
      );
      return sum + hits.length;
    }, 0);
    section.specialistPath_matchingFacilities = facilitiesWithMatchingDoctor.length;
    section.specialistPath_matchingDoctorRecords = matchingDoctorCount;
    section.variants_specialistRawFields = auditVariants(
      facilities,
      specialistRawFields,
      target.looseSubstrings,
    );

    // Step 4: coordinate validity for whichever facility set matched via the
    // facility-tag path (Step 1 modal-alias match), both resolution paths.
    const viaFacilityPath = matchModal.map(facilityCoordinatesViaNearbyFacilityPath);
    const viaSpecialistPathCoords = facilitiesWithMatchingDoctor.map(
      facilityCoordinatesViaNearbySpecialistPath,
    );
    section.coords_facilityTagMatches_total = matchModal.length;
    section.coords_facilityTagMatches_valid_nearbyFacilityPath =
      viaFacilityPath.filter(Boolean).length;
    section.coords_specialistMatches_total = facilitiesWithMatchingDoctor.length;
    section.coords_specialistMatches_valid_nearbySpecialistPath =
      viaSpecialistPathCoords.filter(Boolean).length;

    report[target.task] = section;
  }

  // ── Doctors specialty field structure sanity ───────────────────────────
  const allDoctors = facilities.flatMap((f) => f.doctors ?? []);
  const doctorsWithBlankSpecialty = allDoctors.filter((d) => !d.specialty?.trim()).length;
  const distinctRawSpecialtyValues = new Map<string, number>();
  for (const d of allDoctors) {
    const v = (d.specialty ?? "").trim();
    if (!v) continue;
    distinctRawSpecialtyValues.set(v, (distinctRawSpecialtyValues.get(v) ?? 0) + 1);
  }
  report._doctorsFieldShape = {
    totalFacilitiesWithAnyDoctorRecords: facilities.filter((f) => (f.doctors ?? []).length > 0).length,
    totalDoctorRecords: allDoctors.length,
    doctorsWithBlankSpecialty,
    distinctRawSpecialtyValueCount: distinctRawSpecialtyValues.size,
    topDistinctRawSpecialtyValues: Array.from(distinctRawSpecialtyValues.entries())
      .map(([raw, count]) => ({ raw, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40),
  };

  // ── Step 5: Ambulance / Pharmacy sanity count ──────────────────────────
  const ambulanceCount = facilities.filter(
    (f) => resolveFacilityCardCategoryKey(f) === "ambulance",
  ).length;
  const pharmacyCount = facilities.filter(
    (f) => resolveFacilityCardCategoryKey(f) === "pharmacy",
  ).length;
  report._urgentCategoryStrip = { ambulanceCount, pharmacyCount, totalActiveFacilities: facilities.length };

  console.log(JSON.stringify(report, null, 2));
}

void main();
