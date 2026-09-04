"use client";

import type { ReactNode } from "react";
import { MapPinIcon } from "@/components/cards/contact-icons";
import { Pill } from "@/components/ui/Pill";
import { LISTING_TYPE_LABELS } from "@/lib/listing-refinements";
import type { LocationState } from "@/lib/useGeolocation";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";

// Controlled: every piece of state lives in the caller (specialty pages'
// own useState, /search's URL-params for typeKey specifically) — this
// component only renders the row and reports intent, so the two pages can
// keep each field's actual source of truth wherever makes sense for them
// while sharing one visual and interaction implementation.
type ListingRefinementPillsProps = {
  openOnly: boolean;
  onToggleOpenOnly: () => void;
  nearestFirst: boolean;
  locationState: LocationState;
  onToggleNearestFirst: () => void;
  typeKey: FacilityCategoryFilter | "";
  onSelectType: (key: FacilityCategoryFilter | "") => void;
  availableTypes: FacilityCategoryFilter[];
  // Extra pills a caller needs in the same flex-wrap row — e.g. specialty
  // pages' mental-health branch refinement, which is specific to one
  // specialty and has no place in a shared component. Rendered after the
  // type pills, inside the same row so wrapping behaves as one group.
  children?: ReactNode;
};

export function ListingRefinementPills({
  openOnly,
  onToggleOpenOnly,
  nearestFirst,
  locationState,
  onToggleNearestFirst,
  typeKey,
  onSelectType,
  availableTypes,
  children,
}: ListingRefinementPillsProps) {
  const distanceReady = locationState === "ready";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Pill
          ariaPressed={openOnly}
          onClick={onToggleOpenOnly}
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
          onClick={onToggleNearestFirst}
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

        {children}

        {availableTypes.length > 1 ? (
          <>
            <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-border" />
            <Pill
              ariaPressed={typeKey === ""}
              onClick={() => onSelectType("")}
              className="min-h-11"
              size="lg"
              variant={typeKey === "" ? "selected" : "default"}
            >
              All types
            </Pill>
            {availableTypes.map((key) => (
              <Pill
                ariaPressed={typeKey === key}
                key={key}
                onClick={() => onSelectType(key)}
                className="min-h-11"
                size="lg"
                variant={typeKey === key ? "selected" : "default"}
              >
                {LISTING_TYPE_LABELS[key]}
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
    </>
  );
}
