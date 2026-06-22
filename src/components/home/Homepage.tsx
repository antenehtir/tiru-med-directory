import { PageContainer } from "@/components/layout/PageContainer";
import { CategoryShowcaseSection } from "./CategoryShowcaseSection";
import { FeaturedFacilityStrip } from "./FeaturedFacilityStrip";
import { HeroSearchSection } from "./HeroSearchSection";
import { PromoBanner } from "./PromoBanner";
import { QuickCategoriesSection } from "./QuickCategoriesSection";
import { TrustStatsSection } from "./TrustStatsSection";

export function Homepage() {
  return (
    <div className="homepage-clinical-bg">
      <HeroSearchSection />
      <QuickCategoriesSection />
      <PromoBanner />
      <CategoryShowcaseSection />
      <TrustStatsSection />
      <section className="bg-transparent py-8">
        <PageContainer>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Recently added
          </h2>
          <FeaturedFacilityStrip />
        </PageContainer>
      </section>
    </div>
  );
}
