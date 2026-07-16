import type { Facility } from "@/types/facility";

type FacilityLastUpdatedProps = {
  facility: Facility;
};

// Only Official (provider-managed) listings have a meaningful update timestamp —
// CS facilities are community-sourced and don't have provider-driven edits.
const OFFICIAL_STATUSES = new Set(["facility-owned", "verified"]);

export function FacilityLastUpdated({ facility }: FacilityLastUpdatedProps) {
  if (!OFFICIAL_STATUSES.has(facility.verificationStatus) || !facility.updatedAt) {
    return null;
  }

  const date = new Date(facility.updatedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
      Updated {formatted}
      <span
        aria-hidden="true"
        className="inline-flex size-4 items-center justify-center rounded-full border border-border text-[10px]"
        title="This facility manages its own listing on Tiru"
      >
        i
      </span>
    </p>
  );
}
