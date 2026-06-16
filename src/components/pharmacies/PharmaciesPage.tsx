import { PageContainer } from "@/components/layout/PageContainer";
import { PharmacyFilterChips } from "./PharmacyFilterChips";
import { PharmacyHero } from "./PharmacyHero";
import { PharmacyResultsSection } from "./PharmacyResultsSection";
import type { Facility } from "@/types/facility";

type PharmaciesPageProps = {
  activeStatus?: string;
  pharmacies?: Facility[];
};

export function PharmaciesPage({
  activeStatus,
  pharmacies,
}: PharmaciesPageProps) {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <PharmacyHero />
        <PharmacyFilterChips activeStatus={activeStatus} />
        <PharmacyResultsSection pharmacies={pharmacies} />
      </div>
    </PageContainer>
  );
}
