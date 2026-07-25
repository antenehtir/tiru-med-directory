"use client";

import { Suspense, type ReactNode } from "react";
import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import { EmptyState, SearchOffIcon } from "@/components/ui/EmptyState";
import { filterFacilitiesByQuery, type FacilityCategoryFilter } from "@/lib/frontend-search-filters";
import { facilityMatchesListingFilters } from "@/lib/listing-filters";
import type { Facility } from "@/types/facility";
import { FilterModal } from "./FilterModal";
import { ListingSearchBar } from "./ListingSearchBar";
import { useListingFilterModal } from "./use-listing-filter-modal";

type FacilityListingExperienceProps = {
  facilities: Facility[];
  lockedType?: FacilityCategoryFilter;
  emptyState?: ReactNode;
};

export function FacilityListingExperience(props: FacilityListingExperienceProps) {
  return (
    <Suspense>
      <FacilityListingExperienceInner {...props} />
    </Suspense>
  );
}

function FacilityListingExperienceInner({
  facilities,
  lockedType,
  emptyState,
}: FacilityListingExperienceProps) {
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

  const effectiveFilters = lockedType ? { ...filters, type: lockedType } : filters;
  const visibleFilterCount = lockedType
    ? activeFilterCount - (filters.type ? 1 : 0)
    : activeFilterCount;

  const results = filterFacilitiesByQuery(facilities, query).filter((facility) =>
    facilityMatchesListingFilters(facility, effectiveFilters),
  );

  return (
    <div className="grid gap-4">
      <ListingSearchBar
        activeFilterCount={visibleFilterCount}
        onOpenFilters={open}
        onSearchChange={setQuery}
        searchValue={query}
      />

      <FilterModal
        filters={filters}
        isOpen={isOpen}
        lockedType={lockedType}
        onApply={applyFilters}
        onClose={close}
        onReset={() => resetFilters(lockedType)}
      />

      {results.length > 0 ? (
        <FacilityCardGrid facilities={results} />
      ) : (
        emptyState ?? (
          <EmptyState
            action={
              visibleFilterCount > 0 || query ? (
                <button
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
                  onClick={() => resetFilters(lockedType)}
                  type="button"
                >
                  Clear filters
                </button>
              ) : undefined
            }
            description="Try a different name, area, or category."
            icon={<SearchOffIcon />}
            title="No facilities found"
          />
        )
      )}
    </div>
  );
}
