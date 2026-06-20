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
      <FeaturedFacilityStrip />
      <TrustStatsSection />
    </div>
  );
}
