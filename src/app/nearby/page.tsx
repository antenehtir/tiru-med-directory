import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import {
  NearbyPage,
  type NearbyFacility,
  type NearbySpecialist,
} from "@/components/nearby/NearbyPage";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
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
  const selectedCategory = normalizeCategoryParam(params?.category);
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

function normalizeCategoryParam(value: string | string[] | undefined): string {
  const source = Array.isArray(value) ? value[0] : value;
  const normalized = source?.trim().toLowerCase() ?? "";

  return [
    "all",
    "hospital",
    "specialty",
    "clinic",
    "doctors",
    "diagnostics",
    "pharmacies",
  ].includes(normalized)
    ? normalized
    : "all";
}

function mapFacilityToNearbyFacility(facility: Facility): NearbyFacility {
  return {
    ...facility,
    coordinates: resolveNearbyFacilityCoordinates(facility),
  };
}
