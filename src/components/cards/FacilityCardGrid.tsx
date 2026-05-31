import { FacilityCard } from "./FacilityCard";
import type { Facility } from "@/types/facility";

type FacilityCardGridProps = {
  facilities: Facility[];
};

export function FacilityCardGrid({ facilities }: FacilityCardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {facilities.map((facility) => (
        <FacilityCard key={facility.id} facility={facility} />
      ))}
    </div>
  );
}
