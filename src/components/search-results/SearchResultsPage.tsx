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

  const visibleFacilities = filterFacilitiesByQuery(facilities, query).filter((facility) =>
    facilityMatchesListingFilters(facility, filters),
  );
  const visibleDoctors = filterDoctorsByQuery(doctors, query).filter((doctor) =>
    doctorMatchesListingFilters(doctor, filters),
  );
  const visibleSpecialists = filterSpecialistsByQuery(specialists, query).filter((specialist) =>
    specialistMatchesListingFilters(specialist, filters),
  );

  const hasResults =
    visibleFacilities.length > 0 || visibleDoctors.length > 0 || visibleSpecialists.length > 0;

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
