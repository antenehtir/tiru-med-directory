"use client";

import { useMemo, useState } from "react";
import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import {
  facilityMatchesArea,
  getAreaOptionsForFacilities,
} from "@/lib/facility-area-filter";
import type { Facility } from "@/types/facility";

type FacilityAreaFilteredGridProps = {
  facilities: Facility[];
};

function FunnelIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={16}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      width={16}
    >
      <path d="M4 5h16l-6 7.5V19l-4 2v-8.5z" />
    </svg>
  );
}

export function FacilityAreaFilteredGrid({
  facilities,
}: FacilityAreaFilteredGridProps) {
  const [selectedArea, setSelectedArea] = useState("all");
  const areaOptions = useMemo(
    () => getAreaOptionsForFacilities(facilities),
    [facilities],
  );

  const filteredFacilities = useMemo(
    () => facilities.filter((facility) => facilityMatchesArea(facility, selectedArea)),
    [facilities, selectedArea],
  );

  return (
    <div className="grid gap-4">
      {areaOptions.length > 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <FunnelIcon />
          <select
            aria-label="Filter by area"
            className="min-h-10 cursor-pointer rounded-xl border border-border bg-card px-3 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            onChange={(event) => setSelectedArea(event.target.value)}
            value={selectedArea}
          >
            <option value="all">All areas</option>
            {areaOptions.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <FacilityCardGrid facilities={filteredFacilities} />
    </div>
  );
}
