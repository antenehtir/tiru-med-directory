"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinIcon, PhoneIcon } from "@/components/cards/contact-icons";
import { FacilityBanner } from "@/components/cards/FacilityCard";
import {
  facilityBorderGradientClasses,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { ShareButton } from "@/components/cards/ShareButton";
import { WorkingHoursIndicator } from "@/components/cards/WorkingHoursIndicator";
import { ListingStatusBanner } from "@/components/ui/ListingStatusBanner";
import {
  createPublicContactActions,
  getExternalLinkProps,
} from "@/lib/contact-actions";
import { SPECIALTY_OPTIONS } from "@/lib/constants/specialty-options";
import {
  extractSpecialtyMatchKeyword,
  specialtyMatchesAliases,
} from "@/lib/frontend-search-filters";
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
  facilities: NearbyFacility[];
  initialCategory: string;
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

const nearbySpecialtyOptions = SPECIALTY_OPTIONS.filter(
  (option) => option !== "Multiple specialties" && option !== "Other",
).map((option) => ({
  value: option,
  label: option === "General Surgery" ? "Surgery" : extractSpecialtyMatchKeyword(option),
}));

export function NearbyPage({
  facilities,
  initialCategory,
}: NearbyPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedNearbySpecialty, setSelectedNearbySpecialty] = useState("");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocationTipOpen, setIsLocationTipOpen] = useState(false);
  const hasRequestedLocationRef = useRef(false);
  const locationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationWatchRef = useRef<number | null>(null);

  const searchedFacilities = facilities;

  const categoryFacilities = useMemo(
    () => filterFacilitiesByCategory(searchedFacilities, selectedCategory),
    [searchedFacilities, selectedCategory],
  );

  const specialtyFilteredFacilities = useMemo(() => {
    if (selectedCategory !== "specialty" || !selectedNearbySpecialty) {
      return categoryFacilities;
    }

    return categoryFacilities.filter((facility) => {
      const specialtyText = [
        facility.category,
        facility.subcategory,
        facility.name,
        ...facility.services,
      ].join(" ");

      return specialtyMatchesAliases(specialtyText, selectedNearbySpecialty);
    });
  }, [categoryFacilities, selectedCategory, selectedNearbySpecialty]);

  const rankedFacilities = useMemo(() => {
    if (!userLocation) {
      return [];
    }

    return specialtyFilteredFacilities
      .filter((facility) => facility.coordinates)
      .map((facility) => ({
        facility,
        distanceKm: calculateDistanceKm(userLocation, facility.coordinates!),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }, [specialtyFilteredFacilities, userLocation]);

  const activeCategoryLabel =
    selectedCategory === "all"
      ? "healthcare"
      : categoryOptions.find((category) => category.value === selectedCategory)
          ?.label ?? "healthcare";

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

    let bestAccuracy = Infinity;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        clearLocationTimeout();

        // Only update if this reading is more accurate than the last
        if (position.coords.accuracy < bestAccuracy) {
          bestAccuracy = position.coords.accuracy;
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
        setLocationState("ready");

        // Once we have a good fix (under 50m), stop refining
        if (position.coords.accuracy <= 50) {
          navigator.geolocation.clearWatch(watchId);
        }
      },
      () => {
        clearLocationTimeout();
        setLocationState("denied");
        setUserLocation(null);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );

    locationWatchRef.current = watchId;
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, 20000);
  }, [clearLocationTimeout]);

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

      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
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

      <ListingStatusBanner />

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
              onClick={() => {
                setSelectedCategory(category.value);

                if (category.value !== "specialty") {
                  setSelectedNearbySpecialty("");
                }
              }}
              type="button"
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {selectedCategory === "specialty" ? (
        <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
          {[{ value: "", label: "All" }, ...nearbySpecialtyOptions].map((option) => {
            const isActive = selectedNearbySpecialty === option.value;

            return (
              <button
                aria-pressed={isActive}
                className={`inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-strong-border"
                }`}
                key={option.value || "all"}
                onClick={() => setSelectedNearbySpecialty(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}

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
              {selectedCategory === "pharmacies" ? (
                <>
                  <p className="text-sm font-semibold leading-6 text-primary">
                    🏥 Pharmacies are being onboarded to Tiru.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-primary">
                    We&apos;re actively adding pharmacies across Addis Ababa.{" "}
                    <Link className="underline underline-offset-2" href="/register">
                      List your pharmacy here
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold leading-6 text-primary">
                    📍 Coordinate data for {activeCategoryLabel} providers is being
                    added.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-primary">
                    Check back soon as we add more providers in your area.
                  </p>
                </>
              )}
            </div>
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
  const router = useRouter();
  const contactActions = createPublicContactActions(facility.contactChannels);
  const callAction = contactActions.find((action) => action.kind === "phone");
  const mapAction = contactActions.find((action) => action.kind === "maps");
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const borderGradientClass = facilityBorderGradientClasses[categoryKey];
  const detailHref = facility.detailHref ?? `/facilities/${facility.slug}`;

  function handleCardClick() {
    router.push(detailHref);
  }

  function stopProp(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
  }

  return (
    <article
      className={`group cursor-pointer rounded-2xl bg-gradient-to-br p-[1px] transition ${borderGradientClass}`}
      onClick={handleCardClick}
    >
      <div className="flex h-full min-w-0 flex-col rounded-2xl bg-card shadow-[0_10px_26px_rgba(31,41,55,0.04)] transition active:scale-[0.98] group-hover:shadow-md">
        <FacilityBanner facility={facility} heightClassName="h-24" />

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          {distanceLabel ? (
            <p className="text-sm font-semibold text-primary">{distanceLabel}</p>
          ) : null}
          <h3 className="break-words text-lg font-semibold leading-snug text-foreground">
            {facility.name}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {facility.location || facility.address}
          </p>

          {facility.services.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {facility.services.slice(0, 3).map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {service}
                </span>
              ))}
            </div>
          ) : null}

          {facility.workingHours?.trim() ? (
            <div className="mt-3">
              <WorkingHoursIndicator hours={facility.workingHours} />
            </div>
          ) : null}

          <div
            className="mt-auto flex gap-2 pt-4"
            onClick={stopProp}
            onTouchEnd={stopProp}
          >
            {callAction ? (
              <a
                className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-card text-center text-xs font-semibold text-foreground transition-all duration-150 hover:border-primary/60 hover:bg-primary/5 active:scale-95 active:border-primary active:bg-primary/10"
                href={callAction.href}
                {...getExternalLinkProps(callAction)}
              >
                <PhoneIcon className="size-4 shrink-0" />
                Call
              </a>
            ) : null}
            {mapAction ? (
              <a
                className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-card text-center text-xs font-semibold text-foreground transition-all duration-150 hover:border-primary/60 hover:bg-primary/5 active:scale-95 active:border-primary active:bg-primary/10"
                href={mapAction.href}
                {...getExternalLinkProps(mapAction)}
              >
                <MapPinIcon className="size-4 shrink-0" />
                Map
              </a>
            ) : null}
            <ShareButton name={facility.name} slug={facility.slug} />
            <Link
              className="flex min-h-9 flex-1 items-center justify-center rounded-full bg-primary text-center text-xs font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:scale-95"
              href={detailHref}
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// Maps each Nearby category chip value to the DB category strings it should match.
// The `category` field on each Facility record is already correctly set in the source
// data — match on it directly instead of text-searching name/services/subcategory.
const NEARBY_CATEGORY_DB_MAP: Record<string, string[]> = {
  hospital: ["General Hospital"],
  specialty: ["Specialty Center", "Medical Plaza"],
  clinic: ["Clinic", "Healthcare Facility"],
  diagnostics: ["Diagnostic Center"],
  pharmacies: ["Pharmacy"],
};

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

  const allowedCategories = NEARBY_CATEGORY_DB_MAP[category];

  if (!allowedCategories) {
    return facilities;
  }

  return facilities.filter((facility) => allowedCategories.includes(facility.category));
}
