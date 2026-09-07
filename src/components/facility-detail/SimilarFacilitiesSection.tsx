import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import type { Facility } from "@/types/facility";

type SimilarFacilitiesSectionProps = {
  facilities: Facility[];
  // The specialty each suggestion shares with the facility being viewed.
  // Without it the rail asserts that three strangers are comparable and leaves
  // the reader to work out why — the same question search results already
  // answer with their matched-service chip.
  highlightByFacilityId?: Record<string, string>;
  // Distance from the facility being viewed, not from the visitor.
  distanceByFacilityId?: Record<string, string>;
  // Named in the copy so "2.4 km" and the tinted service pill both have a
  // stated point of reference. A highlighted pill with nothing explaining it
  // is a colour the reader has to guess the meaning of.
  originName?: string;
};

export function SimilarFacilitiesSection({
  facilities,
  highlightByFacilityId,
  distanceByFacilityId,
  originName,
}: SimilarFacilitiesSectionProps) {
  const hasHighlights = Object.keys(highlightByFacilityId ?? {}).length > 0;
  const hasDistances = Object.keys(distanceByFacilityId ?? {}).length > 0;
  const here = originName ?? "this facility";

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
          {hasHighlights ? (
            <>
              The tinted service is what each one shares with {here}
              {hasDistances ? ", and the distance is measured from it" : ""}.
            </>
          ) : hasDistances ? (
            <>Distances are measured from {here}.</>
          ) : (
            <>Compare facility information, services, and trust signals.</>
          )}
        </p>
      </div>
      <FacilityCardGrid
        distanceByFacilityId={distanceByFacilityId}
        facilities={facilities}
        highlightByFacilityId={highlightByFacilityId}
      />
    </section>
  );
}
