import Link from "next/link";
import { AvailabilityIndicator } from "@/components/ui/AvailabilityIndicator";
import { formatDoctorDisplayName } from "@/lib/provider/doctor-types";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";

function getInitials(name: string): string {
  return name
    .replace(/^dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const OFFICIAL_BADGE_STATUSES = new Set(["facility-owned", "verified"]);

export function SpecialistCard({
  specialist,
  distanceLabel,
}: {
  specialist: SpecialistListItem;
  distanceLabel?: string;
}) {
  const initials = getInitials(specialist.fullName);
  const locationLine = [specialist.facilityArea, specialist.facilitySubCity]
    .filter(Boolean)
    .join(", ");
  const isOfficial = OFFICIAL_BADGE_STATUSES.has(specialist.facilityBadge);
  const profileHref = `/specialists/${specialist.slug}`;

  return (
    <Link
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
      href={profileHref}
    >
      {distanceLabel && (
        <p className="text-sm font-semibold text-primary">📍 {distanceLabel}</p>
      )}
      <div className="flex items-start gap-3">
        {specialist.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={specialist.fullName}
            className="size-16 shrink-0 rounded-full object-cover ring-2 ring-primary/20 sm:size-[72px]"
            src={specialist.photoUrl}
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-soft-accent text-lg font-bold text-primary ring-2 ring-primary/20 sm:size-[72px]">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-tight text-foreground">
            {formatDoctorDisplayName(specialist.title, specialist.fullName)}
          </p>
          {specialist.role && (
            <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {specialist.role}
            </span>
          )}
          {(specialist.specialty || specialist.subspecialty) && (
            <p className="mt-1.5 text-sm font-medium text-primary">
              {specialist.specialty}
              {specialist.subspecialty ? (
                <span className="font-normal text-muted-foreground"> · {specialist.subspecialty}</span>
              ) : null}
            </p>
          )}
          <div className="mt-1.5">
            <AvailabilityIndicator schedule={specialist.availableSchedule} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground group-hover:text-primary">
          {specialist.facilityName}
        </span>
        {isOfficial && (
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Official
          </span>
        )}
      </div>
      {locationLine && <p className="text-xs text-muted-foreground">{locationLine}</p>}

      {specialist.languages.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {specialist.languages.map((lang) => (
            <span
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              key={lang}
            >
              {lang}
            </span>
          ))}
        </div>
      )}

      <span className="mt-1 text-sm font-semibold text-primary">View profile →</span>
    </Link>
  );
}
