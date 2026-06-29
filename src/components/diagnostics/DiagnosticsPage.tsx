import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { FacilityListingExperience } from "@/components/search/FacilityListingExperience";
import { ListingStatusBanner } from "@/components/ui/ListingStatusBanner";
import { DiagnosticsFilterChips } from "./DiagnosticsFilterChips";
import { DiagnosticsHero } from "./DiagnosticsHero";
import type { Facility } from "@/types/facility";

type DiagnosticsPageProps = {
  activeType?: string;
  diagnostics?: Facility[];
};

export function DiagnosticsPage({ activeType, diagnostics = [] }: DiagnosticsPageProps) {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <ListingStatusBanner />
        <DiagnosticsHero />
        <DiagnosticsFilterChips activeType={activeType} />
        <FacilityListingExperience
          facilities={diagnostics}
          lockedType="diagnostics"
          emptyState={
            <p className="text-sm leading-6 text-muted-foreground">
              Diagnostics listings coming soon.{" "}
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
