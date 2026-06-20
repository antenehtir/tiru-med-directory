import { PageContainer } from "@/components/layout/PageContainer";
import type { Facility } from "@/types/facility";
import { FacilityActionPanel } from "./FacilityActionPanel";
import { FacilityCorrectionCta } from "./FacilityCorrectionCta";
import { FacilityDetailHeader } from "./FacilityDetailHeader";
import { FacilityHoursSection } from "./FacilityHoursSection";
import { FacilityInformationSection } from "./FacilityInformationSection";
import { FacilityServicesSection } from "./FacilityServicesSection";
import { SimilarFacilitiesSection } from "./SimilarFacilitiesSection";
import { TrustExplainerStrip } from "./TrustExplainerStrip";

type FacilityDetailPageProps = {
  facility?: Facility;
  similarFacilities?: Facility[];
};

export function FacilityDetailPage({
  facility,
  similarFacilities,
}: FacilityDetailPageProps = {}) {
  if (!facility) {
    return null;
  }

  const selectedSimilarFacilities = similarFacilities ?? [];

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <FacilityDetailHeader facility={facility} />
          <FacilityActionPanel facility={facility} />
        </div>

        <TrustExplainerStrip status={facility.verificationStatus} />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-6">
            <FacilityInformationSection facility={facility} />
            <FacilityServicesSection facility={facility} />
            <FacilityHoursSection facility={facility} />
          </div>

          <div className="grid gap-6">
            <FacilityCorrectionCta facility={facility} />
          </div>
        </div>

        <SimilarFacilitiesSection facilities={selectedSimilarFacilities} />
      </div>
    </PageContainer>
  );
}
