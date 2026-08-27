import type { Metadata } from "next";
import { Homepage } from "@/components/home/Homepage";
import { PageShell } from "@/components/layout/PageShell";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { resolveNearbyFacilityCoordinates } from "@/lib/nearby-coordinates";
import { SUB_CITIES } from "@/lib/constants/specialty-options";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiru — Healthcare in Addis Ababa",
  description:
    "Find hospitals, clinics, specialists, diagnostics and pharmacies across Addis Ababa.",
};

export default async function Home() {
  const facilities = await getFacilitiesFromDB();

  // Coordinates are resolved once, server-side, via the exact same helper
  // /nearby uses, so the two surfaces can never quietly disagree about which
  // facilities are positionable.
  const nearbyFacilities = facilities.map((facility) => ({
    ...facility,
    coordinates: resolveNearbyFacilityCoordinates(facility),
  }));

  // Drives the hero trust line. Counts facilities that actually resolve to
  // coordinates rather than the raw row count, because that is what "mapped"
  // means here: the ones that can be placed and distance-sorted.
  const mappedFacilityCount = nearbyFacilities.filter(
    (facility) => facility.coordinates,
  ).length;

  // Trust-band stats, both derived from the rendered data rather than
  // hardcoded. Sub-cities are counted against the canonical SUB_CITIES list
  // instead of counting distinct raw strings, because the data contains
  // spelling variants for the same place ("Gulele" and "Gullele") and short
  // forms ("Kolfe" for "Kolfe Keranio") that would otherwise inflate or
  // deflate the number.
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");
  const presentSubCities = new Set(
    facilities.flatMap((facility) =>
      (facility.subCities ?? []).map((subCity) => normalize(subCity)).filter(Boolean),
    ),
  );
  const subCityCount = SUB_CITIES.filter((canonical) => {
    const key = normalize(canonical);
    return [...presentSubCities].some(
      (present) => present.startsWith(key) || key.startsWith(present),
    );
  }).length;

  // Facilities publishing round-the-clock hours. Replaces the old ambulance
  // stat, which claimed coverage a single ambulance listing did not support.
  const openAllHoursCount = facilities.filter(
    (facility) => (facility.workingHours ?? "").trim().toLowerCase() === "24/7",
  ).length;

  return (
    <PageShell>
      <Homepage
        facilities={facilities}
        mappedFacilityCount={mappedFacilityCount}
        nearbyFacilities={nearbyFacilities}
        openAllHoursCount={openAllHoursCount}
        subCityCount={subCityCount}
      />
    </PageShell>
  );
}
