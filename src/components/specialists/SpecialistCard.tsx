import Link from "next/link";
import { AvailabilityIndicator } from "@/components/ui/AvailabilityIndicator";
import { Badge } from "@/components/ui/Badge";
import { Pill } from "@/components/ui/Pill";
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

// Matches FacilityCard's service-pill cap so cards stay even height within a
// grid row when a specialist lists many languages.
const MAX_VISIBLE_LANGUAGE_PILLS = 3;

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
  const visibleLanguages = specialist.languages.slice(0, MAX_VISIBLE_LANGUAGE_PILLS);
  const overflowLanguageCount = specialist.languages.length - visibleLanguages.length;

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
            <span className="mt-1 block">
              <Badge size="sm" variant="muted">
                {specialist.role}
              </Badge>
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
          <Badge size="sm" variant="info">Official</Badge>
        )}
      </div>
      {locationLine && <p className="text-xs text-muted-foreground">{locationLine}</p>}

      {specialist.languages.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visibleLanguages.map((lang) => (
            <Pill key={lang} size="sm" variant="default">
              {lang}
            </Pill>
          ))}
          {overflowLanguageCount > 0 && (
            <Pill size="sm" variant="muted">
              +{overflowLanguageCount} more
            </Pill>
          )}
        </div>
      )}

      <span className="mt-1 text-sm font-semibold text-primary">View profile →</span>
    </Link>
  );
}
