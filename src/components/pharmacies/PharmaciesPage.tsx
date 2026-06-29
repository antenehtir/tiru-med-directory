import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { FacilityListingExperience } from "@/components/search/FacilityListingExperience";
import { ListingStatusBanner } from "@/components/ui/ListingStatusBanner";
import { PharmacyFilterChips } from "./PharmacyFilterChips";
import { PharmacyHero } from "./PharmacyHero";
import type { Facility } from "@/types/facility";

type PharmaciesPageProps = {
  activeStatus?: string;
  pharmacies?: Facility[];
};

export function PharmaciesPage({
  activeStatus,
  pharmacies = [],
}: PharmaciesPageProps) {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <ListingStatusBanner />
        <PharmacyHero />
        <PharmacyFilterChips activeStatus={activeStatus} />
        <FacilityListingExperience
          facilities={pharmacies}
          lockedType="pharmacy"
          emptyState={
            <p className="text-sm leading-6 text-muted-foreground">
              Pharmacy listings coming soon.{" "}
              <Link className="font-semibold text-primary" href="/provider/signup">
                List your facility &rarr;
              </Link>
            </p>
          }
        />
      </div>
    </PageContainer>
  );
}
