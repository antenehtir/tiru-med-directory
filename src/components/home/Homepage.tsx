import { FeaturedFacilityStrip } from "./FeaturedFacilityStrip";
import { HeroSearchSection } from "./HeroSearchSection";
import { QuickCategoriesSection } from "./QuickCategoriesSection";

export function Homepage() {
  return (
    <div className="homepage-clinical-bg">
      <HeroSearchSection />
      <FeaturedFacilityStrip />
      <QuickCategoriesSection />
    </div>
  );
}
