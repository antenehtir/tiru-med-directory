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
    "Search hospitals, specialty centres and diagnostic labs across Addis Ababa, or find the care closest to you.",
};

export default async function Home() {
  const facilities = await getFacilitiesFromDB();

  // Coordinates are resolved once, server-side, via the exact same helper
  // /nearby uses, so the two surfaces can never quietly disagree about which
  // facilities are positionable.
  const positionable = facilities.map((facility) => ({
    ...facility,
    coordinates: resolveNearbyFacilityCoordinates(facility),
  }));

  // Drives the hero trust line. Counts facilities that actually resolve to
  // coordinates rather than the raw row count, because that is what "mapped"
  // means here: the ones that can be placed and distance-sorted.
  const mappedFacilityCount = positionable.filter(
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

  // Rendered as a floor with a trailing "+" rather than as an exact figure.
  // The count moves whenever a listing is added or deactivated, and a precise
  // number invites the reader to treat it as an audited total. Math.floor is a
  // no-op on today's integer count; it is here so that if this ever derives
  // from a non-integer source the label can only ever under-claim.
  const mappedFacilityLabel = `${Math.floor(mappedFacilityCount)}+`;

  return (
    <PageShell>
      <Homepage
        facilities={facilities}
        mappedFacilityLabel={mappedFacilityLabel}
        openAllHoursCount={openAllHoursCount}
        subCityCount={subCityCount}
      />
    </PageShell>
  );
}
