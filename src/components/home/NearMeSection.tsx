"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MapPinIcon } from "@/components/cards/contact-icons";
import {
  facilityCategoryBadgeLabels,
  facilityMonogram,
  facilityPlateClasses,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { MapPinOffIcon } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { NearbyFacility, NearbySpecialist } from "@/components/nearby/NearbyPage";
import { formatDoctorDisplayName } from "@/lib/provider/doctor-types";
import { personInitials } from "@/lib/person-initials";
import { calculateDistanceKm, formatDistanceKm } from "@/lib/nearby-distance";
import { useGeolocation } from "@/lib/useGeolocation";

// Homepage preview of what /nearby does at full scale: real distance-sorted
// results, right on the page that promises "Find nearby care" — not just a
// button that takes the promise on faith. Facilities and specialists are
// ranked into ONE combined, distance-sorted list rather than two separate
// rows: the specialist directory is sparse today (most facilities have no
// doctors.jsonb entries at all), so a dedicated specialists row would read
// as broken/empty most of the time. Merged, a specialist just take their
// rightful spot in the ranking when one exists nearby, and the section never
// has an empty column to explain.
const MAX_RESULTS = 8;

type RankedItem =
  | { kind: "facility"; distanceKm: number; facility: NearbyFacility }
  | { kind: "specialist"; distanceKm: number; specialist: NearbySpecialist };

export function NearMeSection({
  facilities,
  specialists,
}: {
  facilities: NearbyFacility[];
  specialists: NearbySpecialist[];
}) {
  const { locationState, userLocation, requestLocation } = useGeolocation();

  const ranked = useMemo<RankedItem[]>(() => {
    if (!userLocation) return [];

    const facilityItems: RankedItem[] = facilities
      .filter((f) => f.coordinates)
      .map((facility) => ({
        kind: "facility",
        distanceKm: calculateDistanceKm(userLocation, facility.coordinates!),
        facility,
      }));

    const specialistItems: RankedItem[] = specialists
      .filter((s) => s.coordinates)
      .map((specialist) => ({
        kind: "specialist",
        distanceKm: calculateDistanceKm(userLocation, specialist.coordinates!),
        specialist,
      }));

    return [...facilityItems, ...specialistItems]
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, MAX_RESULTS);
  }, [facilities, specialists, userLocation]);

  // Nothing useful to show and nothing actionable to ask for — don't spend
  // homepage space on an empty section.
  if (locationState === "ready" && ranked.length === 0) return null;

  return (
    <section className="bg-transparent">
      <PageContainer className="py-8 sm:py-10 lg:py-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-[2rem] font-semibold leading-[1.1] text-foreground">
            Near you right now
          </h2>
          <Link
            className="-mr-2 inline-flex shrink-0 items-center rounded-lg px-2 py-2 text-sm font-medium text-primary transition-colors hover:bg-soft-accent hover:text-primary-hover"
            href="/nearby"
          >
            See all nearby →
          </Link>
        </div>

        {locationState === "idle" || locationState === "loading" ? (
          <LoadingStrip />
        ) : locationState === "ready" ? (
          <ResultStrip items={ranked} />
        ) : (
          <LocationPrompt locationState={locationState} onRetry={requestLocation} />
        )}
      </PageContainer>
    </section>
  );
}

function LoadingStrip() {
  // Height matches the real tile (176x141, measured from ResultStrip's actual
  // rendered output) so the loading -> ready swap doesn't jump the layout.
  return (
    <div aria-hidden="true" className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          className="h-[141px] w-44 shrink-0 animate-pulse rounded-card border border-border bg-muted"
          key={i}
        />
      ))}
    </div>
  );
}

function LocationPrompt({
  locationState,
  onRetry,
}: {
  locationState: "timeout" | "denied" | "unsupported";
  onRetry: () => void;
}) {
  const copy =
    locationState === "unsupported"
      ? {
          title: "Location isn't supported in this browser",
          action: null,
        }
      : locationState === "denied"
        ? {
            title: "Turn on location to see care near you",
            action: (
              <Link
                className="inline-flex min-h-9 shrink-0 items-center rounded-control border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-strong-border hover:bg-muted"
                href="/nearby"
              >
                How to enable
              </Link>
            ),
          }
        : {
            title: "Couldn't get a location fix in time",
            action: (
              <button
                className="inline-flex min-h-9 shrink-0 items-center rounded-control border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-strong-border hover:bg-muted"
                onClick={onRetry}
                type="button"
              >
                Try again
              </button>
            ),
          };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-dashed border-strong-border bg-sunken px-5 py-4">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MapPinOffIcon className="size-4 shrink-0" />
        {copy.title}
      </p>
      {copy.action}
    </div>
  );
}

function ResultStrip({ items }: { items: RankedItem[] }) {
  return (
    <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 min-[360px]:-mx-4 min-[360px]:px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) =>
        item.kind === "facility" ? (
          <FacilityTile
            distanceKm={item.distanceKm}
            facility={item.facility}
            key={`f-${item.facility.id}`}
          />
        ) : (
          <SpecialistTile
            distanceKm={item.distanceKm}
            key={`s-${item.specialist.id}`}
            specialist={item.specialist}
          />
        ),
      )}
    </div>
  );
}

function TileShell({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className="w-44 shrink-0 snap-start rounded-card border border-border bg-card p-3 shadow-card transition-all duration-150 hover:-translate-y-px hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none"
      href={href}
    >
      {children}
    </Link>
  );
}

function DistanceLine({ distanceKm }: { distanceKm: number }) {
  return (
    <p className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-primary">
      <MapPinIcon className="size-3.5 shrink-0" />
      {formatDistanceKm(distanceKm)}
    </p>
  );
}

function FacilityTile({
  facility,
  distanceKm,
}: {
  facility: NearbyFacility;
  distanceKm: number;
}) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);

  return (
    <TileShell href={facility.detailHref ?? `/facilities/${facility.slug}`}>
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${facilityPlateClasses[categoryKey]}`}
      >
        {facilityMonogram(facility.name)}
      </div>
      <p className="mt-2 truncate font-display text-[15px] font-semibold leading-tight text-foreground">
        {facility.name}
      </p>
      <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
        {facilityCategoryBadgeLabels[categoryKey]}
      </p>
      <DistanceLine distanceKm={distanceKm} />
    </TileShell>
  );
}

function SpecialistTile({
  specialist,
  distanceKm,
}: {
  specialist: NearbySpecialist;
  distanceKm: number;
}) {
  return (
    <TileShell href={`/specialists/${specialist.slug}`}>
      {specialist.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="size-10 shrink-0 rounded-full border border-border object-cover"
          src={specialist.photoUrl}
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-soft-accent font-display text-sm font-bold text-primary">
          {personInitials(specialist.fullName)}
        </div>
      )}
      <p className="mt-2 truncate font-display text-[15px] font-semibold leading-tight text-foreground">
        {formatDoctorDisplayName(specialist.title, specialist.fullName)}
      </p>
      <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
        {specialist.specialty || specialist.facilityName}
      </p>
      <DistanceLine distanceKm={distanceKm} />
    </TileShell>
  );
}
