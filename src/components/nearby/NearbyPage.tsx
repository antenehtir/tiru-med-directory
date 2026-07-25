"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, MapPinOffIcon } from "@/components/ui/EmptyState";
import { ListingStatusBanner } from "@/components/ui/ListingStatusBanner";
import { Pill } from "@/components/ui/Pill";
import { NEARBY_SPECIALTY_PILLS } from "@/lib/constants/specialty-options";
import { matchesAnyAlias } from "@/lib/frontend-search-filters";
import {
  calculateDistanceKm,
  formatDistanceKm,
  type Coordinates,
} from "@/lib/nearby-distance";
import { SpecialistCard } from "@/components/specialists/SpecialistCard";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";
import type { Facility } from "@/types/facility";

export type NearbyFacility = Facility & {
  coordinates?: Coordinates;
};

export type NearbySpecialist = SpecialistListItem & {
  coordinates?: Coordinates;
};

type NearbyPageProps = {
  facilities: NearbyFacility[];
  initialCategory: string;
  specialists: NearbySpecialist[];
};

type NearbyTab = "facilities" | "specialists";

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
  { label: "Diagnostics", value: "diagnostics" },
  { label: "Pharmacies", value: "pharmacies" },
];

export function NearbyPage({
  facilities,
  initialCategory,
  specialists,
}: NearbyPageProps) {
  const [activeTab, setActiveTab] = useState<NearbyTab>("facilities");
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

    const selectedPill = NEARBY_SPECIALTY_PILLS.find(
      (pill) => pill.display === selectedNearbySpecialty,
    );

    if (!selectedPill) return categoryFacilities;

    // The "Medical Plaza" pill is the one place broad multi-specialty
    // facilities should surface, so it's exempt from the dilution check below.
    const isMedicalPlazaPill = selectedPill.display === "Medical Plaza";

    return categoryFacilities.filter((facility) => {
      // Broad multi-specialty facilities (Medical Plaza category, or a
      // services list spanning many unrelated specialty domains) dilute
      // focused pills with unrelated results — they still show under "All".
      const isBroadMultispecialty =
        facility.category === "Medical Plaza" ||
        facility.subcategory?.toLowerCase().includes("multispecialt") ||
        facility.services.some((s) => s.toLowerCase().includes("multispecialt")) ||
        facility.services.length >= 15;

      if (isBroadMultispecialty && !isMedicalPlazaPill) {
        return false;
      }

      const specialtyText = [
        facility.category,
        facility.subcategory,
        facility.name,
        ...facility.services,
      ].join(" ");

      return matchesAnyAlias(specialtyText, selectedPill.aliases);
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

  const rankedSpecialists = useMemo(() => {
    if (!userLocation) {
      return [];
    }

    return specialists
      .filter((specialist) => specialist.coordinates)
      .map((specialist) => ({
        specialist,
        distanceKm: calculateDistanceKm(userLocation, specialist.coordinates!),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }, [specialists, userLocation]);

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

      <div className="flex max-w-full gap-2 rounded-2xl border border-border bg-card p-1.5">
        {(
          [
            { label: "Facilities", value: "facilities" },
            { label: "Specialists", value: "specialists" },
          ] as { label: string; value: NearbyTab }[]
        ).map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <Pill
              ariaPressed={isActive}
              className="min-h-11 flex-1 justify-center"
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              size="lg"
              variant={isActive ? "selected" : "default"}
            >
              {tab.label}
            </Pill>
          );
        })}
      </div>

      {activeTab === "facilities" ? (
      <>
      <div className="flex max-w-full flex-wrap gap-2">
        {categoryOptions.map((category) => {
          const isActive = category.value === selectedCategory;

          return (
            <Pill
              ariaPressed={isActive}
              className="min-h-11"
              key={category.value}
              onClick={() => {
                setSelectedCategory(category.value);

                if (category.value !== "specialty") {
                  setSelectedNearbySpecialty("");
                }
              }}
              size="lg"
              variant={isActive ? "selected" : "default"}
            >
              {category.label}
            </Pill>
          );
        })}
      </div>

      {selectedCategory === "specialty" ? (
        <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
          {[{ display: "All", aliases: [] }, ...NEARBY_SPECIALTY_PILLS].map((pill) => {
            const isActive =
              pill.display === "All"
                ? selectedNearbySpecialty === ""
                : selectedNearbySpecialty === pill.display;

            return (
              <Pill
                ariaPressed={isActive}
                className="shrink-0 whitespace-nowrap"
                key={pill.display}
                onClick={() =>
                  setSelectedNearbySpecialty(pill.display === "All" ? "" : pill.display)
                }
                size="sm"
                variant={isActive ? "selected" : "default"}
              >
                {pill.display}
              </Pill>
            );
          })}
        </div>
      ) : null}
      </>
      ) : null}

      {locationState === "idle" || locationState === "loading" ? (
        <p className="inline-flex w-fit items-center rounded-full bg-soft-accent px-4 py-2 text-sm font-semibold text-primary">
          Finding your location...
        </p>
      ) : null}

      {locationState === "timeout" ? (
        <EmptyState
          action={
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              onClick={requestLocation}
              type="button"
            >
              Try again
            </button>
          }
          description="We couldn't get a location fix in time. Check your connection and try again."
          icon={<MapPinOffIcon />}
          title="Location is taking longer than expected"
        />
      ) : null}

      {locationState === "denied" ? (
        <EmptyState
          action={
            <div className="grid gap-3">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
                onClick={() => setIsLocationTipOpen((current) => !current)}
                type="button"
              >
                How to enable location
              </button>
              {isLocationTipOpen ? (
                <p className="rounded-xl border border-border bg-muted p-3 text-sm leading-6 text-muted-foreground">
                  In your browser address bar, tap the lock icon and allow Location.
                </p>
              ) : null}
            </div>
          }
          description="Enable location access to find the nearest care."
          icon={<MapPinOffIcon />}
          title="Location access needed"
        />
      ) : null}

      {locationState === "unsupported" ? (
        <EmptyState
          description="Try a different browser, or use search or filters to browse facilities instead."
          icon={<MapPinOffIcon />}
          title="Location is not supported in this browser"
        />
      ) : null}

      {locationState === "ready" && activeTab === "facilities" ? (
        <section className="grid gap-3">
          {rankedFacilities.length > 0 ? (
            <>
              <Badge className="w-fit" size="sm" variant="muted">
                Sorted by distance
              </Badge>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rankedFacilities.map(({ facility, distanceKm }) => (
                  <FacilityCard
                    distanceLabel={formatDistanceKm(distanceKm)}
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
            <EmptyState
              action={
                selectedCategory === "pharmacies" ? (
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link
                      className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                      href="/provider/signup"
                    >
                      List your facility
                    </Link>
                    <Link
                      className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
                      href="/provider/login"
                    >
                      Already registered? Sign in
                    </Link>
                  </div>
                ) : undefined
              }
              description={
                selectedCategory === "pharmacies"
                  ? "We're actively adding pharmacies across Addis Ababa."
                  : "Check back soon as we add more providers in your area."
              }
              icon={<MapPinOffIcon />}
              title={
                selectedCategory === "pharmacies"
                  ? "Pharmacies are being onboarded to Tiru"
                  : `No ${activeCategoryLabel} providers with location data yet`
              }
            />
          )}
        </section>
      ) : null}

      {locationState === "ready" && activeTab === "specialists" ? (
        <section className="grid gap-3">
          {rankedSpecialists.length > 0 ? (
            <>
              <Badge className="w-fit" size="sm" variant="muted">
                Sorted by distance
              </Badge>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rankedSpecialists.map(({ specialist, distanceKm }) => (
                  <SpecialistCard
                    distanceLabel={formatDistanceKm(distanceKm)}
                    key={specialist.id}
                    specialist={specialist}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              description="Check back soon as we add more specialists in your area."
              icon={<MapPinOffIcon />}
              title="No specialists with location data yet"
            />
          )}
        </section>
      ) : null}
    </main>
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

  const allowedCategories = NEARBY_CATEGORY_DB_MAP[category];

  if (!allowedCategories) {
    return facilities;
  }

  return facilities.filter((facility) => allowedCategories.includes(facility.category));
}
