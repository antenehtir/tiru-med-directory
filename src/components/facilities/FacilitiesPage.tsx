import Link from "next/link";
import { FacilityListingExperience } from "@/components/search/FacilityListingExperience";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingStatusBanner } from "@/components/ui/ListingStatusBanner";
import type { Facility } from "@/types/facility";
import { facilityCategoryIcons } from "./category-icons";
import { FacilityCategoryFilters } from "./FacilityCategoryFilters";
import { FacilityCategoryHero } from "./FacilityCategoryHero";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";
import { specialtyDisplayLabel } from "@/lib/specialty-match";
import { SpecialtyResults } from "./SpecialtyResults";

type FacilitiesPageProps = {
  activeCategory?: FacilityCategoryFilter;
  activeCategoryLabel?: string;
  activeSpecialty?: string;
  facilities?: Facility[];
};

export function FacilitiesPage({
  activeCategory,
  activeCategoryLabel,
  activeSpecialty,
  facilities = [],
}: FacilitiesPageProps) {
  // A specialty deep link gets its own page state. Previously it fell
  // through to the generic browse view, which announced "Browse trusted
  // healthcare facilities" above a category row with "All" highlighted —
  // actively contradicting the filter that was doing the work.
  if (activeSpecialty) {
    const label = specialtyDisplayLabel(activeSpecialty);
    const count = facilities.length;
    return (
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="grid gap-6">
          <ListingStatusBanner />

          {/* Breadcrumb doubles as the way out: the filter is named, and the
              route back to unfiltered browse is one tap on the same line. */}
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
              <li>
                <Link className="font-medium underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href="/facilities">
                  All facilities
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-foreground">
                {label}
              </li>
            </ol>
          </nav>

          <header className="max-w-3xl">
            <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-balance text-foreground sm:text-[2.75rem]">
              {label}
            </h1>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              {count === 0
                ? `No facilities currently list ${label.toLowerCase()} in Addis Ababa.`
                : `${count} ${count === 1 ? "facility" : "facilities"} offering this service in Addis Ababa.`}
            </p>
            <Link className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href="/facilities">
              <span aria-hidden="true">&larr;</span> Clear this filter
            </Link>
          </header>

          <SpecialtyResults
            facilities={facilities}
            specialty={activeSpecialty}
            specialtyLabel={label}
          />

          <p className="text-sm text-muted-foreground">
            Is your facility missing?{" "}
            <Link className="font-semibold text-primary" href="/provider/signup">
              List your facility &rarr;
            </Link>
          </p>
        </div>
      </PageContainer>
    );
  }

  if (activeCategory) {
    const categoryLabel = activeCategoryLabel ?? activeCategory;
    const CategoryIcon = facilityCategoryIcons[activeCategory];

    return (
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="grid gap-6">
          <ListingStatusBanner />
          <FacilityCategoryHero
            category={activeCategory}
            categoryLabel={categoryLabel}
            count={facilities.length}
          />
          <FacilityListingExperience
            facilities={facilities}
            lockedType={activeCategory}
            emptyState={
              <EmptyState
                action={
                  <Link
                    className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    href="/provider/signup"
                  >
                    List your facility &rarr;
                  </Link>
                }
                description="Check back soon, or list your facility."
                icon={<CategoryIcon className="size-7" />}
                title={`No ${categoryLabel.toLowerCase()} listed yet`}
              />
            }
          />
          <p className="text-sm text-muted-foreground">
            Don&apos;t see your {categoryLabel.toLowerCase()}?{" "}
            <Link className="font-semibold text-primary" href="/provider/signup">
              List your facility &rarr;
            </Link>
            {" "}&middot;{" "}
            <Link className="text-muted-foreground hover:text-primary" href="/provider/login">
              Already registered? Sign in
            </Link>
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <ListingStatusBanner />

        <header className="max-w-3xl">
          <p className="mb-3 inline-flex rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground">
            Facilities directory
          </p>
          <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-balance text-foreground sm:text-[2.75rem]">
            Browse trusted healthcare facilities.
          </h1>
        </header>

        <FacilityCategoryFilters activeCategory={activeCategory} />

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Facility results
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Reviewed facility information.
            </p>
          </div>
          <FacilityListingExperience facilities={facilities} />
        </section>

        <p className="text-sm text-muted-foreground">
          Is your facility missing?{" "}
          <Link className="font-semibold text-primary" href="/provider/signup">
            List your facility &rarr;
          </Link>
          {" "}&middot;{" "}
          <Link className="text-muted-foreground hover:text-primary" href="/provider/login">
            Already registered? Sign in
          </Link>
        </p>
      </div>
    </PageContainer>
  );
}
