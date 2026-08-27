import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import type { NearbyFacility } from "@/components/nearby/NearbyPage";
import type { Facility } from "@/types/facility";
import { DiscoveryRow } from "./DiscoveryRow";
import { FeaturedFacilityStrip } from "./FeaturedFacilityStrip";
import { HeroSearchSection } from "./HeroSearchSection";
import { HomeLocationProvider } from "./HomeLocationProvider";
import { NearbyCareSection } from "./NearbyCareSection";
import { PromoBanner } from "./PromoBanner";
import { TrustStatsSection } from "./TrustStatsSection";

// Hierarchy, top to bottom: search (hero) -> location (one CTA feeding one
// nearby section) -> browse (discovery chips, then the rest of the directory).
//
// HomeLocationProvider wraps everything because the single location action in
// the hero and the results in NearbyCareSection sit in different branches of
// the tree; sharing one useGeolocation call is what lets granting permission
// once populate the nearby section without a second prompt appearing.
export function Homepage({
  facilities,
  nearbyFacilities,
  mappedFacilityCount,
  subCityCount,
  openAllHoursCount,
}: {
  facilities: Facility[];
  nearbyFacilities: NearbyFacility[];
  mappedFacilityCount: number;
  subCityCount: number;
  openAllHoursCount: number;
}) {
  return (
    <div className="homepage-clinical-bg">
      <HomeLocationProvider>
        <HeroSearchSection mappedFacilityCount={mappedFacilityCount} />
        <NearbyCareSection facilities={nearbyFacilities} />
        <DiscoveryRow facilities={facilities} />
        <PromoBanner />
        <TrustStatsSection openAllHoursCount={openAllHoursCount} subCityCount={subCityCount} />
        <section
          aria-labelledby="recently-added-heading"
          className="bg-transparent py-8 sm:py-10 lg:py-12"
        >
          <PageContainer>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2
                  className="font-display text-[1.75rem] font-semibold leading-tight text-foreground sm:text-3xl"
                  id="recently-added-heading"
                >
                  Recently added
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  New healthcare providers joining the directory.
                </p>
              </div>
              <Link
                className="inline-flex shrink-0 items-center rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-soft-accent hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
