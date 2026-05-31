import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import { sampleFacilities } from "@/data/sampleFacilities";
import { FacilitiesHero } from "./FacilitiesHero";
import { FacilityCategoryFilters } from "./FacilityCategoryFilters";
import { FacilitySearchPreview } from "./FacilitySearchPreview";
import { FacilityTrustBlock } from "./FacilityTrustBlock";
import { RequestFacilityAdditionCta } from "./RequestFacilityAdditionCta";

export function FacilitiesPage() {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <FacilitiesHero />
        <FacilitySearchPreview />
        <FacilityCategoryFilters />

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Facility results
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Sample facility cards using the reusable card system.
            </p>
          </div>
          <FacilityCardGrid facilities={sampleFacilities} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <FacilityTrustBlock />
          <RequestFacilityAdditionCta />
        </div>
      </div>
    </PageContainer>
  );
}
