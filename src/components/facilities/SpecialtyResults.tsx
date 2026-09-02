"use client";

import { useMemo, useState } from "react";
import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import { resolveFacilityCardCategoryKey } from "@/components/cards/facility-category-style";
import { EmptyState, SearchIcon } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { MapPinIcon } from "@/components/cards/contact-icons";
import { resolveNearbyFacilityCoordinates } from "@/lib/nearby-coordinates";
import { calculateDistanceKm, formatDistanceKm } from "@/lib/nearby-distance";
import { getAvailabilityStatus, isRoundTheClockHours } from "@/lib/schedule-availability";
import { matchedServiceLabel, rankBySpecialtyFocus } from "@/lib/specialty-match";
import { useGeolocation } from "@/lib/useGeolocation";
import type { Facility } from "@/types/facility";

// Refinements that make sense once a specialty is already chosen. The facility
// CATEGORY row is deliberately not here: with a specialty filter active it
// showed "All" highlighted, which read as "nothing is filtered" and invited
// starting over. Type survives as a genuine refinement, but only for the types
// actually present in these results — offering "Pharmacies" inside an
// ophthalmology list would be a dead end.
type TypeKey = "all" | "hospital" | "specialty" | "clinic" | "diagnostics";

const TYPE_LABELS: Record<Exclude<TypeKey, "all">, string> = {
  hospital: "Hospitals",
  specialty: "Specialty centers",
  clinic: "Clinics",
  diagnostics: "Diagnostics / Lab",
};

function isOpenNow(facility: Facility): boolean {
  if (facility.schedule?.length) {
    return getAvailabilityStatus(facility.schedule).state === "open-now";
  }
  return isRoundTheClockHours(facility.workingHours);
}

export function SpecialtyResults({
  facilities,
  specialty,
  specialtyLabel,
}: {
  facilities: Facility[];
  specialty: string;
  specialtyLabel: string;
}) {
  const [typeKey, setTypeKey] = useState<TypeKey>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [nearestFirst, setNearestFirst] = useState(false);
  const { locationState, userLocation, requestLocation } = useGeolocation(false);

  const availableTypes = useMemo(() => {
    const present = new Set<string>();
    for (const facility of facilities) present.add(resolveFacilityCardCategoryKey(facility));
    return (Object.keys(TYPE_LABELS) as Array<Exclude<TypeKey, "all">>).filter((key) =>
      present.has(key),
    );
  }, [facilities]);

  const results = useMemo(() => {
    let list = facilities.filter((facility) => {
      if (typeKey !== "all" && resolveFacilityCardCategoryKey(facility) !== typeKey) return false;
      if (openOnly && !isOpenNow(facility)) return false;
      return true;
    });

    if (nearestFirst && userLocation) {
      // Distance sort replaces the specialist-first order rather than layering
      // on top of it: the visitor has asked for one ordering, and quietly
      // mixing the two would produce a list that satisfies neither.
      list = list
        .map((facility) => ({ facility, coords: resolveNearbyFacilityCoordinates(facility) }))
        .filter((entry) => entry.coords)
        .sort(
          (a, b) =>
            calculateDistanceKm(userLocation, a.coords!) -
            calculateDistanceKm(userLocation, b.coords!),
        )
        .map((entry) => entry.facility);
    } else {
      list = rankBySpecialtyFocus(list, specialty);
    }
    return list;
  }, [facilities, typeKey, openOnly, nearestFirst, userLocation, specialty]);

  const highlightByFacilityId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const facility of results) {
      map[facility.id] = matchedServiceLabel(facility, specialty, specialtyLabel);
    }
    return map;
  }, [results, specialty, specialtyLabel]);

  const distanceReady = locationState === "ready" && Boolean(userLocation);

  // Once coordinates exist the card's locality slot should carry the distance,
  // exactly as it does on the homepage, rather than continuing to show the
  // sub-city the visitor has just superseded by asking for nearest-first.
  const distanceByFacilityId = useMemo(() => {
    if (!userLocation) return undefined;
    const map: Record<string, string> = {};
    for (const facility of results) {
      const coords = resolveNearbyFacilityCoordinates(facility);
      if (coords) map[facility.id] = formatDistanceKm(calculateDistanceKm(userLocation, coords));
    }
    return map;
  }, [results, userLocation]);

  return (
    <section aria-labelledby="specialty-refinements">
      <h2 className="sr-only" id="specialty-refinements">
        Refine these results
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <Pill
          ariaPressed={openOnly}
          onClick={() => setOpenOnly((value) => !value)}
          className="min-h-11"
          size="lg"
          variant={openOnly ? "selected" : "default"}
        >
          Open now
        </Pill>

        {/* Nearest first is only meaningful once coordinates exist. Rather than
            showing a dead control, the ungranted state asks for location and
            turns itself on as soon as it arrives. */}
        <Pill
          ariaPressed={distanceReady ? nearestFirst : undefined}
          onClick={() => {
            if (distanceReady) {
              setNearestFirst((value) => !value);
              return;
            }
            setNearestFirst(true);
            requestLocation();
          }}
          className="min-h-11"
          size="lg"
          variant={distanceReady && nearestFirst ? "selected" : "default"}
        >
          <MapPinIcon aria-hidden="true" className="size-3.5 shrink-0" />
          {locationState === "loading"
            ? "Finding you…"
            : distanceReady
              ? "Nearest first"
              : locationState === "denied"
                ? "Nearest first (location off)"
                : "Nearest first"}
        </Pill>

        {availableTypes.length > 1 ? (
          <>
            <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-border" />
            <Pill
              ariaPressed={typeKey === "all"}
              onClick={() => setTypeKey("all")}
              className="min-h-11"
              size="lg"
              variant={typeKey === "all" ? "selected" : "default"}
            >
              All types
            </Pill>
            {availableTypes.map((key) => (
              <Pill
                ariaPressed={typeKey === key}
                key={key}
                onClick={() => setTypeKey(key)}
                className="min-h-11"
                size="lg"
                variant={typeKey === key ? "selected" : "default"}
              >
                {TYPE_LABELS[key]}
              </Pill>
            ))}
          </>
        ) : null}
      </div>

      {locationState === "denied" && nearestFirst ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Location is turned off for this site, so these stay in their default
          order. Allow location in your browser settings to sort by distance.
        </p>
      ) : null}

      <div aria-live="polite" className="sr-only">
        {results.length} {results.length === 1 ? "facility" : "facilities"} shown
      </div>

      <div className="mt-5">
        {results.length > 0 ? (
          <FacilityCardGrid
            distanceByFacilityId={distanceByFacilityId}
            facilities={results}
            highlightByFacilityId={highlightByFacilityId}
          />
        ) : (
          <EmptyState
            action={
              openOnly || typeKey !== "all" ? (
                <button
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => {
                    setOpenOnly(false);
                    setTypeKey("all");
                  }}
                  type="button"
                >
                  Clear refinements
                </button>
              ) : undefined
            }
            description="Try clearing the refinements, or browse the full directory."
            icon={<SearchIcon />}
            title={`No ${specialtyLabel.toLowerCase()} facilities match those refinements`}
          />
        )}
      </div>
    </section>
  );
}
