import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import {
  NearbyPage,
  type NearbyFacility,
  type NearbySpecialist,
} from "@/components/nearby/NearbyPage";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { normalizeFacilityCategoryParam } from "@/lib/frontend-search-filters";
import { getAllSpecialists, type SpecialistListItem } from "@/lib/supabase/get-specialists";
import {
  resolveNearbyFacilityCoordinates,
  resolveNearbySpecialistCoordinates,
} from "@/lib/nearby-coordinates";
import type { Facility } from "@/types/facility";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nearby Care — Tiru",
  description:
    "Find the nearest hospital, clinic, or pharmacy to your location in Addis Ababa.",
};

type NearbyRouteProps = {
  searchParams?: Promise<{
    category?: string | string[];
  }>;
};

export default async function NearbyRoute({ searchParams }: NearbyRouteProps) {
  const params = await searchParams;
  // undefined means "no category named", which /nearby renders as the All chip.
  const selectedCategory = normalizeFacilityCategoryParam(params?.category) ?? "all";
  const [allFacilities, allSpecialists] = await Promise.all([
    getFacilitiesFromDB(),
    getAllSpecialists(),
  ]);

  return (
    <PageShell>
      <NearbyPage
        facilities={allFacilities.map(mapFacilityToNearbyFacility)}
        initialCategory={selectedCategory}
        specialists={allSpecialists.map(mapSpecialistToNearbySpecialist)}
      />
    </PageShell>
  );
}

function mapSpecialistToNearbySpecialist(specialist: SpecialistListItem): NearbySpecialist {
  return {
    ...specialist,
    coordinates: resolveNearbySpecialistCoordinates(specialist),
  };
}

function mapFacilityToNearbyFacility(facility: Facility): NearbyFacility {
  return {
    ...facility,
    coordinates: resolveNearbyFacilityCoordinates(facility),
  };
}
