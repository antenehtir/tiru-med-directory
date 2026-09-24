import type { Facility } from "@/types/facility";
import { AboutTiru } from "./AboutTiru";
import { ClosingSearchBand } from "./ClosingSearchBand";
import { ExploreMoreCare } from "./ExploreMoreCare";
import { HomeHero } from "./HomeHero";
import { HomeStats } from "./HomeStats";
import { HowItWorks } from "./HowItWorks";
import { LookingForSection } from "./LookingForSection";
import { NewOnTiru } from "./NewOnTiru";
import { ProviderBand } from "./ProviderBand";
import { SpecificSearchSection } from "./SpecificSearchSection";

// Section order follows design-ref/directory-home-{desktop,mobile}.png:
// search first, then what the directory covers, how it works, the two
// specific finders, specialties, what's new, providers, about, and a last
// search before the footer. Every figure and facility shown comes from the
// data page.tsx loaded; nothing here is a hardcoded count or a sample listing.
export function Homepage({
  facilities,
  listingCount,
  newFacilities,
}: {
  facilities: Facility[];
  listingCount: number;
  newFacilities: Facility[];
}) {
  return (
    <div className="bg-home-page font-body text-home-text">
      <HomeHero />
      <HomeStats listingCount={listingCount} />
      <LookingForSection />
      <HowItWorks />
      <SpecificSearchSection />
      <ExploreMoreCare facilities={facilities} />
      <NewOnTiru facilities={newFacilities} />
      <ProviderBand />
      <AboutTiru />
      <ClosingSearchBand />
    </div>
  );
}
