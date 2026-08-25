import { PageContainer } from "@/components/layout/PageContainer";
import type { Facility } from "@/types/facility";
import { CorrectionCta } from "@/components/ui/CorrectionCta";
import { FacilityActionPanel } from "./FacilityActionPanel";
import { FacilityDetailHeader } from "./FacilityDetailHeader";
import { FacilityDoctorsSection } from "./FacilityDoctorsSection";
import { FacilityHoursSection } from "./FacilityHoursSection";
import { FacilityInformationSection } from "./FacilityInformationSection";
import { FacilityServicesSection } from "./FacilityServicesSection";
import { FacilityTrustSection } from "./FacilityTrustSection";
import { SimilarFacilitiesSection } from "./SimilarFacilitiesSection";

type FacilityDetailPageProps = { facility?: Facility; similarFacilities?: Facility[] };

export function FacilityDetailPage({ facility, similarFacilities }: FacilityDetailPageProps = {}) {
  if (!facility) return null;
  const selectedSimilarFacilities = similarFacilities ?? [];

  return (
    <PageContainer className="py-4 sm:py-8 lg:py-12">
      <div className="grid gap-5 sm:gap-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6">
          <FacilityDetailHeader facility={facility} />

          <div className="lg:sticky lg:top-24">
            <FacilityActionPanel facility={facility} />
          </div>
        </div>

        <div className="grid gap-5 sm:gap-7">
          <section aria-labelledby="care-heading" className="grid gap-5 sm:gap-7">
            <div id="care-heading" className="sr-only">Care and clinical information</div>
            <FacilityServicesSection facility={facility} />
            <FacilityDoctorsSection facility={facility} />
          </section>

          <section aria-labelledby="visit-heading" className="grid gap-5 sm:gap-7">
            <div id="visit-heading" className="sr-only">Plan your visit</div>
            <FacilityHoursSection facility={facility} />
            <FacilityInformationSection facility={facility} />
          </section>

          <FacilityTrustSection facility={facility} />
        </div>

        <CorrectionCta facilitySlug={facility.slug} />
        <SimilarFacilitiesSection facilities={selectedSimilarFacilities} />
      </div>
    </PageContainer>
  );
}
