"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const hasRequestedLocationRef = useRef(false);

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
  const coordinateBackedCount =
    categoryFacilities.length - unavailableDistanceFacilities.length;
  const areaFacilities = selectedArea
    ? categoryFacilities.filter((facility) => facility.location === selectedArea)
    : [];

  const requestLocation = useCallback(() => {
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
  }, []);

  useEffect(() => {
    if (hasRequestedLocationRef.current) {
      return;
    }

    hasRequestedLocationRef.current = true;

    async function requestInitialLocation() {
      if (!("geolocation" in navigator)) {
        setLocationState("unsupported");
        return;
      }

      try {
        const permission = await navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        });

        if (permission?.state === "denied") {
          setLocationState("denied");
          return;
        }
      } catch {
        // Some browsers do not expose geolocation permission state before prompt.
      }

      requestLocation();
    }

    void requestInitialLocation();
  }, [requestLocation]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5 overflow-x-hidden px-3 py-6 min-[360px]:px-4 sm:px-6 sm:py-10 lg:px-8">
      <section className="w-full min-w-0 rounded-3xl border border-border bg-card p-5 shadow-[0_18px_46px_rgba(31,41,55,0.06)] sm:p-7 lg:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary">Care near you</p>
          <h1 className="mt-2 text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl">
            Find nearby care
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Which nearest facility are you looking for?
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Distance is shown for facilities with coordinates.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Facility type
            </p>
            <div className="mt-3 flex max-w-full flex-wrap justify-center gap-2 sm:justify-start">
              {categoryOptions.map((category) => {
                const isActive = category.value === selectedCategory;

                return (
                  <button
                    aria-pressed={isActive}
                    className={`inline-flex min-h-11 max-w-full items-center justify-center rounded-full border px-4 py-2.5 text-center text-sm font-semibold leading-tight transition ${
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
          </div>

          {locationState === "loading" || locationState === "idle" ? (
            <p className="rounded-2xl border border-primary/20 bg-soft-accent p-3 text-sm font-medium leading-6 text-primary">
              Finding nearest matching facilities...
            </p>
          ) : null}

          {locationState === "denied" ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-muted-foreground">
                Location access is needed to sort nearby facilities by distance.
              </p>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                onClick={requestLocation}
                type="button"
              >
                Allow location access
              </button>
            </div>
          ) : null}

          {locationState === "unsupported" ? (
            <p className="rounded-2xl border border-border bg-muted p-3 text-sm leading-6 text-muted-foreground">
              Location is not available in this browser. Browse by Sub-city / Area
              below.
            </p>
          ) : null}

          {locationState === "ready" ? (
            <p className="text-xs leading-5 text-muted-foreground">
              Distance is shown for facilities with coordinates.{" "}
              {coordinateBackedCount} matching facilities currently have
              distance-ready coordinates.
            </p>
          ) : null}
        </div>
      </section>

      {locationState === "ready" ? (
        <section className="grid gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Nearest care options
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Distances are shown only where real coordinates are available.
            </p>
          </div>

          {rankedFacilities.length > 0 ? (
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            className="min-h-11 w-full rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border sm:w-auto"
            onClick={() => setIsAreaBrowseOpen((current) => !current)}
            type="button"
          >
            {isAreaBrowseOpen ? "Hide areas" : "Browse by area"}
          </button>
        </div>

        {isAreaBrowseOpen ? (
          areaOptions.length > 0 ? (
            <div className="mt-4 grid max-h-64 min-w-0 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {areaOptions.map((area) => {
                const isActive = area === selectedArea;
                const href =
                  selectedCategory === "all"
                    ? `/nearby?area=${encodeURIComponent(area)}`
                    : `/nearby?area=${encodeURIComponent(area)}&category=${selectedCategory}`;

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`min-w-0 break-words rounded-xl border px-3 py-2 text-sm font-semibold ${
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
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {areaFacilities.map((facility) => (
                <NearbyFacilityCard
                  distanceLabel={
                    facility.coordinates
                      ? "Location needed for distance"
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
    <article className="flex min-w-0 flex-col rounded-3xl border border-border bg-card p-4 shadow-[0_10px_26px_rgba(31,41,55,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            {facility.category}
          </p>
          <h3 className="mt-2 break-words text-lg font-semibold leading-snug text-foreground">
            {facility.name}
          </h3>
        </div>
        <VerificationBadge status={facility.verificationStatus} />
      </div>

      <p className="mt-3 text-sm font-semibold text-primary">
        {distanceLabel}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {facility.location || facility.address}
      </p>

      <div className="mt-auto grid gap-2 pt-4">
        <Link
          className="flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          href={facility.detailHref ?? `/facilities/${facility.slug}`}
        >
          View details
        </Link>
        <div className="grid gap-2 min-[420px]:grid-cols-2">
          {callAction ? (
            <a
              className="flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border"
              href={callAction.href}
              {...getExternalLinkProps(callAction)}
            >
              {callAction.label}
            </a>
          ) : null}
          {mapAction ? (
            <a
              className="flex min-h-11 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border"
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
