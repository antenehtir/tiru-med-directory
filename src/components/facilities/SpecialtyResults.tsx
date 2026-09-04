"use client";

import { useMemo, useState } from "react";
import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import { ListingRefinementPills } from "@/components/facilities/ListingRefinementPills";
import { EmptyState, SearchIcon } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";
import {
  applyListingRefinements,
  availableListingTypes,
  distanceLabelsByFacilityId,
} from "@/lib/listing-refinements";
import {
  MENTAL_HEALTH_SPECIALTY,
  matchedServiceLabel,
  matchesMentalHealthBranch,
  rankBySpecialtyFocus,
  type MentalHealthBranch,
} from "@/lib/specialty-match";
import { useGeolocation } from "@/lib/useGeolocation";
import type { Facility } from "@/types/facility";

export function SpecialtyResults({
  facilities,
  specialty,
  specialtyLabel,
}: {
  facilities: Facility[];
  specialty: string;
  specialtyLabel: string;
}) {
  const [typeKey, setTypeKey] = useState<FacilityCategoryFilter | "">("");
  const [openOnly, setOpenOnly] = useState(false);
  const [nearestFirst, setNearestFirst] = useState(false);
  const [branch, setBranch] = useState<MentalHealthBranch | "all">("all");
  const { locationState, userLocation, requestLocation } = useGeolocation(false);

  // Only offered when the merged mental-health specialty is active AND both
  // sides actually have facilities — a refinement that can only ever return
  // everything, or nothing, is not a refinement.
  const branchCounts = useMemo(() => {
    if (specialty !== MENTAL_HEALTH_SPECIALTY) return null;
    const psychiatry = facilities.filter((f) => matchesMentalHealthBranch(f, "psychiatry")).length;
    const psychology = facilities.filter((f) => matchesMentalHealthBranch(f, "psychology")).length;
    return psychiatry > 0 && psychology > 0 ? { psychiatry, psychology } : null;
  }, [facilities, specialty]);

  // Branch is specialty-specific, so it's applied before handing off to the
  // shared open-now/type/nearest-first refinement, not folded into it.
  const branchFiltered = useMemo(
    () =>
      branch === "all"
        ? facilities
        : facilities.filter((facility) => matchesMentalHealthBranch(facility, branch)),
    [facilities, branch],
  );

  const availableTypes = useMemo(() => availableListingTypes(branchFiltered), [branchFiltered]);

  const results = useMemo(() => {
    const refined = applyListingRefinements(branchFiltered, {
      typeKey,
      openOnly,
      nearestFirst,
      userLocation,
    });
    // Distance sort (inside applyListingRefinements, when nearestFirst has
    // coordinates) replaces the specialist-first order rather than layering
    // on top of it: the visitor has asked for one ordering, and quietly
    // mixing the two would produce a list that satisfies neither.
    return nearestFirst && userLocation ? refined : rankBySpecialtyFocus(refined, specialty);
  }, [branchFiltered, typeKey, openOnly, nearestFirst, userLocation, specialty]);

  const highlightByFacilityId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const facility of results) {
      map[facility.id] = matchedServiceLabel(facility, specialty, specialtyLabel);
    }
    return map;
  }, [results, specialty, specialtyLabel]);

  // Once coordinates exist the card's locality slot should carry the distance,
  // exactly as it does on the homepage, rather than continuing to show the
  // sub-city the visitor has just superseded by asking for nearest-first.
  const distanceByFacilityId = useMemo(
    () => distanceLabelsByFacilityId(results, userLocation),
    [results, userLocation],
  );

  return (
    <section aria-labelledby="specialty-refinements">
      <h2 className="sr-only" id="specialty-refinements">
        Refine these results
      </h2>

      <ListingRefinementPills
        availableTypes={availableTypes}
        locationState={locationState}
        nearestFirst={nearestFirst}
        onSelectType={setTypeKey}
        onToggleNearestFirst={() => {
          if (locationState === "ready") {
            setNearestFirst((value) => !value);
            return;
          }
          setNearestFirst(true);
          requestLocation();
        }}
        onToggleOpenOnly={() => setOpenOnly((value) => !value)}
        openOnly={openOnly}
        typeKey={typeKey}
      >
        {branchCounts ? (
          <>
            <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-border" />
            <Pill
              ariaPressed={branch === "all"}
              className="min-h-11"
              onClick={() => setBranch("all")}
              size="lg"
              variant={branch === "all" ? "selected" : "default"}
            >
              Both
            </Pill>
            <Pill
              ariaPressed={branch === "psychiatry"}
              className="min-h-11"
              onClick={() => setBranch("psychiatry")}
              size="lg"
              variant={branch === "psychiatry" ? "selected" : "default"}
            >
              Psychiatry
            </Pill>
            <Pill
              ariaPressed={branch === "psychology"}
              className="min-h-11"
              onClick={() => setBranch("psychology")}
              size="lg"
              variant={branch === "psychology" ? "selected" : "default"}
            >
              Psychology
            </Pill>
          </>
        ) : null}
      </ListingRefinementPills>

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
              openOnly || typeKey !== "" || branch !== "all" ? (
                <button
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => {
                    setOpenOnly(false);
                    setTypeKey("");
                    setBranch("all");
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
