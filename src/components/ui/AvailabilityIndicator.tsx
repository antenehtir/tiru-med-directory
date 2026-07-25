import { getAvailabilityStatus, type ScheduleRow } from "@/lib/schedule-availability";

// Compact "is this person/place available right now" line for card contexts
// — same visual language as the full "Open now" badge (FacilityHoursSection,
// SpecialistAvailabilitySection) but smaller, and folds in the "opens later"
// / "next available day" states those badges don't need to show inline.
export function AvailabilityIndicator({
  schedule,
}: {
  schedule: ScheduleRow[] | undefined | null;
}) {
  const status = getAvailabilityStatus(schedule);

  if (status.state === "unavailable") return null;

  const isAvailableNow = status.state === "open-now";

  const label =
    status.state === "open-now"
      ? `Available now · ${status.todayHours}`
      : status.state === "opens-later-today"
        ? `Opens at ${status.opensAt}`
        : `Next available ${status.day.slice(0, 3)}`;

  return (
    <p className="flex items-center gap-1.5 text-xs">
      <span
        className={`size-1.5 shrink-0 rounded-full ${
          isAvailableNow ? "bg-success" : "bg-muted-foreground"
        }`}
      />
      <span
        className={
          isAvailableNow ? "font-medium text-success-text" : "text-muted-foreground"
        }
      >
        {label}
      </span>
    </p>
  );
}
