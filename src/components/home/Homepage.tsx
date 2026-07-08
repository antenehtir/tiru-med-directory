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
      <section className="bg-transparent py-8">
        <PageContainer>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Recently added
            </h2>
            <Link
              className="text-sm font-medium text-primary hover:text-primary-hover"
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
