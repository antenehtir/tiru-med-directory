"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState, SearchIcon } from "@/components/ui/EmptyState";
import { SkeletonCardGrid } from "@/components/ui/Skeleton";
import type { NearbyFacility } from "@/components/nearby/NearbyPage";
import { filterFacilitiesBySpecialtyKeyword } from "@/lib/frontend-search-filters";
import { calculateDistanceKm, formatDistanceKm, type Coordinates } from "@/lib/nearby-distance";
import type { LocationState } from "@/lib/useGeolocation";

const RESULT_CAP = 3;

// One generic section, instantiated per specialty from Homepage.tsx rather
// than four bespoke components. Reuses the exact same specialty-matching
// production code /facilities already uses (filterFacilitiesBySpecialtyKeyword
// -> specialtyMatchesAliases -> SPECIALTY_ALIAS_MAP, which for "General
// Surgery" now points at the shared SURGERY_ALIASES constant) rather than a
// third parallel matcher. No new coordinate resolution either — facilities
// arrive already coordinate-resolved via resolveNearbyFacilityCoordinates,
// the same helper /nearby uses, threaded through from app/page.tsx.
export function SpecialtyNearMeSection({
  eyebrow,
  heading,
  specialtyLabel,
  facilities,
  locationState,
  userLocation,
}: {
  eyebrow: string;
  heading: string;
  specialtyLabel: string;
  facilities: NearbyFacility[];
  locationState: LocationState;
  userLocation: Coordinates | null;
}) {
  const matched = useMemo(
    // filterFacilitiesBySpecialtyKeyword is typed over the base Facility[]
    // shape (it's shared with /facilities, which has no notion of
    // coordinates), but it's a pure filter over this exact input array, so
    // the returned objects are still the same NearbyFacility references at
    // runtime — this cast just restores what TS's structural typing dropped.
    () => filterFacilitiesBySpecialtyKeyword(facilities, specialtyLabel) as NearbyFacility[],
    [facilities, specialtyLabel],
  );

  const cards = useMemo(() => {
    if (userLocation) {
      // Sorted: nearest first, distance shown on the card.
      return matched
        .filter((f) => f.coordinates)
        .map((facility) => ({
          facility,
          distanceKm: calculateDistanceKm(userLocation, facility.coordinates!),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, RESULT_CAP);
    }
    // No location (idle/denied/unsupported/timeout): specialty-filtered but
    // unsorted, natural DB order, no distance label, no manual area picker —
    // per the earlier decision on the generic "Care near you" fallback.
    return matched.slice(0, RESULT_CAP).map((facility) => ({ facility, distanceKm: undefined as number | undefined }));
  }, [matched, userLocation]);

  // Zero raw matches for this specialty. Not expected given the audited
  // counts (13-27 facilities per specialty, 100% coordinate validity), but
  // handled defensively rather than assumed unreachable.
  if (locationState !== "loading" && matched.length === 0) return null;

  const seeMoreHref = `/facilities?specialty=${encodeURIComponent(specialtyLabel)}`;

  return (
    <section aria-labelledby={`${specialtyLabel}-near-you-heading`} className="bg-transparent">
      <PageContainer className="py-8 sm:py-10 lg:py-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>
            <h2 id={`${specialtyLabel}-near-you-heading`} className="font-display text-[1.75rem] font-semibold leading-tight text-foreground sm:text-3xl">
              {heading}
            </h2>
          </div>
          <Link className="inline-flex shrink-0 items-center rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-soft-accent hover:text-primary-hover" href={seeMoreHref}>
            See more <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>

        {locationState === "loading" ? (
          <SkeletonCardGrid count={RESULT_CAP} />
        ) : cards.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ facility, distanceKm }) => (
              <FacilityCard
                distanceLabel={distanceKm !== undefined ? formatDistanceKm(distanceKm) : undefined}
                facility={facility}
                key={facility.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            description={`No ${specialtyLabel.toLowerCase()} providers with location data yet.`}
            icon={<SearchIcon />}
            title="No matches found"
          />
        )}
      </PageContainer>
    </section>
  );
}
