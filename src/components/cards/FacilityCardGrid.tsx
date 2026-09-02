import { FacilityCard } from "./FacilityCard";
import type { Facility } from "@/types/facility";

type FacilityCardGridProps = {
  facilities: Facility[];
  // Maps facility id -> the service that caused it to match an active filter.
  highlightByFacilityId?: Record<string, string>;
};

export function FacilityCardGrid({ facilities, highlightByFacilityId }: FacilityCardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {facilities.map((facility) => (
        <FacilityCard facility={facility} highlightLabel={highlightByFacilityId?.[facility.id]} key={facility.id} />
      ))}
    </div>
  );
}
