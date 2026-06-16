import Link from "next/link";
import { DoctorCard } from "@/components/cards/DoctorCard";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchAutocompleteInput } from "@/components/search/SearchAutocompleteInput";
import { healthcareCategories } from "@/components/search/search-options";
import { realFacilities } from "@/data/real-facility-profiles";
import { filterDoctorsByQuery, filterFacilitiesByQuery } from "@/lib/frontend-search-filters";
import type { Doctor } from "@/types/doctor";
import type { Facility } from "@/types/facility";

const categorySlugs: Record<string, string> = {
  All: "",
  "General Hospitals": "hospital",
  "Specialty Centers": "specialty",
  Clinics: "clinic",
  Doctors: "doctor",
  Diagnostics: "diagnostics",
  Pharmacies: "pharmacy",
};

type SearchResultsPageProps = {
  category?: string;
  doctors?: Doctor[];
  focusSearch?: boolean;
  query?: string;
};

export function SearchResultsPage({
  category = "",
  doctors = [],
  focusSearch = false,
  query = "",
}: SearchResultsPageProps) {
  const matchingFacilities = filterFacilitiesByQuery(realFacilities, query);
  const matchingDoctors = filterDoctorsByQuery(doctors, query);

  const isPharmacy = (facility: Facility) =>
    [facility.category, facility.subcategory, facility.name, ...facility.services]
      .join(" ")
      .toLowerCase()
      .includes("pharmacy");

  let visibleFacilities: Facility[] = [];
  let visibleDoctors: Doctor[] = [];

  if (category === "doctor") {
    visibleDoctors = matchingDoctors;
  } else if (category === "pharmacy") {
    visibleFacilities = matchingFacilities.filter(isPharmacy);
  } else if (category === "hospital" || category === "specialty" || category === "clinic" || category === "diagnostics") {
    visibleFacilities = matchingFacilities.filter(
      (facility) => !isPharmacy(facility) && matchesFacilityCategory(facility, category),
    );
  } else {
    visibleFacilities = matchingFacilities;
    visibleDoctors = matchingDoctors;
  }

  const hasResults = visibleFacilities.length > 0 || visibleDoctors.length > 0;

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <SearchAutocompleteInput
          id="search-results-input"
          autoFocus={focusSearch}
          initialQuery={query}
          label="Search healthcare"
          placeholder="Doctors, facilities, pharmacies, specialties"
          formClassName="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
          inputClassName="min-h-13 w-full min-w-0 rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary sm:min-h-14 sm:px-4"
          buttonClassName="min-h-12 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover md:min-h-14"
        />

        <div className="flex max-w-full flex-wrap items-center gap-2">
          {healthcareCategories.map((label) => {
            const slug = categorySlugs[label] ?? "";
            const isActive = slug === category;
            const href = buildCategoryHref(query, slug);

            return (
              <Link
                key={label}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-strong-border"
                }`}
                href={href}
              >
                {label}
              </Link>
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

function matchesFacilityCategory(facility: Facility, category: string): boolean {
  const searchableText = [facility.category, facility.subcategory, facility.name, ...facility.services]
    .join(" ")
    .toLowerCase();

  if (category === "clinic") {
    return (
      searchableText.includes("clinic") ||
      searchableText.includes("health center") ||
      searchableText.includes("primary care")
    );
  }

  if (category === "hospital") {
    return searchableText.includes("hospital");
  }

  if (category === "specialty") {
    return searchableText.includes("specialty");
  }

  return (
    searchableText.includes("laboratory") ||
    searchableText.includes("diagnostic") ||
    searchableText.includes("lab") ||
    searchableText.includes("imaging") ||
    searchableText.includes("radiology")
  );
}

function buildCategoryHref(query: string, categorySlug: string): string {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (categorySlug) {
    params.set("category", categorySlug);
  }

  const queryString = params.toString();

  return queryString ? `/search?${queryString}` : "/search";
}
