import { PageContainer } from "@/components/layout/PageContainer";
import type { Facility } from "@/types/facility";
import { CorrectionCta } from "@/components/ui/CorrectionCta";
import { FacilityActionPanel } from "./FacilityActionPanel";
import { FacilityDetailHeader } from "./FacilityDetailHeader";
import { FacilityDoctorsSection } from "./FacilityDoctorsSection";
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
      <div className="grid gap-8">
        {/* Top section: header + desktop sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <FacilityDetailHeader facility={facility} />
          {/* Desktop sidebar — hidden on mobile */}
          <div className="hidden lg:block lg:sticky lg:top-24">
            <FacilityActionPanel facility={facility} />
          </div>
        </div>

        {/* Content sections — patient-priority order: what care is offered,
            then who works here, then hours, then overview/payment. */}
        <div className="grid gap-8">
          <FacilityServicesSection facility={facility} />
          <FacilityDoctorsSection facility={facility} />
          <FacilityHoursSection facility={facility} />
          <FacilityInformationSection facility={facility} />
        </div>

        {/* Mobile action panel — shown only on mobile, after content */}
        <div className="lg:hidden">
          <FacilityActionPanel facility={facility} />
        </div>

        <CorrectionCta facilitySlug={facility.slug} />
        <SimilarFacilitiesSection facilities={selectedSimilarFacilities} />
      </div>
    </PageContainer>
  );
}
