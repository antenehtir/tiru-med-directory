import {
  getAvailabilityStatus,
  weeklyScheduleLines,
  type ScheduleRow,
} from "@/lib/schedule-availability";

// A specialist's week at a glance, then today's status as a small extra:
//
//   Mon–Fri   8:00 AM – 5:00 PM
//   Sat       8:00 AM – 12:00 PM
//   ● Available now
//
// The week comes first because it is what a patient plans a visit around;
// "available now" only helps someone who can go this minute. Times never
// wrap mid-value — "5:00" on one line and "PM" on the next read as two
// separate facts on a narrow phone card.
export function AvailabilityIndicator({
  schedule,
}: {
  schedule: ScheduleRow[] | undefined | null;
}) {
  const lines = weeklyScheduleLines(schedule);
  if (lines.length === 0) return null;

  const status = getAvailabilityStatus(schedule);
  const isAvailableNow = status.state === "open-now";
  const statusLabel =
    status.state === "open-now"
      ? "Available now"
      : status.state === "opens-later-today"
        ? `Opens today at ${status.opensAt}`
        : status.state === "next-available-day"
          ? `Next available ${status.day}`
          : null;

  return (
    <div className="space-y-1">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        {lines.map((line) => (
          <div className="contents" key={line.days}>
            <dt className="whitespace-nowrap font-medium text-foreground">{line.days}</dt>
            <dd className="whitespace-nowrap text-muted-foreground">{line.hours}</dd>
          </div>
        ))}
      </dl>
      {statusLabel && (
        <p className="flex items-center gap-1.5 text-xs">
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 rounded-full ${isAvailableNow ? "bg-success" : "bg-muted-foreground"}`}
          />
          <span className={isAvailableNow ? "font-medium text-success-text" : "text-muted-foreground"}>
            {statusLabel}
          </span>
        </p>
      )}
    </div>
  );
}
