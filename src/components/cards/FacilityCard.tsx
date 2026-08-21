"use client";

import Link from "next/link";
import {
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
} from "@/components/cards/contact-icons";
import {
  facilityBannerGradientClasses,
  facilityCategoryBadgeClasses,
  facilityCategoryBadgeLabels,
  facilityWatermarkIconKey,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { WorkingHoursIndicator } from "@/components/cards/WorkingHoursIndicator";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Pill } from "@/components/ui/Pill";
import { createPublicContactActions } from "@/lib/contact-actions";
import { getAvailabilityStatus } from "@/lib/schedule-availability";
import type { Facility } from "@/types/facility";

// Cap visible service pills so facilities with long service lists don't grow
// cards unevenly tall within a grid row — overflow collapses to "+N more".
const MAX_VISIBLE_SERVICE_PILLS = 3;

// Verification tiers that should never render bare — a facility with no
// record here (e.g. "community-submitted") gets no badge at all, since
// showing nothing is safer than showing something that could read as trust
// signal for an unverified listing.
const BANNER_BADGE_STATUSES = new Set(["facility-owned", "verified", "pending"]);

type FacilityCardProps = {
  facility: Facility;
  distanceLabel?: string;
};

type FacilityBannerProps = {
  facility: Facility;
  heightClassName?: string;
};

// Shared banner used by both FacilityCard and CompactFacilityCard — real
// cover photo (first of photo_urls, falling back to the legacy single-URL
// column) when available, category gradient + watermark icon otherwise.
// NOTE: this intentionally does NOT show facility.logoUrl — the circular
// logo overlay is a facility-detail-page-only affordance (FacilityDetailHeader).
export function FacilityBanner({
  facility,
  heightClassName = "aspect-[16/9]",
}: FacilityBannerProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];
  const coverPhotoUrl =
    facility.photoUrls?.find((url) => url?.trim())?.trim() ||
    facility.photoUrl?.trim() ||
    undefined;
  const showBadge = BANNER_BADGE_STATUSES.has(facility.verificationStatus);

  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden rounded-t-2xl bg-muted ${heightClassName}`}
    >
      {coverPhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          src={coverPhotoUrl}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${facilityBannerGradientClasses[categoryKey]}`}
        >
          <WatermarkIcon className="size-10 text-primary/40" />
        </div>
      )}

      {showBadge ? (
        <div className="absolute right-2 top-2 drop-shadow-sm">
          <VerificationBadge status={facility.verificationStatus} />
        </div>
      ) : null}

      <div className="absolute bottom-2 left-2">
        <Pill
          className={`${facilityCategoryBadgeClasses[categoryKey]} backdrop-blur-sm`}
          size="sm"
        >
          {facilityCategoryBadgeLabels[categoryKey]}
        </Pill>
      </div>
    </div>
  );
}

function ServicePillRow({ services }: { services: string[] }) {
  if (services.length === 0) return null;

  const visible = services.slice(0, MAX_VISIBLE_SERVICE_PILLS);
  const overflowCount = services.length - visible.length;

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {visible.map((service, index) => (
        <Pill key={`${service}-${index}`} size="sm" variant="muted">
          {service}
        </Pill>
      ))}
      {overflowCount > 0 ? (
        <Pill size="sm" variant="muted">+{overflowCount} more</Pill>
      ) : null}
    </div>
  );
}

// Compact "phone · hours" line. Open/closed is derived from the same
// getAvailabilityStatus() used by FacilityHoursSection on the detail page and
// AvailabilityIndicator on specialist cards — not recomputed here. Facilities
// without a structured schedule fall back to the plain workingHours text
// (WorkingHoursIndicator) since a live open/closed state can't be computed
// from free text.
function ContactHoursLine({ facility }: { facility: Facility }) {
  const contactActions = createPublicContactActions(facility.contactChannels);
  const callAction = contactActions.find((action) => action.kind === "phone");
  const phoneNumber = callAction?.label.replace(/^Call\s+/, "");

  const hasStructuredSchedule = Boolean(facility.schedule?.length);
  const availability = hasStructuredSchedule
    ? getAvailabilityStatus(facility.schedule)
    : null;

  let hoursNode: React.ReactNode = null;

  if (availability) {
    const isOpenNow = availability.state === "open-now";
    const label = isOpenNow
      ? availability.is24Hours
        ? "Open 24/7"
        : "Open now"
      : availability.state === "opens-later-today"
        ? `Opens ${availability.opensAt}`
        : availability.state === "next-available-day"
          ? `Opens ${availability.day.slice(0, 3)}`
          : "Closed now";

    hoursNode = (
      <span className="inline-flex items-center gap-1">
        <ClockIcon className="size-3.5 shrink-0" />
        <span className={isOpenNow ? "font-medium text-success-text" : "text-muted-foreground"}>
          {label}
        </span>
      </span>
    );
  } else if (facility.workingHours?.trim()) {
    hoursNode = (
      <span className="inline-flex items-center gap-1">
        <ClockIcon className="size-3.5 shrink-0" />
        <WorkingHoursIndicator hours={facility.workingHours} />
      </span>
    );
  }

  if (!phoneNumber && !hoursNode) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {phoneNumber ? (
        <span className="inline-flex items-center gap-1">
          <PhoneIcon className="size-3.5 shrink-0" />
          {phoneNumber}
        </span>
      ) : null}
      {hoursNode}
    </div>
  );
}

// Insurance is stored as a flag inside facility.paymentMethods ("Insurance"),
// not a list of accepted providers — so this shows a plain "Insurance
// accepted" indicator rather than a fabricated provider count. No bed-count
// stat here: facilities have no capacity/beds field in the schema today.
function StatRow({ facility }: { facility: Facility }) {
  const hasInsurance = facility.paymentMethods?.includes("Insurance") ?? false;

  if (!hasInsurance) return null;

  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
      <ShieldIcon className="size-3.5 shrink-0 text-primary/70" />
      Insurance accepted
    </div>
  );
}

// The canonical facility card — used in the facilities/search/category grids,
// Nearby (with an optional distanceLabel), and Similar Facilities.
export function FacilityCard({ facility, distanceLabel }: FacilityCardProps) {
  const detailHref = facility.detailHref ?? `/facilities/${facility.slug}`;
  const addressLine = facility.location || facility.address;

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <FacilityBanner facility={facility} />

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <Link
          className="break-words text-base font-bold leading-snug text-foreground hover:text-primary sm:text-lg"
          href={detailHref}
        >
          {/* Stretched over the whole card so the entire card is clickable
              through one real anchor (not a div onClick) — the CTA link below
              stays a second, focusable anchor to the same destination. */}
          <span aria-hidden="true" className="absolute inset-0" />
          {facility.name}
        </Link>

        {addressLine ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <MapPinIcon className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate" title={addressLine}>
              {addressLine}
            </span>
            {distanceLabel ? (
              <span className="shrink-0 whitespace-nowrap font-medium text-primary">
                · {distanceLabel}
              </span>
            ) : null}
          </p>
        ) : null}

        <ContactHoursLine facility={facility} />
        <StatRow facility={facility} />
        <ServicePillRow services={facility.services} />

        <div className="relative z-10 mt-auto pt-3">
          <Link
            className="flex min-h-11 w-full items-center justify-center rounded-full bg-primary text-center text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:scale-[0.98]"
            href={detailHref}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

type CompactFacilityCardProps = {
  facility: Facility;
  className?: string;
};

// Compact variant — no CTA, smaller banner. Used for at-a-glance browsing
// contexts (landing page "Recently added" strip) where a full CTA would be
// premature before the user has committed to a facility. Not part of the
// primary result-card redesign (hero search / /search / category browse) —
// left structurally as-is aside from inheriting FacilityBanner's cover-photo
// and token-color badge fixes.
export function CompactFacilityCard({
  facility,
  className = "",
}: CompactFacilityCardProps) {
  return (
    <Link
      className={`group block rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-transparent p-[1px] transition hover:from-primary/40 active:scale-[0.98] ${className}`}
      href={facility.detailHref ?? `/facilities/${facility.slug}`}
    >
      <div className="flex h-full min-w-0 flex-col rounded-2xl bg-card shadow-[0_10px_26px_rgba(31,41,55,0.04)] group-hover:shadow-md">
        <FacilityBanner facility={facility} heightClassName="h-24" />
        <div className="flex flex-1 flex-col px-3 pb-3 pt-2">
          <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug text-foreground">
            {facility.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {facility.location}
          </p>
          {facility.workingHours?.trim() ? (
            <div className="mt-2">
              <WorkingHoursIndicator hours={facility.workingHours} />
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
