"use client";

import type { NearbyFacility, NearbySpecialist } from "@/components/nearby/NearbyPage";
import { useGeolocation } from "@/lib/useGeolocation";
import { NearMeSection } from "./NearMeSection";
import { SpecialtyNearMeSection } from "./SpecialtyNearMeSection";

// One useGeolocation() call shared by the generic "Care near you" strip and
// the four specialty sections below it. Each of those five sections used to
// (or would, if built independently) call the opt-in hook itself, meaning a
// user clicking "Use my location" in one section would NOT unlock the other
// four — they'd each show their own separate "enable location" prompt. This
// wrapper exists only to share that one piece of state; the hook's own
// internals (permission check, timeout, watch/accuracy behavior) are
// untouched — see src/lib/useGeolocation.ts.
const SPECIALTIES: { eyebrow: string; heading: string; specialtyLabel: string }[] = [
  { eyebrow: "Internal Medicine", heading: "Internal Medicine near you", specialtyLabel: "Internal Medicine" },
  { eyebrow: "Pediatrics", heading: "Pediatrics near you", specialtyLabel: "Pediatrics" },
  { eyebrow: "Surgery", heading: "Surgery near you", specialtyLabel: "General Surgery" },
  { eyebrow: "Gynecology & Obstetrics", heading: "Gynecology & Obstetrics near you", specialtyLabel: "Gynecology & Obstetrics" },
];

export function NearMeGroup({
  facilities,
  specialists,
}: {
  facilities: NearbyFacility[];
  specialists: NearbySpecialist[];
}) {
  const { locationState, userLocation, requestLocation } = useGeolocation(false);

  return (
    <>
      <NearMeSection
        facilities={facilities}
        locationState={locationState}
        requestLocation={requestLocation}
        specialists={specialists}
        userLocation={userLocation}
      />
      {SPECIALTIES.map((specialty) => (
        <SpecialtyNearMeSection
          eyebrow={specialty.eyebrow}
          facilities={facilities}
          heading={specialty.heading}
          key={specialty.specialtyLabel}
          locationState={locationState}
          specialtyLabel={specialty.specialtyLabel}
          userLocation={userLocation}
        />
      ))}
    </>
  );
}
