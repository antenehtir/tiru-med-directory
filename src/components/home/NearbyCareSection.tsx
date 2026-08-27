"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { MapPinIcon } from "@/components/cards/contact-icons";
import { resolveFacilityCardCategoryKey } from "@/components/cards/facility-category-style";
import { PageContainer } from "@/components/layout/PageContainer";
import type { NearbyFacility } from "@/components/nearby/NearbyPage";
import { MapPinOffIcon } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { SkeletonCardGrid } from "@/components/ui/Skeleton";
import { specialtyMatchesAliases } from "@/lib/frontend-search-filters";
import { calculateDistanceKm, formatDistanceKm } from "@/lib/nearby-distance";
import type { LocationState } from "@/lib/useGeolocation";
import type { Facility } from "@/types/facility";
import { useHomeLocation } from "./HomeLocationProvider";

const VISIBLE_COUNT = 6;

function mergedTags(facility: Facility): string {
  const custom = Object.values(facility.customServiceCategories ?? {}).flat();
  return Array.from(new Set([...facility.services, ...custom]))
    .filter(Boolean)
    .join(" ");
}

// Specialty is a filter the user chooses rather than four fixed
// "<Specialty> near you" sections stacked down the page. Only specialties
// whose alias matching has actually been audited are offered: Internal
// Medicine (16 facilities), Pediatrics (27), General Surgery (20) and
// Gynecology & Obstetrics (13). Surgery and Gyn-Obs were re-verified after
// their alias lists were consolidated and the OBGYN spelling was added, so
// all four are backed by verified matching.
//
// Clinics are deliberately absent: the taxonomy has a "clinic" key but zero
// live facilities resolve to it, so that filter would always come back empty.
const FILTERS: {
  id: string;
  label: string;
  match: (facility: NearbyFacility) => boolean;
}[] = [
  { id: "all", label: "All", match: () => true },
  {
    id: "hospital",
    label: "Hospitals",
    match: (f) => resolveFacilityCardCategoryKey(f) === "hospital",
  },
  {
    id: "specialty",
    label: "Specialty centers",
    match: (f) => resolveFacilityCardCategoryKey(f) === "specialty",
  },
  {
    id: "diagnostics",
    label: "Diagnostics",
    match: (f) => resolveFacilityCardCategoryKey(f) === "diagnostics",
  },
  {
    id: "pediatrics",
    label: "Pediatrics",
    match: (f) => specialtyMatchesAliases(mergedTags(f), "Pediatrics"),
  },
  {
    id: "surgery",
    label: "Surgery",
    match: (f) => specialtyMatchesAliases(mergedTags(f), "General Surgery"),
  },
  {
    id: "internal-medicine",
    label: "Internal medicine",
    match: (f) => specialtyMatchesAliases(mergedTags(f), "Internal Medicine"),
  },
  {
    id: "gyn-obs",
    label: "Gynecology & obstetrics",
    match: (f) => specialtyMatchesAliases(mergedTags(f), "Gynecology & Obstetrics"),
  },
];

export function NearbyCareSection({ facilities }: { facilities: NearbyFacility[] }) {
  const { locationState, userLocation } = useHomeLocation();
  const [activeFilter, setActiveFilter] = useState("all");

  const ranked = useMemo(() => {
    if (!userLocation) return [];
    const filter = FILTERS.find((entry) => entry.id === activeFilter) ?? FILTERS[0];
    return facilities
      .filter((facility) => facility.coordinates && filter.match(facility))
      .map((facility) => ({
        facility,
        distanceKm: calculateDistanceKm(userLocation, facility.coordinates!),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, VISIBLE_COUNT);
  }, [facilities, userLocation, activeFilter]);

  const isReady = locationState === "ready" && Boolean(userLocation);

  return (
    <section aria-labelledby="nearby-care-heading" className="bg-transparent" id="nearby-care">
      <PageContainer className="py-8 sm:py-10 lg:py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2
              className="font-display text-[1.75rem] font-semibold leading-tight text-foreground sm:text-3xl"
              id="nearby-care-heading"
            >
              Care near you
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Facilities closest to your location, sorted by distance.
            </p>
          </div>
          <Link
            className="inline-flex shrink-0 items-center rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-soft-accent hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="/nearby"
          >
            View all nearby facilities <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>

        {isReady ? (
          <>
            {/* Filters only render once there are results to filter — showing
                them above an empty permission prompt would imply the page is
                already listing something. */}
            <div
              aria-label="Filter nearby care by type"
              className="-mx-3 mb-5 flex gap-2 overflow-x-auto px-3 pb-1 min-[360px]:-mx-4 min-[360px]:px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
              role="group"
            >
              {FILTERS.map((filter) => (
                <Pill
                  ariaPressed={filter.id === activeFilter}
                  className="min-h-11 shrink-0 whitespace-nowrap"
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  size="lg"
                  variant={filter.id === activeFilter ? "selected" : "default"}
                >
                  {filter.label}
                </Pill>
              ))}
            </div>

            <div aria-live="polite" className="sr-only">
              {ranked.length} nearby {ranked.length === 1 ? "facility" : "facilities"} shown
            </div>

            {ranked.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ranked.map(({ facility, distanceKm }) => (
                  <FacilityCard
                    distanceLabel={formatDistanceKm(distanceKm)}
                    facility={facility}
                    key={facility.id}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-card border border-border bg-sunken px-5 py-6 text-center">
                <p className="text-sm font-semibold text-foreground">
                  Nothing in this category near you yet
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Try another filter, or browse the full directory.
                </p>
              </div>
            )}
          </>
        ) : locationState === "loading" ? (
          <SkeletonCardGrid count={3} />
        ) : (
          <LocationPrompt locationState={locationState} />
        )}
      </PageContainer>
    </section>
  );
}

// The single location request lives in the hero, so this section never
// renders a location button of its own — a second "Use my location" here is
// exactly the duplicate action this restructure removes. It explains the
// current state and offers only a non-location escape hatch; retrying is done
// with the hero control, which re-offers itself for every non-ready state.
function LocationPrompt({ locationState }: { locationState: LocationState }) {
  const copy =
    locationState === "denied"
      ? {
          title: "Location access is off",
          detail:
            "Enable location permission in your browser settings, then use the location button above to see the facilities closest to you.",
        }
      : locationState === "unsupported"
        ? {
            title: "Location is not supported in this browser",
            detail: "You can still search the directory or browse all facilities.",
          }
        : locationState === "timeout"
          ? {
              title: "Could not get a location fix",
              detail:
                "Try the location button above again, or browse the full directory instead.",
            }
          : {
              title: "See the care closest to you",
              detail:
                "Use the location button above and this section will list nearby facilities, sorted by distance.",
            };

  const isPrompt = locationState === "idle";

  return (
    <div className="flex flex-col gap-4 rounded-card border border-dashed border-strong-border bg-sunken px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {isPrompt ? (
            <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
          ) : (
            <MapPinOffIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          )}
          {copy.title}
        </p>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{copy.detail}</p>
      </div>
      <Link
        className="inline-flex min-h-11 shrink-0 items-center rounded-control border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        href="/facilities"
      >
        Browse all facilities
      </Link>
    </div>
  );
}
