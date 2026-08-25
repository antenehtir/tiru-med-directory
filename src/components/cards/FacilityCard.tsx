"use client";

import Link from "next/link";
import { ClockIcon, MapPinIcon, PhoneIcon, ShieldIcon } from "@/components/cards/contact-icons";
import { facilityCategoryBadgeLabels, facilityCategorySpineClasses, facilityMonogram, facilityPlateClasses, facilityWatermarkIconKey, resolveFacilityCardCategoryKey } from "@/components/cards/facility-category-style";
import { WorkingHoursIndicator } from "@/components/cards/WorkingHoursIndicator";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Pill } from "@/components/ui/Pill";
import { createPublicContactActions } from "@/lib/contact-actions";
import { getAvailabilityStatus } from "@/lib/schedule-availability";
import type { Facility } from "@/types/facility";

const MAX_VISIBLE_SERVICE_PILLS = 3;
const BANNER_BADGE_STATUSES = new Set(["facility-owned", "verified", "pending"]);

type FacilityCardProps = { facility: Facility; distanceLabel?: string };
type FacilityBannerProps = { facility: Facility; heightClassName?: string };

export function FacilityBanner({ facility, heightClassName = "aspect-[16/5]" }: FacilityBannerProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];
  const coverPhotoUrl = facility.photoUrls?.find((url) => url?.trim())?.trim() || facility.photoUrl?.trim() || undefined;
  const showBadge = BANNER_BADGE_STATUSES.has(facility.verificationStatus);
  return (
    <div className={`relative w-full shrink-0 overflow-hidden bg-muted ${heightClassName}`}>
      {coverPhotoUrl ? <img alt="" className="h-full w-full object-cover" loading="lazy" src={coverPhotoUrl} /> : <div aria-hidden="true" className={`relative flex h-full w-full items-center overflow-hidden ${facilityPlateClasses[categoryKey]}`}><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none font-display text-[3.25rem] font-bold leading-none tracking-[-0.05em] opacity-[0.18] sm:text-6xl">{facilityMonogram(facility.name)}</span><WatermarkIcon className="absolute right-3 size-6 opacity-40" /></div>}
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
  if (facility.workingHours?.trim()) return <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground"><ClockIcon className="size-3.5 shrink-0" /><WorkingHoursIndicator hours={facility.workingHours} /></p>;
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
  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-150 hover:-translate-y-px hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none">
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 z-10 w-[3px] ${facilityCategorySpineClasses[categoryKey]}`} />
      <FacilityBanner facility={facility} />
      <div className="flex flex-1 flex-col pb-4 pl-5 pr-4 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{facilityCategoryBadgeLabels[categoryKey]}</p>
        <Link className="mt-1.5 break-words font-display text-[19px] font-semibold leading-[1.15] text-foreground hover:text-primary" href={detailHref}>{facility.name}</Link>
        {addressLine ? <p className="mt-1.5 flex items-center gap-1 text-[13px] text-muted-foreground"><MapPinIcon className="size-3.5 shrink-0" /><span className="min-w-0 flex-1 truncate" title={addressLine}>{addressLine}</span>{distanceLabel ? <span className="shrink-0 whitespace-nowrap font-medium text-foreground">· {distanceLabel}</span> : null}</p> : null}
        <AvailabilityLine facility={facility} />
        <StatRow facility={facility} />
        <ServicePillRow services={facility.services} />
        <div className="relative z-10 mt-auto flex items-center gap-2 border-t border-border pt-3">
          {callAction ? <a className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-control border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:border-strong-border hover:bg-muted" href={callAction.href}><PhoneIcon className="size-4 shrink-0" />Call</a> : null}
          <Link className="flex min-h-11 flex-1 items-center justify-center rounded-control bg-primary text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover" href={detailHref}>View details</Link>
        </div>
      </div>
    </article>
  );
}

type CompactFacilityCardProps = { facility: Facility; className?: string };

export function CompactFacilityCard({ facility, className = "" }: CompactFacilityCardProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const showTrust = BANNER_BADGE_STATUSES.has(facility.verificationStatus);
  return (
    <Link className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-150 hover:-translate-y-px hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none ${className}`} href={facility.detailHref ?? `/facilities/${facility.slug}`}>
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 z-10 w-[3px] ${facilityCategorySpineClasses[categoryKey]}`} />
      <FacilityBanner facility={facility} heightClassName="h-24" />
      <div className="flex flex-1 flex-col pb-3 pl-4 pr-3 pt-3">
        <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{facilityCategoryBadgeLabels[categoryKey]}</span>{showTrust ? <span className="max-w-[46%] truncate"><VerificationBadge status={facility.verificationStatus} /></span> : null}</div>
        <h3 className="mt-1.5 line-clamp-2 break-words font-display text-[17px] font-semibold leading-[1.15] text-foreground">{facility.name}</h3>
        <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">{facility.location}</p>
        <AvailabilityLine facility={facility} />
      </div>
    </Link>
  );
}
