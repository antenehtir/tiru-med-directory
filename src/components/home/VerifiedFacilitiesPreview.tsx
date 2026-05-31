import Link from "next/link";
import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import { sampleFacilities } from "@/data/sampleFacilities";
import { SectionHeading } from "./SectionHeading";

export function VerifiedFacilitiesPreview() {
  return (
    <section className="bg-card">
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Trust"
            title="Verified facilities should stand out clearly."
            description="Sample facility cards show how verified healthcare information can be presented consistently."
          />
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-primary"
            href="/facilities"
          >
            Browse facilities
          </Link>
        </div>
        <div className="mt-6">
          <FacilityCardGrid facilities={sampleFacilities.slice(0, 3)} />
        </div>
      </PageContainer>
    </section>
  );
}
