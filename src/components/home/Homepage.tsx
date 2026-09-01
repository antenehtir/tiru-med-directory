import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import type { NearbyFacility } from "@/components/nearby/NearbyPage";
import type { Facility } from "@/types/facility";
import { DiscoveryRow } from "./DiscoveryRow";
import { FeaturedFacilityStrip } from "./FeaturedFacilityStrip";
import { HeroSearchSection } from "./HeroSearchSection";
import { HomeLocationProvider } from "./HomeLocationProvider";
import { NearbyCareSection } from "./NearbyCareSection";
import { TrustStatsSection } from "./TrustStatsSection";

// Hierarchy, top to bottom: search (hero) -> browse (category chips, placed
// directly under the search field so the two read as one "find something"
// block) -> location (the hero CTA feeding one nearby section) -> the rest of
// the directory.
//
// The chips sit above the nearby section by explicit decision. The trade-off
// accepted: browse now precedes location, so the hero CTA and the chip row
// both compete for the tap after search. The chips carry live counts and the
// location CTA does not, which is what keeps them distinguishable.
//
// HomeLocationProvider wraps everything because the single location action in
// the hero and the results in NearbyCareSection sit in different branches of
// the tree; sharing one useGeolocation call is what lets granting permission
// once populate the nearby section without a second prompt appearing.
export function Homepage({
  facilities,
  nearbyFacilities,
  mappedFacilityLabel,
  subCityCount,
  openAllHoursCount,
}: {
  facilities: Facility[];
  nearbyFacilities: NearbyFacility[];
  mappedFacilityLabel: string;
  subCityCount: number;
  openAllHoursCount: number;
}) {
  return (
    <div className="homepage-clinical-bg">
      <HomeLocationProvider>
        <HeroSearchSection mappedFacilityLabel={mappedFacilityLabel} />
        <DiscoveryRow facilities={facilities} />
        <NearbyCareSection facilities={nearbyFacilities} />
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
      </HomeLocationProvider>
    </div>
  );
}
