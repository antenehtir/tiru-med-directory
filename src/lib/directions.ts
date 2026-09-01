import type { Facility } from "@/types/facility";

// A "Directions" action, not a "view this place" action. Where coordinates
// exist we build a Google Maps *directions* intent, so the link opens with
// routing from the user's position already requested rather than dropping them
// on a place page they then have to act on again. 104 of the 106 active
// facilities carry usable coordinates, so this is the path almost every card
// takes.
//
// The operator-supplied maps link is the fallback rather than the first
// choice: it is a place URL, so it cannot express a routing intent, and its
// accuracy varies — some are short links, some point at an area rather than a
// door. It is still better than offering nothing.
export function facilityDirectionsHref(facility: Facility): string | null {
  const { latitude, longitude } = facility;

  if (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  const mapsChannel = (facility.contactChannels ?? []).find(
    (channel) => channel.channelType === "maps",
  );

  return mapsChannel?.href ?? null;
}
