import { PageContainer } from "@/components/layout/PageContainer";
import type { Facility } from "@/types/facility";
import { FacilityActionPanel } from "./FacilityActionPanel";
import { FacilityCorrectionCta } from "./FacilityCorrectionCta";
import { FacilityDetailHeader } from "./FacilityDetailHeader";
import { FacilityHoursSection } from "./FacilityHoursSection";
import { FacilityInformationSection } from "./FacilityInformationSection";
import { FacilityServicesSection } from "./FacilityServicesSection";
import { SimilarFacilitiesSection } from "./SimilarFacilitiesSection";

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
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        {/* LEFT COLUMN — main content */}
        <div className="grid gap-6 lg:order-1">
          <FacilityDetailHeader facility={facility} />
          <FacilityInformationSection facility={facility} />
          <FacilityServicesSection facility={facility} />
          <FacilityHoursSection facility={facility} />
          <FacilityCorrectionCta facility={facility} />
          <SimilarFacilitiesSection facilities={selectedSimilarFacilities} />
        </div>

        {/* RIGHT COLUMN / MOBILE BOTTOM — action panel */}
        {/* order-last on mobile pushes it below all content */}
        {/* lg:order-2 restores it to the right sidebar on desktop */}
        <div className="order-last lg:order-2 lg:sticky lg:top-24">
          <FacilityActionPanel facility={facility} />
        </div>
      </div>
    </PageContainer>
  );
}
