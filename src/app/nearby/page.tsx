import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import {
  NearbyPage,
  type NearbyFacility,
} from "@/components/nearby/NearbyPage";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { resolveFacilityCoordinates } from "@/lib/nearby-distance";
import type { Facility, FacilityContactChannel } from "@/types/facility";

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
  const allFacilities = await getFacilitiesFromDB();

  return (
    <PageShell>
      <NearbyPage
        facilities={allFacilities.map(mapFacilityToNearbyFacility)}
        initialCategory={selectedCategory}
      />
    </PageShell>
  );
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
  const mapsText = (facility.contactChannels ?? [])
    .filter((channel) => channel.channelType === "maps")
    .map(createCoordinateSearchText)
    .join(" ");

  return {
    ...facility,
    coordinates: resolveFacilityCoordinates(facility, mapsText),
  };
}

function createCoordinateSearchText(channel: FacilityContactChannel): string {
  return [channel.href, channel.value].filter(Boolean).join(" ");
}
