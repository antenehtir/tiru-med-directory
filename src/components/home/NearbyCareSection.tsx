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
// Every category is offered, by explicit request, including the thin ones:
// home care has 2 listings, pharmacy and ambulance 1 each. Clinic stays out
// because zero live facilities resolve to it, so that filter could never
// return anything.
//
// Worth knowing about Pharmacies specifically: the single pharmacy listing
// has sub_city "online", so it is excluded from coordinate resolution and
// this filter will return nothing regardless of where the user is standing.
// That lands on the section's own "Nothing in this category near you yet"
// empty state, which is an honest answer rather than a broken one.
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
    label: "Multi-specialty",
    match: (f) => resolveFacilityCardCategoryKey(f) === "specialty",
  },
  {
    id: "diagnostics",
    label: "Diagnostics",
    match: (f) => resolveFacilityCardCategoryKey(f) === "diagnostics",
  },
  {
    id: "home-care",
    label: "Home care",
    match: (f) => resolveFacilityCardCategoryKey(f) === "home-care",
  },
  {
    id: "pharmacy",
    label: "Pharmacies",
    match: (f) => resolveFacilityCardCategoryKey(f) === "pharmacy",
  },
  {
    id: "ambulance",
    label: "Ambulance",
    match: (f) => resolveFacilityCardCategoryKey(f) === "ambulance",
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
        {/* Stacked below sm. As a row, justify-between gave the shrink-0
            link its 199px first and left the heading 143px to wrap into, so
            "Care near you" broke across two lines and the link came to rest
            level with the third line of the description rather than with the
            heading it belongs to. The -ml-2 cancels the link's own px-2 so its
            text sits on the same optical left edge as the heading. */}
        <div className="mb-5 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h2
              className="font-display text-[1.75rem] font-semibold leading-tight text-balance text-foreground sm:text-3xl"
              id="nearby-care-heading"
            >
              Care near you
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Facilities closest to your location, sorted by distance.
            </p>
          </div>
          <Link
            className="-ml-2 inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-soft-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:ml-0"
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

// One job: tell someone how to turn location on. The request itself still
// lives only in the hero button, so this never renders a second
// "Use my location" of its own.
//
// Two states rather than four. Idle, timeout and unsupported all collapse
// into the same instruction, because pressing the hero button is what
// resolves all of them. A refusal is the one genuinely different case: once
// a browser has stored a denial the button cannot re-prompt, so telling
// someone to press it again would leave them stuck with no way forward.
//
// The "Browse all facilities" escape hatch that used to sit here is gone.
// The page already offers that route twice above this point — the hero's
// "Browse all care" and the category chip row — and this section's own
// header carries "View all nearby facilities". A fourth was noise.
function LocationPrompt({ locationState }: { locationState: LocationState }) {
  const isDenied = locationState === "denied";

  return (
    <div className="flex items-start gap-3 rounded-card border border-dashed border-strong-border bg-sunken px-5 py-6">
      {isDenied ? (
        <MapPinOffIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      ) : (
        <MapPinIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {isDenied
            ? "Location is turned off for this site"
            : "Turn on location to see care near you"}
        </p>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
          {isDenied
            ? "Your browser is blocking location for this site. Allow it in your browser settings, then use \u201CUse my location\u201D at the top of the page."
            : "Use \u201CUse my location\u201D at the top of the page, and this section will list the facilities closest to you, sorted by distance."}
        </p>
      </div>
    </div>
  );
}
