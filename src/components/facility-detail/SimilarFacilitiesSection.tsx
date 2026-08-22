import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import type { Facility } from "@/types/facility";

type SimilarFacilitiesSectionProps = {
  facilities: Facility[];
};

export function SimilarFacilitiesSection({
  facilities,
}: SimilarFacilitiesSectionProps) {
  return (
    <section>
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">
          Similar facilities
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground">
          Other healthcare options to compare
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Compare facility information, services, and trust signals.
        </p>
      </div>
      <FacilityCardGrid facilities={facilities} />
    </section>
  );
}
