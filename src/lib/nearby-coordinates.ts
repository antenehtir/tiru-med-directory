import { resolveFacilityCoordinates, type Coordinates } from "@/lib/nearby-distance";
import type { Facility, FacilityContactChannel } from "@/types/facility";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";

// Extracted from src/app/nearby/page.tsx unchanged — was a private, unexported
// pair of mapping functions, so the homepage's "Near you" strip would
// otherwise have had to reimplement coordinate resolution a second time (or
// worse, resolve it slightly differently and disagree with /nearby about
// which facilities are positionable).

export function resolveNearbyFacilityCoordinates(facility: Facility): Coordinates | undefined {
  const mapsText = (facility.contactChannels ?? [])
    .filter((channel: FacilityContactChannel) => channel.channelType === "maps")
    .map((channel: FacilityContactChannel) => [channel.href, channel.value].filter(Boolean).join(" "))
    .join(" ");

  return resolveFacilityCoordinates(facility, mapsText);
}

// Deliberately no maps_link fallback here — SpecialistListItem doesn't carry
// the facility's contact channels, only its raw lat/lng columns. Matches
// /nearby's existing behavior exactly rather than "fixing" an asymmetry that
// isn't this change's to fix.
export function resolveNearbySpecialistCoordinates(
  specialist: Pick<SpecialistListItem, "facilityLatitude" | "facilityLongitude">,
): Coordinates | undefined {
  return resolveFacilityCoordinates(
    {
      latitude: specialist.facilityLatitude ?? undefined,
      longitude: specialist.facilityLongitude ?? undefined,
    },
    undefined,
  );
}
