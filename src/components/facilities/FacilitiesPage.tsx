import Link from "next/link";
import { FacilityListingExperience } from "@/components/search/FacilityListingExperience";
import { PageContainer } from "@/components/layout/PageContainer";
import { ListingStatusBanner } from "@/components/ui/ListingStatusBanner";
import type { Facility } from "@/types/facility";
import { facilityCategoryIcons } from "./category-icons";
import { FacilityCategoryFilters } from "./FacilityCategoryFilters";
import { FacilityCategoryHero } from "./FacilityCategoryHero";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";

type FacilitiesPageProps = {
  activeCategory?: FacilityCategoryFilter;
  activeCategoryLabel?: string;
  facilities?: Facility[];
};

const categoryProviderTypeParam: Record<FacilityCategoryFilter, string> = {
  hospital: "Healthcare Facility",
  specialty: "Healthcare Facility",
  clinic: "Healthcare Facility",
  diagnostics: "Diagnostic Center",
  pharmacy: "Pharmacy",
  ambulance: "Ambulance Service",
  "home-care": "Healthcare Facility",
};

export function FacilitiesPage({
  activeCategory,
  activeCategoryLabel,
  facilities = [],
}: FacilitiesPageProps) {
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
              <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <CategoryIcon className="size-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No {categoryLabel.toLowerCase()} listed yet
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Be the first to add one.
                </p>
                <Link
                  className="mt-4 inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                  href={`/register?type=${encodeURIComponent(categoryProviderTypeParam[activeCategory])}`}
                >
                  + List a provider
                </Link>
              </section>
            }
          />
          <p className="text-sm text-muted-foreground">
            Don&apos;t see your {categoryLabel.toLowerCase()}?{" "}
            <Link className="font-semibold text-primary" href="/register">
              List it here &rarr;
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
          <h1 className="text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl">
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
          <FacilityListingExperience
            facilities={facilities}
            emptyState={
              <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-sm font-bold text-muted-foreground">
                  0
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No facility matches yet
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Try another facility category or return to all facilities.
                </p>
              </section>
            }
          />
        </section>

        <p className="text-sm text-muted-foreground">
          Is your facility missing?{" "}
          <Link className="font-semibold text-primary" href="/register">
            Register it here &rarr;
          </Link>
        </p>
      </div>
    </PageContainer>
  );
}
