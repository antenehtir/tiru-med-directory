"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchAutocompleteInput } from "@/components/search/SearchAutocompleteInput";
import { healthcareCategories } from "@/components/search/search-options";
import { realFacilities } from "@/data/real-facility-profiles";
import { filterDoctorsByQuery, filterFacilitiesByQuery } from "@/lib/frontend-search-filters";
import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

type SearchResultsPageProps = {
  doctors?: Doctor[];
};

export function SearchResultsPage({ doctors = [] }: SearchResultsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const focusSearch = searchParams.get("focus") === "1";
  const normalizedCategory = category.trim().toLowerCase();
  const isAllCategory = !normalizedCategory || normalizedCategory === "all";

  const matchingFacilities = filterFacilitiesByQuery(realFacilities, query);
  const matchingDoctors = filterDoctorsByQuery(doctors, query);

  let visibleFacilities: Facility[] = [];
  let visibleDoctors: Doctor[] = [];

  if (isAllCategory) {
    visibleFacilities = matchingFacilities;
    visibleDoctors = matchingDoctors;
  } else if (normalizedCategory === "specialists") {
    visibleDoctors = matchingDoctors;
  } else {
    visibleFacilities = matchingFacilities.filter((facility) =>
      matchesCategoryFilter(facility, normalizedCategory),
    );
  }

  const hasResults = visibleFacilities.length > 0 || visibleDoctors.length > 0;

  function handleCategoryClick(label: string) {
    const params = new URLSearchParams();

    if (query) {
      params.set("q", query);
    }

    params.set("category", label);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <SearchAutocompleteInput
          id="search-results-input"
          autoFocus={focusSearch}
          initialQuery={query}
          label="Search healthcare"
          placeholder="Specialists, facilities, pharmacies, specialties"
          formClassName="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
          inputClassName="min-h-13 w-full min-w-0 rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary sm:min-h-14 sm:px-4"
          buttonClassName="min-h-12 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover md:min-h-14"
        />

        <div className="flex max-w-full flex-wrap items-center gap-2">
          {healthcareCategories.map((label) => {
            const isActive =
              label === "All" ? isAllCategory : normalizedCategory === label.toLowerCase();

            return (
              <button
                key={label}
                aria-pressed={isActive}
                className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-strong-border"
                }`}
                onClick={() => handleCategoryClick(label)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>

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
            No results for &lsquo;{query}&rsquo;. Try a different name, area, or category.
          </p>
        )}
      </div>
    </PageContainer>
  );
}

function matchesCategoryFilter(facility: Facility, normalizedCategory: string): boolean {
  const searchableText = [facility.category, facility.subcategory, facility.name, ...facility.services]
    .join(" ")
    .toLowerCase();

  if (normalizedCategory === "general hospitals") {
    return searchableText.includes("hospital");
  }

  if (normalizedCategory === "specialty centers") {
    return searchableText.includes("specialty");
  }

  if (normalizedCategory === "clinics") {
    return searchableText.includes("clinic");
  }

  if (normalizedCategory === "diagnostics") {
    return (
      searchableText.includes("diagnostic") ||
      searchableText.includes("lab") ||
      searchableText.includes("imaging")
    );
  }

  if (normalizedCategory === "pharmacies") {
    return searchableText.includes("pharmacy");
  }

  return true;
}
