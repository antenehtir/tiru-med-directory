"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { FilterModal } from "@/components/search/FilterModal";
import { ListingSearchBar } from "@/components/search/ListingSearchBar";
import { useListingFilterModal } from "@/components/search/use-listing-filter-modal";
import { filterDoctorsByQuery, filterFacilitiesByQuery } from "@/lib/frontend-search-filters";
import {
  doctorMatchesListingFilters,
  facilityMatchesListingFilters,
} from "@/lib/listing-filters";
import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

type SearchResultsPageProps = {
  doctors?: Doctor[];
  facilities?: Facility[];
};

export function SearchResultsPage(props: SearchResultsPageProps) {
  return (
    <Suspense>
      <SearchResultsPageInner {...props} />
    </Suspense>
  );
}

function SearchResultsPageInner({ doctors = [], facilities = [] }: SearchResultsPageProps) {
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

  const hasResults = visibleFacilities.length > 0 || visibleDoctors.length > 0;

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <header>
          <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
            {visibleDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            No results{query ? ` for '${query}'` : ""}. Try a different name, area, or
            category.
          </p>
        )}
      </div>
    </PageContainer>
  );
}
