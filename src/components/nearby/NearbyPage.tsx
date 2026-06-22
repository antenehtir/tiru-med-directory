"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPinIcon, PhoneIcon } from "@/components/cards/contact-icons";
import { ShareButton } from "@/components/cards/ShareButton";
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

type LocationState =
  | "idle"
  | "loading"
  | "timeout"
  | "ready"
  | "denied"
  | "unsupported";

const LOCATION_TIMEOUT_MS = 8000;

const categoryOptions = [
  { label: "All", value: "all" },
  { label: "General Hospitals", value: "hospital" },
  { label: "Specialty Centers", value: "specialty" },
  { label: "Clinics", value: "clinic" },
  { label: "Specialists", value: "doctors" },
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
  const [areaBrowseOverride, setAreaBrowseOverride] = useState<boolean | null>(null);
  const [isLocationTipOpen, setIsLocationTipOpen] = useState(false);
  const hasRequestedLocationRef = useRef(false);
  const locationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const areaBrowseSectionRef = useRef<HTMLElement>(null);

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

  const areaFacilities = selectedArea
    ? categoryFacilities.filter((facility) => facility.location === selectedArea)
    : [];

  const activeCategoryLabel =
    selectedCategory === "all"
      ? "healthcare"
      : categoryOptions.find((category) => category.value === selectedCategory)
          ?.label ?? "healthcare";

  const shouldAutoOpenAreaBrowse =
    Boolean(selectedArea) ||
    (locationState === "ready" && rankedFacilities.length === 0);
  const isAreaBrowseOpen = areaBrowseOverride ?? shouldAutoOpenAreaBrowse;

  const clearLocationTimeout = useCallback(() => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationState("unsupported");
      return;
    }

    clearLocationTimeout();
    setLocationState("loading");
    locationTimeoutRef.current = setTimeout(() => {
      setLocationState((current) => (current === "loading" ? "timeout" : current));
    }, LOCATION_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearLocationTimeout();
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationState("ready");
      },
      () => {
        clearLocationTimeout();
        setLocationState("denied");
        setUserLocation(null);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 },
    );
  }, [clearLocationTimeout]);

  const scrollToAreaBrowse = useCallback(() => {
    setAreaBrowseOverride(true);
    areaBrowseSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

    return () => {
      clearLocationTimeout();
    };
  }, [clearLocationTimeout, requestLocation]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5 overflow-x-hidden px-3 py-6 min-[360px]:px-4 sm:px-6 sm:py-10 lg:px-8">
      <header>
        <p className="text-sm font-semibold text-primary">Near you</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Which care are you looking for?
        </h1>
      </header>

      <div className="flex max-w-full flex-wrap gap-2">
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

      {locationState === "idle" || locationState === "loading" ? (
        <p className="inline-flex w-fit items-center rounded-full bg-soft-accent px-4 py-2 text-sm font-semibold text-primary">
          Finding your location...
        </p>
      ) : null}

      {locationState === "timeout" ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Location is taking longer than expected.
          </p>
          <button
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
            onClick={requestLocation}
            type="button"
          >
            Try again
          </button>
          <button
            className="inline-flex min-h-9 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:border-strong-border"
            onClick={scrollToAreaBrowse}
            type="button"
          >
            Browse by sub-city &rarr;
          </button>
        </div>
      ) : null}

      {locationState === "denied" ? (
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm leading-6 text-muted-foreground">
              Enable location access to find the nearest care.
            </p>
            <button
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:border-strong-border"
              onClick={() => setIsLocationTipOpen((current) => !current)}
              type="button"
            >
              How to enable location
            </button>
          </div>
          {isLocationTipOpen ? (
            <p className="rounded-xl border border-border bg-muted p-3 text-sm leading-6 text-muted-foreground">
              In your browser address bar, tap the lock icon and allow Location.
            </p>
          ) : null}
        </div>
      ) : null}

      {locationState === "unsupported" ? (
        <p className="text-sm leading-6 text-muted-foreground">
          Location is not supported in this browser.
        </p>
      ) : null}

      {locationState === "ready" ? (
        <section className="grid gap-3">
          {rankedFacilities.length > 0 ? (
            <>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rankedFacilities.map(({ facility, distanceKm }) => (
                  <NearbyFacilityCard
                    distanceLabel={`📍 ${formatDistanceKm(distanceKm)}`}
                    facility={facility}
                    key={facility.id}
                  />
                ))}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                More providers coming to nearby soon.
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-primary/30 bg-soft-accent p-4">
              <p className="text-sm font-semibold leading-6 text-primary">
                📍 Coordinate data for {activeCategoryLabel} providers is being
                added.
              </p>
              <p className="mt-1 text-sm leading-6 text-primary">
                Browse by sub-city below to find care near you.
              </p>
            </div>
          )}
        </section>
      ) : null}

      <section
        className="rounded-2xl border border-border bg-card p-4 sm:p-5"
        ref={areaBrowseSectionRef}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold leading-tight text-foreground">
            Browse by sub-city
          </h2>
          <button
            className="min-h-11 w-full rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border sm:w-auto"
            onClick={() => setAreaBrowseOverride(!isAreaBrowseOpen)}
            type="button"
          >
            {isAreaBrowseOpen ? "Hide areas" : "Browse by sub-city"}
          </button>
        </div>

        {isAreaBrowseOpen && areaOptions.length > 0 ? (
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
                <NearbyFacilityCard facility={facility} key={facility.id} />
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              No matching facilities found for this area yet.
            </p>
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
  distanceLabel?: string;
  facility: NearbyFacility;
}) {
  const contactActions = createPublicContactActions(facility.contactChannels);
  const callAction = contactActions.find((action) => action.kind === "phone");
  const mapAction = contactActions.find((action) => action.kind === "maps");

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-[0_10px_26px_rgba(31,41,55,0.04)] transition active:scale-[0.98]">
      <VerificationBadge status={facility.verificationStatus} />
      <p className="mt-2 text-xs font-semibold text-muted-foreground">
        {facility.category}
      </p>
      <h3 className="mt-2 break-words text-lg font-semibold leading-snug text-foreground">
        {facility.name}
      </h3>

      {distanceLabel ? (
        <p className="mt-3 text-sm font-semibold text-primary">{distanceLabel}</p>
      ) : null}
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {facility.location || facility.address}
      </p>

      <div className="mt-4 flex gap-2 pt-1">
        {callAction ? (
          <a
            className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-center text-xs font-semibold text-foreground transition hover:border-strong-border"
            href={callAction.href}
            {...getExternalLinkProps(callAction)}
          >
            <PhoneIcon className="size-4 shrink-0" />
            Call
          </a>
        ) : null}
        {mapAction ? (
          <a
            className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-center text-xs font-semibold text-foreground transition hover:border-strong-border"
            href={mapAction.href}
            {...getExternalLinkProps(mapAction)}
          >
            <MapPinIcon className="size-4 shrink-0" />
            Map
          </a>
        ) : null}
        <ShareButton name={facility.name} slug={facility.slug} />
        <Link
          className="flex min-h-9 flex-1 items-center justify-center rounded-full bg-primary text-center text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
          href={facility.detailHref ?? `/facilities/${facility.slug}`}
        >
          View details
        </Link>
      </div>
    </article>
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
