"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import {
  createPublicContactActions,
  getExternalLinkProps,
} from "@/lib/contact-actions";
import {
  calculateDistanceKm,
  formatDistanceKm,
  type Coordinates,
} from "@/lib/nearby-distance";
import type { Facility } from "@/types/facility";

export type NearbyFacility = Facility & {
  coordinates?: Coordinates;
};

type NearbyPageProps = {
  areaOptions: string[];
  facilities: NearbyFacility[];
  initialCategory: string;
  selectedArea: string;
};

type LocationState = "idle" | "loading" | "ready" | "denied" | "unsupported";

const categoryOptions = [
  { label: "All", value: "all" },
  { label: "General Hospitals", value: "hospital" },
  { label: "Specialty Centers", value: "specialty" },
  { label: "Clinics", value: "clinic" },
  { label: "Doctors", value: "doctors" },
  { label: "Diagnostics", value: "diagnostics" },
  { label: "Pharmacies", value: "pharmacies" },
];

export function NearbyPage({
  areaOptions,
  facilities,
  initialCategory,
  selectedArea,
}: NearbyPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isAreaBrowseOpen, setIsAreaBrowseOpen] = useState(Boolean(selectedArea));

  const categoryFacilities = useMemo(
    () => filterFacilitiesByCategory(facilities, selectedCategory),
    [facilities, selectedCategory],
  );

  const rankedFacilities = useMemo(() => {
    if (!userLocation) {
      return [];
    }

    return categoryFacilities
      .filter((facility) => facility.coordinates)
      .map((facility) => ({
        facility,
        distanceKm: calculateDistanceKm(userLocation, facility.coordinates!),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }, [categoryFacilities, userLocation]);

  const unavailableDistanceFacilities = categoryFacilities.filter(
    (facility) => !facility.coordinates,
  );
  const coordinateBackedCount = categoryFacilities.length - unavailableDistanceFacilities.length;
  const areaFacilities = selectedArea
    ? categoryFacilities.filter((facility) => facility.location === selectedArea)
    : [];

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setLocationState("unsupported");
      return;
    }

    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationState("ready");
      },
      () => {
        setLocationState("denied");
        setUserLocation(null);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 },
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5 px-3 py-6 min-[360px]:px-4 sm:px-6 sm:py-10 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_70px_rgba(17,24,39,0.06)]">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Nearby care
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl">
                Find care near your current location.
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                Choose a category, share your location, and see real facilities
                with available coordinates nearest first.
              </p>
            </div>
            <div className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 text-sm leading-6 text-[#0F766E]">
              Distance is available for facilities with coordinates. Other
              facilities remain available through area browsing and search.
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
            <p className="text-sm font-semibold text-foreground">
              1. Choose category
            </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categoryOptions.map((category) => {
            const isActive = category.value === selectedCategory;

            return (
              <button
                aria-pressed={isActive}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-strong-border"
                }`}
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                type="button"
              >
                {category.label}
              </button>
            );
          })}
        </div>

            <p className="mt-5 text-sm font-semibold text-foreground">
              2. Share location
            </p>
        <button
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
          disabled={locationState === "loading"}
          onClick={requestLocation}
          type="button"
        >
          {locationState === "loading" ? "Finding nearby care..." : "Use my location"}
        </button>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {coordinateBackedCount} matching facilities currently have
              distance-ready coordinates.
            </p>

        {locationState === "denied" ? (
          <p className="mt-4 rounded-xl border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
            Location access was not shared. You can still browse by Sub-city /
            Area below.
          </p>
        ) : null}

        {locationState === "unsupported" ? (
          <p className="mt-4 rounded-xl border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
            Location is not available in this browser. Browse by Sub-city / Area
            below.
          </p>
        ) : null}
          </div>
        </div>
      </section>

      {locationState === "ready" ? (
        <section className="grid gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Nearest matching facilities
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Distances are shown only where real coordinates are available.
            </p>
          </div>

          {rankedFacilities.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rankedFacilities.map(({ facility, distanceKm }) => (
                <NearbyFacilityCard
                  distanceLabel={formatDistanceKm(distanceKm)}
                  facility={facility}
                  key={facility.id}
                />
              ))}
            </div>
          ) : (
            <EmptyNearbyState message="No matching facilities with coordinates are available yet." />
          )}

          {unavailableDistanceFacilities.length > 0 ? (
            <section className="rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
              {unavailableDistanceFacilities.length} matching facilities do not
              have distance-ready coordinates yet. Use Browse by Area below to
              find them without showing fake distance.
            </section>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold leading-tight text-foreground">
              Browse by area instead
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Secondary fallback for records without coordinates or when
              location access is unavailable.
            </p>
          </div>
          <button
            className="min-h-11 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border"
            onClick={() => setIsAreaBrowseOpen((current) => !current)}
            type="button"
          >
            {isAreaBrowseOpen ? "Hide areas" : "Browse by area"}
          </button>
        </div>

        {isAreaBrowseOpen ? (
          areaOptions.length > 0 ? (
            <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {areaOptions.map((area) => {
                const isActive = area === selectedArea;
                const href =
                  selectedCategory === "all"
                    ? `/nearby?area=${encodeURIComponent(area)}`
                    : `/nearby?area=${encodeURIComponent(area)}&category=${selectedCategory}`;

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-strong-border"
                    }`}
                    href={href}
                    key={area}
                  >
                    {area}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Area options will be added soon.
            </p>
          )
        ) : null}
      </section>

      {selectedArea ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Facilities in {selectedArea}
          </h2>
          {areaFacilities.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {areaFacilities.map((facility) => (
                <NearbyFacilityCard
                  distanceLabel={
                    facility.coordinates
                      ? "Use my location for distance"
                      : "Distance unavailable"
                  }
                  facility={facility}
                  key={facility.id}
                />
              ))}
            </div>
          ) : (
            <EmptyNearbyState message="No matching facilities found for this area yet." />
          )}
        </section>
      ) : null}
    </main>
  );
}

function NearbyFacilityCard({
  distanceLabel,
  facility,
}: {
  distanceLabel: string;
  facility: NearbyFacility;
}) {
  const contactActions = createPublicContactActions(facility.contactChannels);
  const callAction = contactActions.find((action) => action.kind === "phone");
  const mapAction = contactActions.find((action) => action.kind === "maps");

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {facility.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground">
            {facility.name}
          </h3>
        </div>
        <VerificationBadge status={facility.verificationStatus} />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#0F766E]">
        {distanceLabel}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {facility.location || facility.address}
      </p>

      <div className="mt-auto grid gap-2 pt-4">
        <Link
          className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          href={facility.detailHref ?? `/facilities/${facility.slug}`}
        >
          View details
        </Link>
        <div className="grid gap-2 min-[420px]:grid-cols-2">
          {callAction ? (
            <a
              className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border"
              href={callAction.href}
              {...getExternalLinkProps(callAction)}
            >
              {callAction.label}
            </a>
          ) : null}
          {mapAction ? (
            <a
              className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border"
              href={mapAction.href}
              {...getExternalLinkProps(mapAction)}
            >
              Open map
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function EmptyNearbyState({ message }: { message: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
      <p className="text-sm font-medium leading-6 text-muted-foreground">
        {message}
      </p>
    </section>
  );
}

function filterFacilitiesByCategory(
  facilities: NearbyFacility[],
  category: string,
): NearbyFacility[] {
  if (category === "all") {
    return facilities;
  }

  if (category === "doctors") {
    return [];
  }

  return facilities.filter((facility) => {
    const searchableText = [
      facility.category,
      facility.subcategory,
      facility.name,
      ...facility.services,
    ]
      .join(" ")
      .toLowerCase();

    if (category === "hospital") {
      return searchableText.includes("hospital");
    }

    if (category === "specialty") {
      return searchableText.includes("specialty");
    }

    if (category === "clinic") {
      return (
        searchableText.includes("clinic") ||
        searchableText.includes("health center") ||
        searchableText.includes("primary care")
      );
    }

    if (category === "diagnostics") {
      return /diagnostic|laboratory|lab|imaging|radiology/.test(searchableText);
    }

    if (category === "pharmacies") {
      return searchableText.includes("pharmacy");
    }

    return true;
  });
}
