"use client";

import { useState } from "react";
import type { SVGProps } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchAutocompleteInput } from "@/components/search/SearchAutocompleteInput";
import { healthcareCategories, searchAreaOptions } from "@/components/search/search-options";
import { realFacilities } from "@/data/real-facility-profiles";
import {
  extractSpecialtyMatchKeyword,
  filterDoctorsByQuery,
  filterFacilitiesByQuery,
  specialtySubFilters,
} from "@/lib/frontend-search-filters";
import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

function AllCategoriesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function SpecialistsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 3v6a6 6 0 006 6 6 6 0 006-6V3" />
      <path d="M6 3H4M18 3h2M18 15a4 4 0 01-4 4H10" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}

const categoryIcons: Record<string, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  All: AllCategoriesIcon,
  "General Hospitals": facilityCategoryIcons.hospital,
  "Specialty Centers": facilityCategoryIcons.specialty,
  Clinics: facilityCategoryIcons.clinic,
  Specialists: SpecialistsIcon,
  Diagnostics: facilityCategoryIcons.diagnostics,
  Pharmacies: facilityCategoryIcons.pharmacy,
  Ambulance: facilityCategoryIcons.ambulance,
  "Home Care": facilityCategoryIcons["home-care"],
};

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
  const isSpecialtyCenters = normalizedCategory === "specialty centers";

  const [specialtySubFilter, setSpecialtySubFilter] = useState("All specialties");
  const [trackedCategory, setTrackedCategory] = useState(normalizedCategory);
  const [isAreaFilterOpen, setIsAreaFilterOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");

  if (trackedCategory !== normalizedCategory) {
    setTrackedCategory(normalizedCategory);
    setSpecialtySubFilter("All specialties");
  }

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

  if (isSpecialtyCenters && specialtySubFilter !== "All specialties") {
    const keyword = extractSpecialtyMatchKeyword(specialtySubFilter).toLowerCase();
    visibleFacilities = visibleFacilities.filter((f) => {
      const text = [f.name, f.category, f.subcategory ?? "", ...f.services]
        .join(" ")
        .toLowerCase();
      return text.includes(keyword);
    });
  }

  if (selectedArea) {
    const areaKeyword = selectedArea.toLowerCase();
    visibleFacilities = visibleFacilities.filter((facility) =>
      facility.location.toLowerCase().includes(areaKeyword),
    );
    visibleDoctors = visibleDoctors.filter((doctor) =>
      doctor.location.toLowerCase().includes(areaKeyword),
    );
  }

  const hasResults = visibleFacilities.length > 0 || visibleDoctors.length > 0;

  function handleCategoryClick(label: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("category", label);
    router.push(`/search?${params.toString()}`);
  }

  function handleAreaSelect(area: string) {
    setSelectedArea((current) => (current === area ? "" : area));
  }

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <SearchAutocompleteInput
          id="search-results-input"
          autoFocus={focusSearch}
          initialQuery={query}
          label="Search healthcare"
          placeholder="Search by name, area, or specialty"
          formClassName="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
          inputClassName="min-h-13 w-full min-w-0 rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary sm:min-h-14 sm:px-4"
          buttonClassName="min-h-12 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover md:min-h-14"
        />

        <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          {healthcareCategories.map((label) => {
            const isActive =
              label === "All" ? isAllCategory : normalizedCategory === label.toLowerCase();
            const Icon = categoryIcons[label];

            return (
              <button
                key={label}
                aria-pressed={isActive}
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-strong-border"
                }`}
                onClick={() => handleCategoryClick(label)}
                type="button"
              >
                {Icon ? <Icon className="size-4 shrink-0" /> : null}
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-2">
          <button
            aria-expanded={isAreaFilterOpen}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition ${
              selectedArea
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-strong-border"
            }`}
            onClick={() => setIsAreaFilterOpen((open) => !open)}
            type="button"
          >
            📍 {selectedArea ? `Area: ${selectedArea}` : "Filter by area"}
          </button>
        </div>

        {isAreaFilterOpen ? (
          <div className="flex max-w-full flex-wrap items-center gap-2">
            {searchAreaOptions.map((area) => {
              const isActive = selectedArea === area;
              return (
                <button
                  key={area}
                  aria-pressed={isActive}
                  className={`inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold transition ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-strong-border"
                  }`}
                  onClick={() => handleAreaSelect(area)}
                  type="button"
                >
                  {area}
                </button>
              );
            })}
          </div>
        ) : null}

        {isSpecialtyCenters ? (
          <div className="flex max-w-full flex-wrap items-center gap-2">
            {specialtySubFilters.map((sub) => {
              const isActive = specialtySubFilter === sub;
              return (
                <button
                  key={sub}
                  aria-pressed={isActive}
                  className={`inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold transition ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-strong-border"
                  }`}
                  onClick={() => setSpecialtySubFilter(sub)}
                  type="button"
                >
                  {sub}
                </button>
              );
            })}
          </div>
        ) : null}

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

  if (normalizedCategory === "ambulance") {
    return searchableText.includes("ambulance");
  }

  if (normalizedCategory === "home care") {
    return searchableText.includes("home care");
  }

  return true;
}
