"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, MapPinOffIcon, SearchIcon } from "@/components/ui/EmptyState";
import { ListingStatusBanner } from "@/components/ui/ListingStatusBanner";
import { Pill } from "@/components/ui/Pill";
import { NEARBY_SPECIALTY_PILLS } from "@/lib/constants/specialty-options";
import { matchesAnyAlias } from "@/lib/frontend-search-filters";
import { isFacilityOpenNow } from "@/lib/schedule-availability";
import { calculateDistanceKm, formatDistanceKm, type Coordinates } from "@/lib/nearby-distance";
import { useGeolocation } from "@/lib/useGeolocation";
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

// Nearby has no server-side radius/limit — without a render cap, a city with
// 100+ active facilities renders as one unbroken multi-thousand-pixel grid,
// which makes any specific facility (even a correctly-ranked, close one)
// effectively invisible unless the user scrolls the whole thing. Show the
// closest N by default and reveal more on demand instead.
const DEFAULT_VISIBLE_COUNT = 20;
const LOAD_MORE_STEP = 20;

const categoryOptions = [
  { label: "All", value: "all" },
  { label: "General Hospitals", value: "hospital" },
  { label: "Specialty Centers", value: "specialty" },
  { label: "Clinics", value: "clinic" },
  { label: "Diagnostics / Lab", value: "diagnostics" },
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
  const { locationState, userLocation, requestLocation } = useGeolocation();
  const [isLocationTipOpen, setIsLocationTipOpen] = useState(false);
  const [facilitySearchQuery, setFacilitySearchQuery] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [specialistSearchQuery, setSpecialistSearchQuery] = useState("");
  const [visibleFacilityCount, setVisibleFacilityCount] = useState(DEFAULT_VISIBLE_COUNT);
  const [visibleSpecialistCount, setVisibleSpecialistCount] = useState(DEFAULT_VISIBLE_COUNT);

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

  // Client-side name filter — runs over the already-fetched, already
  // category-filtered list, no new query. Lets someone check "is [facility]
  // in here at all" directly instead of scrolling a distance-sorted grid
  // hoping to spot it, and doubles as a quick way to sanity-check the
  // distance the app computes for a facility you're standing next to.
  const nameFilteredFacilities = useMemo(() => {
    const query = facilitySearchQuery.trim().toLowerCase();
    if (!query) return specialtyFilteredFacilities;
    return specialtyFilteredFacilities.filter((facility) =>
      facility.name.toLowerCase().includes(query),
    );
  }, [specialtyFilteredFacilities, facilitySearchQuery]);

  // Same question, same answer as the specialty pages: isFacilityOpenNow is
  // shared rather than reimplemented here, because two copies of "is this
  // open" is exactly how the two surfaces would start disagreeing.
  const openFilteredFacilities = useMemo(
    () => (openOnly ? nameFilteredFacilities.filter(isFacilityOpenNow) : nameFilteredFacilities),
    [nameFilteredFacilities, openOnly],
  );

  const nameFilteredSpecialists = useMemo(() => {
    const query = specialistSearchQuery.trim().toLowerCase();
    if (!query) return specialists;
    return specialists.filter((specialist) =>
      specialist.fullName.toLowerCase().includes(query),
    );
  }, [specialists, specialistSearchQuery]);

  const rankedFacilities = useMemo(() => {
    if (!userLocation) {
      return [];
    }

    return openFilteredFacilities
      .filter((facility) => facility.coordinates)
      .map((facility) => ({
        facility,
        distanceKm: calculateDistanceKm(userLocation, facility.coordinates!),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }, [openFilteredFacilities, userLocation]);

  const rankedSpecialists = useMemo(() => {
    if (!userLocation) {
      return [];
    }

    return nameFilteredSpecialists
      .filter((specialist) => specialist.coordinates)
      .map((specialist) => ({
        specialist,
        distanceKm: calculateDistanceKm(userLocation, specialist.coordinates!),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }, [nameFilteredSpecialists, userLocation]);

  // Reset the reveal cap whenever the underlying result set changes shape —
  // otherwise switching category/specialty/search could leave a stale high
  // count from previous browsing. Adjusted during render (compare-and-set
  // against a tracked previous value), matching the same pattern already
  // used in ListingSearchBar, rather than a useEffect — an effect here would
  // cause an extra, avoidable render pass just to reset a number.
  const facilityFilterKey = `${selectedCategory}|${selectedNearbySpecialty}|${facilitySearchQuery}`;
  const [prevFacilityFilterKey, setPrevFacilityFilterKey] = useState(facilityFilterKey);
  if (facilityFilterKey !== prevFacilityFilterKey) {
    setPrevFacilityFilterKey(facilityFilterKey);
    setVisibleFacilityCount(DEFAULT_VISIBLE_COUNT);
  }

  const [prevSpecialistSearchQuery, setPrevSpecialistSearchQuery] = useState(
    specialistSearchQuery,
  );
  if (specialistSearchQuery !== prevSpecialistSearchQuery) {
    setPrevSpecialistSearchQuery(specialistSearchQuery);
    setVisibleSpecialistCount(DEFAULT_VISIBLE_COUNT);
  }

  const visibleRankedFacilities = rankedFacilities.slice(0, visibleFacilityCount);
  const hasMoreFacilities = rankedFacilities.length > visibleFacilityCount;

  const visibleRankedSpecialists = rankedSpecialists.slice(0, visibleSpecialistCount);
  const hasMoreSpecialists = rankedSpecialists.length > visibleSpecialistCount;

  const activeCategoryLabel =
    selectedCategory === "all"
      ? "healthcare"
      : categoryOptions.find((category) => category.value === selectedCategory)
          ?.label ?? "healthcare";

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5 overflow-x-hidden px-3 py-6 min-[360px]:px-4 sm:px-6 sm:py-10 lg:px-8">
      <header>
        <p className="text-sm font-semibold text-primary">Near you</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-balance text-foreground sm:text-[2.75rem]">
          Which care are you looking for?
        </h1>
      </header>

      <ListingStatusBanner />

      <div className="flex max-w-full gap-2 rounded-card border border-border bg-card p-1.5">
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

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="min-h-11 w-full rounded-control border border-border bg-card pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          onChange={(event) => setFacilitySearchQuery(event.target.value)}
          placeholder="Search by facility name..."
          type="text"
          value={facilitySearchQuery}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Pill
          ariaPressed={openOnly}
          className="min-h-11"
          onClick={() => setOpenOnly((value) => !value)}
          size="lg"
          variant={openOnly ? "selected" : "default"}
        >
          Open now
        </Pill>
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
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="w-fit" size="sm" variant="muted">
                  Sorted by distance
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Showing {visibleRankedFacilities.length} of {rankedFacilities.length}
                </span>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleRankedFacilities.map(({ facility, distanceKm }) => (
                  <FacilityCard
                    distanceLabel={formatDistanceKm(distanceKm)}
                    facility={facility}
                    key={facility.id}
                  />
                ))}
              </div>
              {hasMoreFacilities ? (
                <button
                  className="mx-auto inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:border-strong-border"
                  onClick={() =>
                    setVisibleFacilityCount((current) => current + LOAD_MORE_STEP)
                  }
                  type="button"
                >
                  Load more
                </button>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  More providers coming to nearby soon.
                </p>
              )}
            </>
          ) : facilitySearchQuery.trim() ? (
            <EmptyState
              action={
                <button
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
                  onClick={() => setFacilitySearchQuery("")}
                  type="button"
                >
                  Clear search
                </button>
              }
              description={`No ${activeCategoryLabel} facility matches "${facilitySearchQuery.trim()}" near you.`}
              icon={<SearchIcon />}
              title="No matches found"
            />
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
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="min-h-11 w-full rounded-control border border-border bg-card pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              onChange={(event) => setSpecialistSearchQuery(event.target.value)}
              placeholder="Search by specialist name..."
              type="text"
              value={specialistSearchQuery}
            />
          </div>

          {rankedSpecialists.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="w-fit" size="sm" variant="muted">
                  Sorted by distance
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Showing {visibleRankedSpecialists.length} of {rankedSpecialists.length}
                </span>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleRankedSpecialists.map(({ specialist, distanceKm }) => (
                  <SpecialistCard
                    distanceLabel={formatDistanceKm(distanceKm)}
                    key={specialist.id}
                    specialist={specialist}
                  />
                ))}
              </div>
              {hasMoreSpecialists ? (
                <button
                  className="mx-auto inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:border-strong-border"
                  onClick={() =>
                    setVisibleSpecialistCount((current) => current + LOAD_MORE_STEP)
                  }
                  type="button"
                >
                  Load more
                </button>
              ) : null}
            </>
          ) : specialistSearchQuery.trim() ? (
            <EmptyState
              action={
                <button
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
                  onClick={() => setSpecialistSearchQuery("")}
                  type="button"
                >
                  Clear search
                </button>
              }
              description={`No specialist matches "${specialistSearchQuery.trim()}" near you.`}
              icon={<SearchIcon />}
              title="No matches found"
            />
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
