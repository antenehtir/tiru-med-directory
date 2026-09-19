"use client";

import { Suspense, type ReactNode } from "react";
import { DoctorCardGrid } from "@/components/cards/DoctorCardGrid";
import { filterDoctorsByQuery } from "@/lib/frontend-search-filters";
import { doctorMatchesListingFilters } from "@/lib/listing-filters";
import type { Doctor } from "@/types/doctor";
import { FilterModal } from "./FilterModal";
import { ListingSearchBar } from "./ListingSearchBar";
import { useListingFilterModal } from "./use-listing-filter-modal";

type DoctorListingExperienceProps = {
  doctors: Doctor[];
  emptyState?: ReactNode;
};

export function DoctorListingExperience(props: DoctorListingExperienceProps) {
  return (
    <Suspense>
      <DoctorListingExperienceInner {...props} />
    </Suspense>
  );
}

function DoctorListingExperienceInner({
  doctors,
  emptyState,
}: DoctorListingExperienceProps) {
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

  const visibleFilterCount = activeFilterCount - (filters.type ? 1 : 0);

  const queried = filterDoctorsByQuery(doctors, query);
  const results = queried.filter((doctor) => doctorMatchesListingFilters(doctor, filters));

  return (
    <div className="grid gap-4">
      <ListingSearchBar
        activeFilterCount={visibleFilterCount}
        onOpenFilters={open}
        onSearchChange={setQuery}
        searchValue={query}
      />

      <FilterModal
        areaTexts={(draft) =>
          queried.filter((doctor) => doctorMatchesListingFilters(doctor, draft)).map((doctor) => doctor.location)
        }
        countMatches={(draft) => queried.filter((doctor) => doctorMatchesListingFilters(doctor, draft)).length}
        filters={filters}
        isOpen={isOpen}
        onApply={applyFilters}
        onClose={close}
        onReset={resetFilters}
      />

      {results.length > 0 ? (
        <DoctorCardGrid doctors={results} />
      ) : (
        emptyState ?? (
          <p className="text-sm leading-6 text-muted-foreground">
            No matches yet. Try clearing filters or searching another term.
          </p>
        )
      )}
    </div>
  );
}
