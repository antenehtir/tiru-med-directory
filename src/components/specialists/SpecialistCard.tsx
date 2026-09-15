import Link from "next/link";
import { MapPinIcon } from "@/components/cards/contact-icons";
import { AvailabilityIndicator } from "@/components/ui/AvailabilityIndicator";
import { Badge } from "@/components/ui/Badge";
import { personInitials } from "@/lib/person-initials";
import { formatDoctorDisplayName, specialistTitle } from "@/lib/provider/doctor-types";
import { appointmentPolicyDescription } from "@/lib/provider/onboarding-config";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";

const OFFICIAL_BADGE_STATUSES = new Set(["facility-owned", "verified"]);

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
  // One clean title ("General Pediatrician") instead of the role badge
  // ("Specialist") and the specialty · subspecialty line sitting side by
  // side saying overlapping things — see specialistTitle for why subspecialty
  // wins when it has something more specific to say than its parent. Falls
  // back to the raw role (Nurse, Pharmacist, ...) for the non-clinical roles
  // that were never asked for a specialty in the first place — without this
  // those cards would show no title at all instead of just losing the
  // duplication.
  const title = specialistTitle(specialist.specialty, specialist.subspecialty) || specialist.role;
  const appointment = appointmentPolicyDescription(specialist.facilityWalkinAppointment);

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
          {title && <p className="mt-1 text-sm font-medium text-primary">{title}</p>}
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

      {/* Most specialist visits need booking ahead — leaving this out when
          the facility never answered the question would silently read as
          "walk in any time", which is wrong far more often than it's right.
          appointmentPolicyDescription's fallback says so plainly instead. */}
      <p
        className={`text-xs font-medium ${appointment.isStated ? "text-foreground" : "text-muted-foreground"}`}
      >
        {appointment.text}
      </p>

      <span className="mt-1 text-sm font-semibold text-primary">
        Tap to view full profile &amp; schedule →
      </span>
    </Link>
  );
}
