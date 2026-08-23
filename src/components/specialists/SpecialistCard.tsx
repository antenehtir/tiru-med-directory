import Link from "next/link";
import { MapPinIcon } from "@/components/cards/contact-icons";
import { AvailabilityIndicator } from "@/components/ui/AvailabilityIndicator";
import { Badge } from "@/components/ui/Badge";
import { Pill } from "@/components/ui/Pill";
import { personInitials } from "@/lib/person-initials";
import { formatDoctorDisplayName } from "@/lib/provider/doctor-types";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";

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
  const initials = personInitials(specialist.fullName);
  const locationLine = [specialist.facilityArea, specialist.facilitySubCity]
    .filter(Boolean)
    .join(", ");
  const isOfficial = OFFICIAL_BADGE_STATUSES.has(specialist.facilityBadge);
  const profileHref = `/specialists/${specialist.slug}`;
  const visibleLanguages = specialist.languages.slice(0, MAX_VISIBLE_LANGUAGE_PILLS);
  const overflowLanguageCount = specialist.languages.length - visibleLanguages.length;

  return (
    <Link
      className="group flex flex-col gap-3 rounded-card border border-border bg-card p-5 shadow-card transition-all duration-150 hover:-translate-y-px hover:border-strong-border hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none"
      href={profileHref}
    >
      {distanceLabel && (
        <p className="flex items-center gap-1 text-[13px] font-medium text-foreground">
          <MapPinIcon className="size-3.5 shrink-0 text-muted-foreground" />
          {distanceLabel}
        </p>
      )}
      <div className="flex items-start gap-3">
        {specialist.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={specialist.fullName}
            className="size-16 shrink-0 rounded-full border border-border object-cover sm:size-[72px]"
            src={specialist.photoUrl}
          />
        ) : (
          // Same monogram idea as the facility plate: initials in the display
          // face rather than a generic avatar glyph.
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border bg-soft-accent font-display text-lg font-bold text-primary sm:size-[72px]">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[19px] font-semibold leading-[1.15] text-foreground">
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
