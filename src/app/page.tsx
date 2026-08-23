import type { Metadata } from "next";
import { Homepage } from "@/components/home/Homepage";
import { PageShell } from "@/components/layout/PageShell";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { getAllSpecialists } from "@/lib/supabase/get-specialists";
import {
  resolveNearbyFacilityCoordinates,
  resolveNearbySpecialistCoordinates,
} from "@/lib/nearby-coordinates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiru — Healthcare in Addis Ababa",
  description:
    "Find hospitals, clinics, specialists, diagnostics and pharmacies across Addis Ababa.",
};

export default async function Home() {
  const [facilities, specialists] = await Promise.all([
    getFacilitiesFromDB(),
    getAllSpecialists(),
  ]);

  // Coordinates are resolved once, server-side, via the exact same helpers
  // /nearby uses — the "Near you" strip's client-side distance ranking reads
  // facility.coordinates/specialist.coordinates the same way NearbyPage does,
  // so the two surfaces can never quietly disagree about which facilities
  // are positionable.
  const nearbyFacilities = facilities.map((facility) => ({
    ...facility,
    coordinates: resolveNearbyFacilityCoordinates(facility),
  }));
  const nearbySpecialists = specialists.map((specialist) => ({
    ...specialist,
    coordinates: resolveNearbySpecialistCoordinates(specialist),
  }));

  return (
    <PageShell>
      <Homepage facilities={facilities} nearbyFacilities={nearbyFacilities} nearbySpecialists={nearbySpecialists} />
    </PageShell>
  );
}
