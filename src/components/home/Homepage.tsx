import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import type { NearbyFacility, NearbySpecialist } from "@/components/nearby/NearbyPage";
import type { Facility } from "@/types/facility";
import { FeaturedFacilityStrip } from "./FeaturedFacilityStrip";
import { HeroSearchSection } from "./HeroSearchSection";
import { NearMeGroup } from "./NearMeGroup";
import { PromoBanner } from "./PromoBanner";
import { QuickCategoriesSection } from "./QuickCategoriesSection";
import { TrustStatsSection } from "./TrustStatsSection";

export function Homepage({ facilities, nearbyFacilities, nearbySpecialists }: { facilities: Facility[]; nearbyFacilities: NearbyFacility[]; nearbySpecialists: NearbySpecialist[] }) {
  return (
    <div className="homepage-clinical-bg">
      <HeroSearchSection />
      <NearMeGroup facilities={nearbyFacilities} specialists={nearbySpecialists} />
      <QuickCategoriesSection />
      <PromoBanner />
      <TrustStatsSection />
      <section aria-labelledby="recently-added-heading" className="bg-transparent py-8 sm:py-10 lg:py-12">
        <PageContainer>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">Discover more</p>
              <h2 id="recently-added-heading" className="font-display text-[1.75rem] font-semibold leading-tight text-foreground sm:text-3xl">
                Recently added
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">New healthcare providers joining the directory.</p>
            </div>
            <Link className="inline-flex shrink-0 items-center rounded-lg px-2 py-2 text-sm font-semibold text-primary transition-colors hover:bg-soft-accent hover:text-primary-hover" href="/facilities">
              Browse all <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
          <FeaturedFacilityStrip facilities={facilities} />
        </PageContainer>
      </section>
    </div>
  );
}
