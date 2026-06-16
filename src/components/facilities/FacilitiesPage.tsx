import Link from "next/link";
import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Facility } from "@/types/facility";
import { FacilitiesHero } from "./FacilitiesHero";
import { FacilityCategoryFilters } from "./FacilityCategoryFilters";
import { FacilitySearchPreview } from "./FacilitySearchPreview";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";

type FacilitiesPageProps = {
  activeCategory?: FacilityCategoryFilter;
  activeCategoryLabel?: string;
  activeQuery?: string;
  facilities?: Facility[];
};

export function FacilitiesPage({
  activeCategory,
  activeCategoryLabel,
  activeQuery = "",
  facilities = [],
}: FacilitiesPageProps) {
  const isFiltered = Boolean(activeCategory || activeQuery);

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <FacilitiesHero />
        <FacilitySearchPreview />
        <FacilityCategoryFilters activeCategory={activeCategory} />

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Facility results
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isFiltered
                ? `Showing facility matches${activeCategoryLabel ? ` for ${activeCategoryLabel.toLowerCase()}` : ""}${activeQuery ? ` matching "${activeQuery}"` : ""}.`
                : "Reviewed facility information."}
            </p>
          </div>
          {facilities.length > 0 ? (
            <FacilityCardGrid facilities={facilities} />
          ) : (
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
          )}
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
