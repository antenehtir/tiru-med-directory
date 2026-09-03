"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { FacilityCard } from "@/components/cards/FacilityCard";
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
  doctorMatchesListingFilters,
  facilityMatchesListingFilters,
  specialistMatchesListingFilters,
} from "@/lib/listing-filters";
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

  // Kept separate from the filtered lists below so the result count can
  // report "N of M" — M is what the query alone would return, before the
  // Filter modal narrows it further.
  const queryMatchedFacilities = filterFacilitiesByQuery(facilities, query);
  const queryMatchedDoctors = filterDoctorsByQuery(doctors, query);
  const queryMatchedSpecialists = filterSpecialistsByQuery(specialists, query);

  const visibleFacilities = queryMatchedFacilities.filter((facility) =>
    facilityMatchesListingFilters(facility, filters),
  );
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
              activeFilterCount > 0 || query ? (
                <button
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
                  onClick={() => resetFilters()}
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
