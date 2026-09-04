"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { ListingRefinementPills } from "@/components/facilities/ListingRefinementPills";
import { PageContainer } from "@/components/layout/PageContainer";
import { FilterModal } from "@/components/search/FilterModal";
import { ListingSearchBar } from "@/components/search/ListingSearchBar";
import { useListingFilterModal } from "@/components/search/use-listing-filter-modal";
import { SpecialistCard } from "@/components/specialists/SpecialistCard";
import { matchedServiceForQuery } from "@/lib/specialty-match";
import { EmptyState, SearchIcon } from "@/components/ui/EmptyState";
import {
  countQueryMatches,
  filterDoctorsByQuery,
  filterFacilitiesByQuery,
  filterSpecialistsByQuery,
} from "@/lib/frontend-search-filters";
import {
  applyListingRefinements,
  availableListingTypes,
  distanceLabelsByFacilityId,
} from "@/lib/listing-refinements";
import {
  doctorMatchesListingFilters,
  facilityMatchesListingFilters,
  specialistMatchesListingFilters,
} from "@/lib/listing-filters";
import { useGeolocation } from "@/lib/useGeolocation";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";
import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

type SearchResultsPageProps = {
  doctors?: Doctor[];
  specialists?: SpecialistListItem[];
  facilities?: Facility[];
};

export function SearchResultsPage(props: SearchResultsPageProps) {
  return (
    <Suspense>
      <SearchResultsPageInner {...props} />
    </Suspense>
  );
}

function SearchResultsPageInner({
  doctors = [],
  specialists = [],
  facilities = [],
}: SearchResultsPageProps) {
  const searchParams = useSearchParams();
  const focusSearch = searchParams.get("focus") === "1";

  const {
    isOpen,
    open,
    close,
    filters,
    query,
    setQuery,
    applyFilters,
    resetFilters,
    activeFilterCount,
  } = useListingFilterModal();

  // Open now / Nearest first — new here, not URL-persisted, matching
  // SpecialtyResults' own local-state treatment of the same two controls.
  const [openOnly, setOpenOnly] = useState(false);
  const [nearestFirst, setNearestFirst] = useState(false);
  const { locationState, userLocation, requestLocation } = useGeolocation(false);

  // Kept separate from the filtered lists below so the result count can
  // report "N of M" — M is what the query alone would return, before the
  // Filter modal narrows it further.
  const queryMatchedFacilities = filterFacilitiesByQuery(facilities, query);
  const queryMatchedDoctors = filterDoctorsByQuery(doctors, query);
  const queryMatchedSpecialists = filterSpecialistsByQuery(specialists, query);

  const typeFilteredFacilities = queryMatchedFacilities.filter((facility) =>
    facilityMatchesListingFilters(facility, filters),
  );
  // Types available among the Filter modal's OWN narrowing (query + subCity
  // + area + specialty), independent of type itself and of open-now/nearest-
  // first — the same "ignore the refinement being offered, not the others"
  // rule SpecialtyResults applies when computing its own availableTypes.
  const availableTypes = availableListingTypes(
    queryMatchedFacilities.filter((facility) =>
      facilityMatchesListingFilters(facility, { ...filters, type: "" }),
    ),
  );
  // Type itself is already applied above via the existing Filter modal /
  // URL-params pipeline (filters.type) — passing "" here means this second
  // pass only adds open-now and nearest-first on top, not a redundant type
  // filter running twice.
  const visibleFacilities = applyListingRefinements(typeFilteredFacilities, {
    typeKey: "",
    openOnly,
    nearestFirst,
    userLocation,
  });
  const distanceByFacilityId = distanceLabelsByFacilityId(visibleFacilities, userLocation);
  const visibleDoctors = queryMatchedDoctors.filter((doctor) =>
    doctorMatchesListingFilters(doctor, filters),
  );
  const visibleSpecialists = queryMatchedSpecialists.filter((specialist) =>
    specialistMatchesListingFilters(specialist, filters),
  );

  const hasResults =
    visibleFacilities.length > 0 || visibleDoctors.length > 0 || visibleSpecialists.length > 0;

  const visibleCount = visibleFacilities.length + visibleDoctors.length + visibleSpecialists.length;
  // The one canonical "total matches for this query" function — the
  // autocomplete's service-tag suggestions call the same one, so a tag's
  // promised count and this page's own count can't drift apart.
  const queryMatchedCount = countQueryMatches(facilities, doctors, specialists, query);
  // Filters can only ever narrow the query-matched set, never grow it, so
  // this is the one direction that needs checking: the "of M" half is only
  // worth printing when it says something the first number doesn't.
  const filtersAreNarrowing = visibleCount < queryMatchedCount;

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <header>
          <h1 className="font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            Search healthcare
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Search across hospitals, clinics, specialists, diagnostics, and pharmacies.
          </p>
        </header>

        <ListingSearchBar
          activeFilterCount={activeFilterCount}
          autoFocus={focusSearch}
          onOpenFilters={open}
          onSearchChange={setQuery}
          searchValue={query}
        />

        <FilterModal
          filters={filters}
          isOpen={isOpen}
          onApply={applyFilters}
          onClose={close}
          onReset={resetFilters}
        />

        {/* Same refinement set and the same shared component the specialty
            pages use — Open now / Nearest first / Type — gated the same way
            the result count below is: only once there's an active query
            with at least one facility to refine. Type stays wired to the
            existing filters.type (the Filter modal's own "Type of care"
            select) rather than a second, parallel state, so the two
            controls can never show different selections for the same
            thing. */}
        {query.trim() && queryMatchedFacilities.length > 0 ? (
          <ListingRefinementPills
            availableTypes={availableTypes}
            locationState={locationState}
            nearestFirst={nearestFirst}
            onSelectType={(type) => applyFilters({ ...filters, type })}
            onToggleNearestFirst={() => {
              if (locationState === "ready") {
                setNearestFirst((value) => !value);
                return;
              }
              setNearestFirst(true);
              requestLocation();
            }}
            onToggleOpenOnly={() => setOpenOnly((value) => !value)}
            openOnly={openOnly}
            typeKey={filters.type}
          />
        ) : null}

        {/* Quiet reassurance that the query did something — /search filters
            live rather than navigating, so the results are the primary
            feedback and this stays out of their way instead of overlaying
            them the way a dropdown would. Same aria-live="polite" pattern
            SpecialtyResults uses for its count, made visible here since
            there is no other confirmation on this page that typing worked. */}
        {query.trim() && hasResults ? (
          <p aria-live="polite" className="text-sm text-muted-foreground" role="status">
            {filtersAreNarrowing
              ? `${visibleCount} of ${queryMatchedCount} ${queryMatchedCount === 1 ? "facility" : "facilities"}`
              : `${visibleCount} ${visibleCount === 1 ? "facility" : "facilities"}`}
          </p>
        ) : null}

        {hasResults ? (
          <div className="grid gap-8">
            {(visibleFacilities.length > 0 || visibleDoctors.length > 0) && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Same treatment the specialty pages use: the service that
                    caused the match is pulled to the front of the pill row so a
                    general hospital returned for "EEG" visibly earns its place,
                    instead of hiding the reason behind "+N more". The helper is
                    shared with those pages rather than reimplemented. */}
                {visibleFacilities.map((facility) => (
                  <FacilityCard
                    distanceLabel={distanceByFacilityId?.[facility.id]}
                    facility={facility}
                    highlightLabel={matchedServiceForQuery(facility, query)}
                    key={facility.id}
                  />
                ))}
                {visibleDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}

            {visibleSpecialists.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-foreground">
                  Specialists ({visibleSpecialists.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleSpecialists.map((specialist) => (
                    <SpecialistCard key={specialist.id} specialist={specialist} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            action={
              activeFilterCount > 0 || query || openOnly || nearestFirst ? (
                <button
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
                  onClick={() => {
                    setOpenOnly(false);
                    setNearestFirst(false);
                    resetFilters();
                  }}
                  type="button"
                >
                  Clear filters
                </button>
              ) : undefined
            }
            description="Try a different name, area, or category."
            icon={<SearchIcon />}
            title={query ? `No results for "${query}"` : "No results found"}
          />
        )}
      </div>
    </PageContainer>
  );
}
