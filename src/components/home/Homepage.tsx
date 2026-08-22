import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Facility } from "@/types/facility";
import { CategoryShowcaseSection } from "./CategoryShowcaseSection";
import { FeaturedFacilityStrip } from "./FeaturedFacilityStrip";
import { HeroSearchSection } from "./HeroSearchSection";
import { PromoBanner } from "./PromoBanner";
import { QuickCategoriesSection } from "./QuickCategoriesSection";
import { TrustStatsSection } from "./TrustStatsSection";

export function Homepage({ facilities }: { facilities: Facility[] }) {
  return (
    <div className="homepage-clinical-bg">
      <HeroSearchSection />
      <QuickCategoriesSection />
      <PromoBanner />
      <CategoryShowcaseSection />
      <TrustStatsSection />
      <section className="bg-transparent py-8 sm:py-10 lg:py-12">
        <PageContainer>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[2rem] font-semibold leading-[1.1] text-foreground">
              Recently added
            </h2>
            <Link
              className="-mr-2 inline-flex shrink-0 items-center rounded-lg px-2 py-2 text-sm font-medium text-primary transition-colors hover:bg-soft-accent hover:text-primary-hover"
              href="/facilities"
            >
              Browse all →
            </Link>
          </div>
          <FeaturedFacilityStrip facilities={facilities} />
        </PageContainer>
      </section>
    </div>
  );
}
