import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Facility } from "@/types/facility";
import { DiscoveryRow } from "./DiscoveryRow";
import { FeaturedFacilityStrip } from "./FeaturedFacilityStrip";
import { HeroSearchSection } from "./HeroSearchSection";
import { TrustStatsSection } from "./TrustStatsSection";

// Hierarchy, top to bottom: search (hero) -> browse (category chips, placed
// directly under the search field so the two read as one "find something"
// block) -> the rest of the directory.
//
// Nearby results are not here any more. "Find near me" navigates to /nearby,
// which already owns the Facilities/Specialists toggle and the full filter
// set. Rendering them on "/" meant the visitor was reading nearby results on
// a page the bottom navigation still called Home, so the Home tab looked
// current and did nothing when tapped. The homepage no longer touches
// geolocation at all.
export function Homepage({
  facilities,
  mappedFacilityLabel,
  subCityCount,
  openAllHoursCount,
}: {
  facilities: Facility[];
  mappedFacilityLabel: string;
  subCityCount: number;
  openAllHoursCount: number;
}) {
  return (
    <div className="homepage-clinical-bg">
      <HeroSearchSection mappedFacilityLabel={mappedFacilityLabel} />
      <DiscoveryRow facilities={facilities} />
      <TrustStatsSection openAllHoursCount={openAllHoursCount} subCityCount={subCityCount} />
      <section
        aria-labelledby="recently-added-heading"
        className="bg-transparent py-8 sm:py-10 lg:py-12"
      >
        <PageContainer>
          {/* Stacked below sm. As a row, justify-between handed the
              shrink-0 link its full width first and left the heading 177px
              to wrap into, so "Recently added" broke across two lines while
              the link floated level with the last line of the description.
              The -ml-2 cancels the link's own px-2 so its text sits on the
              same optical left edge as the heading above it. */}
          <div className="mb-5 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <h2
                className="font-display text-[1.75rem] font-semibold leading-tight text-balance text-foreground sm:text-3xl"
                id="recently-added-heading"
              >
                Recently Added
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                New healthcare providers joining the directory.
              </p>
            </div>
            <Link
              className="-ml-2 inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 text-sm font-semibold text-primary transition-colors hover:bg-soft-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:ml-0"
              href="/facilities"
            >
              Browse all facilities <span aria-hidden="true" className="ml-1">&rarr;</span>
            </Link>
          </div>
          <FeaturedFacilityStrip facilities={facilities} />
        </PageContainer>
      </section>
    </div>
  );
}
