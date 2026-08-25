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

type FacilityDetailPageProps = { facility?: Facility; similarFacilities?: Facility[] };

export function FacilityDetailPage({ facility, similarFacilities }: FacilityDetailPageProps = {}) {
  if (!facility) return null;
  const selectedSimilarFacilities = similarFacilities ?? [];

  return (
    <PageContainer className="py-6 sm:py-10 lg:py-14">
      <div className="grid gap-6 sm:gap-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6">
          <FacilityDetailHeader facility={facility} />

          <div className="lg:sticky lg:top-24">
            <div className="hidden lg:block">
              <FacilityActionPanel facility={facility} />
            </div>
            <div className="lg:hidden">
              <FacilityActionPanel facility={facility} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8">
          <FacilityServicesSection facility={facility} />
          <FacilityDoctorsSection facility={facility} />
          <FacilityHoursSection facility={facility} />
          <FacilityInformationSection facility={facility} />
        </div>

        <CorrectionCta facilitySlug={facility.slug} />
        <SimilarFacilitiesSection facilities={selectedSimilarFacilities} />
      </div>
    </PageContainer>
  );
}
