"use client";

import Link from "next/link";
import { ClockIcon, DirectionsIcon, MapPinIcon, PhoneIcon, ShieldIcon } from "@/components/cards/contact-icons";
import { facilityCategoryBadgeLabels, facilityCategorySpineClasses, facilityMonogram, facilityPlateClasses, facilityWatermarkIconKey, resolveFacilityCardCategoryKey } from "@/components/cards/facility-category-style";
import { WorkingHoursIndicator } from "@/components/cards/WorkingHoursIndicator";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Pill } from "@/components/ui/Pill";
import { createPublicContactActions } from "@/lib/contact-actions";
import { facilityDirectionsHref } from "@/lib/directions";
import { facilityLocalityLabel } from "@/lib/format-location";
import { getAvailabilityStatus, isRoundTheClockHours } from "@/lib/schedule-availability";
import type { Facility } from "@/types/facility";

const MAX_VISIBLE_SERVICE_PILLS = 3;
const BANNER_BADGE_STATUSES = new Set(["facility-owned", "verified", "pending"]);

type FacilityCardProps = { facility: Facility; distanceLabel?: string };
type FacilityBannerProps = { facility: Facility; heightClassName?: string };

export function FacilityBanner({ facility, heightClassName }: FacilityBannerProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];
  const coverPhotoUrl = facility.photoUrls?.find((url) => url?.trim())?.trim() || facility.photoUrl?.trim() || undefined;
  const showBadge = BANNER_BADGE_STATUSES.has(facility.verificationStatus);
  const frameClassName = heightClassName ?? (coverPhotoUrl ? "aspect-[16/5]" : "h-14");
  return (
    <div aria-hidden="true" className={`pointer-events-none relative w-full shrink-0 overflow-hidden bg-muted ${frameClassName}`}>
      {coverPhotoUrl ? <img alt="" className="h-full w-full object-cover" loading="lazy" src={coverPhotoUrl} /> : <div className={`relative flex h-full w-full items-center overflow-hidden ${facilityPlateClasses[categoryKey]}`}><span className="absolute left-3 top-1/2 -translate-y-1/2 select-none font-display text-[2rem] font-bold leading-none tracking-[-0.05em] opacity-[0.18]">{facilityMonogram(facility.name)}</span><WatermarkIcon className="absolute right-3 size-6 opacity-40" /></div>}
      {showBadge ? <div className="absolute right-2 top-2 drop-shadow-sm"><VerificationBadge status={facility.verificationStatus} /></div> : null}
    </div>
  );
}

function AvailabilityLine({ facility }: { facility: Facility }) {
  const availability = facility.schedule?.length ? getAvailabilityStatus(facility.schedule) : null;
  if (availability) {
    const isOpenNow = availability.state === "open-now";
    const label = isOpenNow ? (availability.is24Hours ? "Open 24 hours" : "Open now") : availability.state === "opens-later-today" ? `Opens ${availability.opensAt}` : availability.state === "next-available-day" ? `Opens ${availability.day.slice(0, 3)}` : "Closed now";
    return <p className={`mt-2 flex items-center gap-1.5 text-[13px] font-medium ${isOpenNow ? "text-success-text" : "text-muted-foreground"}`}><span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${isOpenNow ? "bg-success" : "bg-strong-border"}`} />{label}</p>;
  }
  const hours = facility.workingHours?.trim();
  // A facility open around the clock gets the same green availability dot as
  // the structured-schedule path above, so "open right now" reads identically
  // whichever data shape the listing happens to carry. It previously rendered
  // a pulsing RED dot labelled "24/7 Emergency Service": red reads as alarm
  // rather than availability, the colours were raw palette values instead of
  // tokens, and "Emergency Service" overclaimed — of the 74 round-the-clock
  // listings, one is a support line and others are 24-hour pharmacies.
  if (hours && isRoundTheClockHours(hours)) return <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-success-text"><span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-success" />Open 24 hours</p>;
  if (hours) return <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground"><ClockIcon className="size-3.5 shrink-0" /><WorkingHoursIndicator hours={hours} /></p>;
  return null;
}

function ServicePillRow({ services }: { services: string[] }) {
  if (!services.length) return null;
  const visible = services.slice(0, MAX_VISIBLE_SERVICE_PILLS);
  const overflowCount = services.length - visible.length;
  return <div className="mt-3 flex flex-wrap gap-1.5">{visible.map((service, index) => <Pill key={`${service}-${index}`} size="sm" variant="muted">{service}</Pill>)}{overflowCount > 0 ? <Pill size="sm" variant="muted">+{overflowCount} more</Pill> : null}</div>;
}

function StatRow({ facility }: { facility: Facility }) {
  if (!(facility.paymentMethods?.includes("Insurance") ?? false)) return null;
  return <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldIcon className="size-3.5 shrink-0 text-primary/70" />Insurance accepted</div>;
}

export function FacilityCard({ facility, distanceLabel }: FacilityCardProps) {
  const detailHref = facility.detailHref ?? `/facilities/${facility.slug}`;
  const addressLine = facility.location || facility.address;
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const callAction = createPublicContactActions(facility.contactChannels).find((action) => action.kind === "phone");
  const directionsHref = facilityDirectionsHref(facility);
  const localityLabel = distanceLabel ?? facilityLocalityLabel(facility);
  // Call leads only where urgency justifies it. On a round-the-clock listing
  // the phone is the point; everywhere else the trust information behind
  // View details (verification, hours, services, payment) is what the
  // directory is actually for, so it keeps the filled treatment.
  const callLeads = isRoundTheClockHours(facility.workingHours);
  return (
    <article className="group isolate relative flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-strong-border hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none">
      <Link aria-label={`View ${facility.name}`} className="absolute inset-0 z-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={detailHref} />
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-[3px] ${facilityCategorySpineClasses[categoryKey]}`} />
      <FacilityBanner facility={facility} />
      <div className="relative z-10 flex flex-1 pointer-events-none flex-col pb-4 pl-5 pr-4 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{facilityCategoryBadgeLabels[categoryKey]}</p>
        <Link className="pointer-events-auto mt-1.5 line-clamp-2 min-h-[2.3em] break-words font-display text-[19px] font-semibold leading-[1.15] text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={detailHref} title={facility.name}>{facility.name}</Link>
        {/* One locality slot, never empty and never a placeholder gap.
            Location is optional, so most cards carry no distance most of the
            time: the slot shows the sub-city then, and swaps to the distance
            the moment coordinates exist. Both states are a filled pill of the
            same shape, so a row of cards keeps its rhythm either way. */}
        {localityLabel ? <p className="mt-1.5 flex items-center gap-1.5"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${distanceLabel ? "bg-soft-accent text-primary" : "bg-muted text-muted-foreground"}`}><MapPinIcon className="size-3 shrink-0" />{localityLabel}</span></p> : null}
        {addressLine ? <p className="mt-1.5 truncate text-[13px] text-muted-foreground" title={addressLine}>{addressLine}</p> : null}
        <AvailabilityLine facility={facility} />
        <StatRow facility={facility} />
        <ServicePillRow services={facility.services} />
        <div className="pointer-events-auto relative z-20 mt-auto flex items-center gap-2 border-t border-border pt-3">
          {callAction ? <a aria-label={`Call ${facility.name}`} className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-control text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${callLeads ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "border border-border bg-card text-foreground hover:border-strong-border hover:bg-muted"}`} href={callAction.href}><PhoneIcon className="size-4 shrink-0" />Call</a> : null}
          {directionsHref ? <a aria-label={`Directions to ${facility.name}`} className="flex size-11 shrink-0 items-center justify-center rounded-control border border-border bg-card text-foreground transition-colors hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={directionsHref} rel="noopener noreferrer" target="_blank" title="Directions"><DirectionsIcon className="size-4 shrink-0" /></a> : null}
          <Link className={`flex min-h-11 flex-1 items-center justify-center rounded-control text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${callLeads ? "border border-border bg-card text-foreground hover:border-strong-border hover:bg-muted" : "bg-primary text-primary-foreground hover:bg-primary-hover"}`} href={detailHref}>View details</Link>
        </div>
      </div>
    </article>
  );
}

type CompactFacilityCardProps = { facility: Facility; className?: string };

export function CompactFacilityCard({ facility, className = "" }: CompactFacilityCardProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const showTrust = BANNER_BADGE_STATUSES.has(facility.verificationStatus);
  const detailHref = facility.detailHref ?? `/facilities/${facility.slug}`;
  const callAction = createPublicContactActions(facility.contactChannels).find((action) => action.kind === "phone");
  const directionsHref = facilityDirectionsHref(facility);
  const compactLocality = facilityLocalityLabel(facility);
  return (
    <article className={`group isolate relative flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-strong-border hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none ${className}`}>
      <Link aria-label={`View ${facility.name}`} className="absolute inset-0 z-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={detailHref} />
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 z-10 w-[3px] ${facilityCategorySpineClasses[categoryKey]}`} />
      <FacilityBanner facility={facility} />
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col pb-3 pl-4 pr-3 pt-3">
        <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{facilityCategoryBadgeLabels[categoryKey]}</span>{showTrust ? <span className="max-w-[46%] truncate"><VerificationBadge status={facility.verificationStatus} /></span> : null}</div>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.3em] break-words font-display text-[17px] font-semibold leading-[1.15] text-foreground">{facility.name}</h3>
        {compactLocality ? <p className="mt-1.5"><span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[12px] font-semibold text-muted-foreground"><MapPinIcon className="size-3 shrink-0" />{compactLocality}</span></p> : null}
        <AvailabilityLine facility={facility} />
        <div className="pointer-events-auto relative z-20 mt-auto flex items-center gap-2 border-t border-border pt-2.5">
          {callAction ? <a aria-label={`Call ${facility.name}`} className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-control text-[13px] font-semibold text-foreground transition-colors hover:bg-muted" href={callAction.href}><PhoneIcon className="size-3.5 shrink-0" />Call Now</a> : null}
          {directionsHref ? <a aria-label={`Directions to ${facility.name}`} className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-control text-[13px] font-semibold text-foreground transition-colors hover:bg-muted" href={directionsHref} rel="noopener noreferrer" target="_blank"><DirectionsIcon className="size-3.5 shrink-0" />Directions</a> : null}
        </div>
      </div>
    </article>
  );
}
