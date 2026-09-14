"use client";

import { useState } from "react";
import Link from "next/link";
import { ClockIcon, MapPinIcon, PhoneIcon, ShieldIcon } from "@/components/cards/contact-icons";
import { facilityCategoryDisplayLabel, facilityCategorySpineClasses, facilityMonogram, facilityPlateClasses, facilityWatermarkIconKey, resolveFacilityCardCategoryKey } from "@/components/cards/facility-category-style";
import { WorkingHoursIndicator } from "@/components/cards/WorkingHoursIndicator";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Pill } from "@/components/ui/Pill";
import { createPublicContactActions } from "@/lib/contact-actions";
import { branchDirectionsHref, facilityDirectionsHref } from "@/lib/directions";
import { facilityLocalityLabel, splitFacilityAddress, subCityLabel } from "@/lib/format-location";
import { getAvailabilityStatus, isRoundTheClockHours } from "@/lib/schedule-availability";
import type { Facility, FacilityBranch } from "@/types/facility";

const MAX_VISIBLE_SERVICE_PILLS = 3;
// Every card carries its provenance now, not only the exceptions. The legend
// on /facilities described a badge that no card drew; rather than delete the
// explanation, the badge earns it. See VerificationBadge for why the common
// state is the quiet one.

type FacilityCardProps = {
  facility: Facility;
  distanceLabel?: string;
  // Every listed service that caused this card to match the active filter —
  // see ServicePillRow for why this is plural rather than one label.
  highlightLabels?: string[];
  // Set only when the distance above was measured from a BRANCH, not the
  // main listing — /nearby now checks every branch's own coordinates, not
  // only the main pin, so a facility whose branch is two blocks away and
  // whose main site is across town surfaces correctly. Carrying the branch
  // itself (not just its name) lets the card show THAT branch's own address
  // and route directions to it, instead of the main site's — showing the
  // main address under a "the branch near you" note read as if it still
  // described the main site, and the directions button sent visitors across
  // town to it even when a branch was two blocks away.
  nearestBranch?: FacilityBranch;
};
type FacilityBannerProps = { facility: Facility; heightClassName?: string };

export function FacilityBanner({ facility, heightClassName }: FacilityBannerProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];
  const coverPhotoUrl = facility.photoUrls?.find((url) => url?.trim())?.trim() || facility.photoUrl?.trim() || undefined;
  const showBadge = true;
  const frameClassName = heightClassName ?? (coverPhotoUrl ? "aspect-[16/5]" : "h-14");
  return (
    <div aria-hidden="true" className={`pointer-events-none relative w-full shrink-0 overflow-hidden bg-muted ${frameClassName}`}>
      {/* Watermark and badge were built in separate rounds to anchor the
          same top-right corner: at size-6 vertically centered in this 56px
          (h-14) banner the icon sat directly under the badge, its tip
          poking out below "CS". The badge is a real trust signal so it keeps
          the corner; the icon is 40%-opacity ambient texture, so it moves.
          Two 24px elements cannot clear each other in 56px, hence the shrink
          to size-4 too: badge now runs y=8-26, icon y=34-50, ~8px apart. */}
      {coverPhotoUrl ? <img alt="" className="h-full w-full object-cover" loading="lazy" src={coverPhotoUrl} /> : <div className={`relative flex h-full w-full items-center overflow-hidden ${facilityPlateClasses[categoryKey]}`}><span className="absolute left-3 top-1/2 -translate-y-1/2 select-none font-display text-[2rem] font-bold leading-none tracking-[-0.05em] opacity-[0.18]">{facilityMonogram(facility.name)}</span><WatermarkIcon className="absolute bottom-1.5 right-3 size-4 opacity-40" /></div>}
      {showBadge ? <div className="absolute right-2 top-2 drop-shadow-sm"><VerificationBadge compact status={facility.verificationStatus} /></div> : null}
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

// highlightLabels are every listed service that caused this facility to
// match the active specialty filter — not just the first. A cardiac center
// offering "Cardiology", "Cardiac intervention" AND "Pediatric cardiology"
// under a Cardiology search should show all three lit up, not one with the
// rest demoted to looking like unrelated services. Each is pulled to the
// front and given the accent variant so a general hospital appearing in an
// eye-care list visibly earns its place. The overflow counter is a real
// <button>, not a decorative pill: it said "+17 more" and did nothing, which
// reads as a broken control. Expanding happens in place — the whole card is
// already a link to the detail page, so navigating away to read a service
// list would throw away the comparison the visitor is in the middle of
// making. preventDefault/stopPropagation keep the press off the card-wide
// overlay link underneath.
function ServicePillRow({ services, highlightLabels = [] }: { services: string[]; highlightLabels?: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const highlightSet = new Set(highlightLabels);
  const rest = services.filter((s) => !highlightSet.has(s));
  if (!rest.length && highlightLabels.length === 0) return null;
  const room = Math.max(0, MAX_VISIBLE_SERVICE_PILLS - highlightLabels.length);
  const visible = expanded ? rest : rest.slice(0, room);
  const overflowCount = rest.length - Math.min(rest.length, room);
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {highlightLabels.map((label) => <Pill key={label} size="sm" variant="info">{label}</Pill>)}
      {visible.map((service, index) => <Pill key={`${service}-${index}`} size="sm" variant="muted">{service}</Pill>)}
      {overflowCount > 0 ? (
        <button
          aria-expanded={expanded}
          className="pointer-events-auto relative z-20 inline-flex min-h-11 items-center rounded-full border border-border bg-card px-3 text-xs font-medium text-primary transition-colors hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); setExpanded((value) => !value); }}
          type="button"
        >
          {expanded ? "Show fewer" : `+${overflowCount} more`}
        </button>
      ) : null}
    </div>
  );
}

function StatRow({ facility }: { facility: Facility }) {
  if (!(facility.paymentMethods?.includes("Insurance") ?? false)) return null;
  return <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldIcon className="size-3.5 shrink-0 text-primary/70" />Insurance accepted</div>;
}

export function FacilityCard({ facility, distanceLabel, highlightLabels, nearestBranch }: FacilityCardProps) {
  const nearestBranchName = nearestBranch ? nearestBranch.name || nearestBranch.area : undefined;
  // Carries which branch this card was actually found through onto the
  // detail page, which auto-opens and highlights that same branch's row
  // (see FacilityBranchList) — without this, "Bole Branch is the nearest
  // branch" on the card would land on a page giving no visual sign of which
  // of possibly several branches that was.
  const detailHref = facility.detailHref
    ? facility.detailHref
    : nearestBranchName
      ? `/facilities/${facility.slug}?branch=${encodeURIComponent(nearestBranchName)}`
      : `/facilities/${facility.slug}`;
  // The sub-city already has its own pill directly above this line, so
  // printing "abenet, lideta" under a "Lideta" chip said it twice and made the
  // tail of the address look like part of the street. Only the street half is
  // shown here; when a distance pill has taken the locality slot, the sub-city
  // comes back with its label so the card never loses it silently.
  const cardAddress = splitFacilityAddress(facility);
  // A card led to by a branch shows THAT branch's own address, not the main
  // site's — printing the main address under "X is the nearest branch" read
  // as though it still described the main site, which is exactly backwards
  // for a card whose whole point is "the close one is over here instead".
  const branchAddressLine = nearestBranch
    ? [nearestBranch.landmark || nearestBranch.area, nearestBranch.subCity ? subCityLabel(nearestBranch.subCity) : null]
        .filter(Boolean)
        .join(" · ")
    : "";
  const addressLine = branchAddressLine
    ? branchAddressLine
    : cardAddress.subCity
      ? // No street half means the area was only ever the sub-city again
        // ("bole, bole"), so the labelled sub-city IS the whole address.
        !cardAddress.street
        ? subCityLabel(cardAddress.subCity)
        : distanceLabel
          ? `${cardAddress.street} · ${subCityLabel(cardAddress.subCity)}`
          : cardAddress.street
      : facility.location || facility.address;
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const callAction = createPublicContactActions(facility.contactChannels).find((action) => action.kind === "phone");
  // Routes to the nearest BRANCH when this card was matched through one,
  // falling back to the main site's directions if that branch has neither
  // coordinates nor its own maps link on file.
  const directionsHref = nearestBranch
    ? (branchDirectionsHref(nearestBranch) ?? facilityDirectionsHref(facility))
    : facilityDirectionsHref(facility);
  const localityLabel = distanceLabel ?? facilityLocalityLabel(facility);
  // View details carries the filled treatment on every card, without
  // exception. It used to swap with Call on round-the-clock listings, which
  // was defensible per card and wrong across a grid: the filled button moved
  // between neighbouring results for a reason — the opening hours — that is
  // three lines further up and invisible while scanning a row of actions. The
  // eye reads that as randomness rather than as a signal, and the cost is paid
  // on every card to benefit the few. A visitor in a genuine hurry has the
  // Emergency entry in the header, which is a better answer than reweighting
  // ordinary search results around urgency.
  return (
    <article className="group isolate relative flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-strong-border hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none">
      <Link aria-label={`View ${facility.name}`} className="absolute inset-0 z-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={detailHref} />
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-[3px] ${facilityCategorySpineClasses[categoryKey]}`} />
      <FacilityBanner facility={facility} />
      <div className="relative z-10 flex flex-1 pointer-events-none flex-col pb-4 pl-5 pr-4 pt-3">
        {/* Distance leads the card when it exists. It used to sit below the
            name as a 12px pill, the same shape and weight as the sub-city it
            replaced, which made the single most decision-relevant fact on a
            nearby result the easiest thing to skim past. It now sits on the
            first line where scanning starts, right-aligned against the
            category, at 13px bold in the accent tint — louder than the
            sub-city pill, still quieter than the 19px facility name. */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{facilityCategoryDisplayLabel(facility, categoryKey)}</p>
          {distanceLabel ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-soft-accent px-2.5 py-1 text-[13px] font-bold leading-none text-primary"><MapPinIcon className="size-3.5 shrink-0" />{distanceLabel}</span> : null}
        </div>
        <Link className="pointer-events-auto mt-1.5 line-clamp-2 min-h-[2.3em] break-words font-display text-[19px] font-semibold leading-[1.15] text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={detailHref} title={facility.name}>{facility.name}</Link>
        {nearestBranchName ? (
          <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-primary">
            <MapPinIcon className="size-3 shrink-0" />
            {nearestBranchName} is the nearest branch
          </p>
        ) : null}
        {/* One locality slot, never empty and never a placeholder gap.
            Location is optional, so most cards carry no distance most of the
            time: the slot shows the sub-city then, and swaps to the distance
            the moment coordinates exist. Both states are a filled pill of the
            same shape, so a row of cards keeps its rhythm either way. */}
        {!distanceLabel && localityLabel ? <p className="mt-1.5 flex items-center gap-1.5"><span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[12px] font-semibold text-muted-foreground"><MapPinIcon className="size-3 shrink-0" />{localityLabel}</span></p> : null}
        {addressLine ? <p className="mt-1.5 truncate text-[13px] text-muted-foreground" title={addressLine}>{addressLine}</p> : null}
        <AvailabilityLine facility={facility} />
        <StatRow facility={facility} />
        <ServicePillRow highlightLabels={highlightLabels} services={facility.services} />
        <div className="pointer-events-auto relative z-20 mt-auto flex items-center gap-2 border-t border-border pt-3">
          {callAction ? <a aria-label={`Call ${facility.name}`} className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-control text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border border-border bg-card text-foreground hover:border-strong-border hover:bg-muted`} href={callAction.href}><PhoneIcon className="size-4 shrink-0" />Call</a> : null}
          {directionsHref ? <a aria-label={`Directions to ${nearestBranchName ? `${facility.name}, ${nearestBranchName}` : facility.name}`} className="flex size-11 shrink-0 items-center justify-center rounded-control border border-border bg-card text-foreground transition-colors hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={directionsHref} rel="noopener noreferrer" target="_blank" title={nearestBranchName ? `Directions (${nearestBranchName})` : "Directions"}><MapPinIcon className="size-4 shrink-0" /></a> : null}
          <Link className={`flex min-h-11 flex-1 items-center justify-center rounded-control text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary-hover`} href={detailHref}>View details</Link>
        </div>
      </div>
    </article>
  );
}

type CompactFacilityCardProps = { facility: Facility; className?: string };

export function CompactFacilityCard({ facility, className = "" }: CompactFacilityCardProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const detailHref = facility.detailHref ?? `/facilities/${facility.slug}`;
  const callAction = createPublicContactActions(facility.contactChannels).find((action) => action.kind === "phone");
  const directionsHref = facilityDirectionsHref(facility);
  const compactLocality = facilityLocalityLabel(facility);
  return (
    <article className={`group isolate relative flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-strong-border hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none ${className}`}>
      <Link aria-label={`View ${facility.name}`} className="absolute inset-0 z-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={detailHref} />
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 z-10 w-[3px] ${facilityCategorySpineClasses[categoryKey]}`} />
      {/* FacilityBanner already carries the compact CS/FM badge over the
          image. This row used to repeat it in full ("Community sourced")
          right underneath — the same signal twice on one card, the second
          copy in the words the first was deliberately abbreviating. */}
      <FacilityBanner facility={facility} />
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col pb-3 pl-4 pr-3 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{facilityCategoryDisplayLabel(facility, categoryKey)}</span>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.3em] break-words font-display text-[17px] font-semibold leading-[1.15] text-foreground">{facility.name}</h3>
        {compactLocality ? <p className="mt-1.5"><span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[12px] font-semibold text-muted-foreground"><MapPinIcon className="size-3 shrink-0" />{compactLocality}</span></p> : null}
        <AvailabilityLine facility={facility} />
        <div className="pointer-events-auto relative z-20 mt-auto flex items-center gap-2 border-t border-border pt-2.5">
          {callAction ? <a aria-label={`Call ${facility.name}`} className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-control text-[13px] font-semibold text-foreground transition-colors hover:bg-muted" href={callAction.href}><PhoneIcon className="size-3.5 shrink-0" />Call Now</a> : null}
          {directionsHref ? <a aria-label={`Directions to ${facility.name}`} className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-control text-[13px] font-semibold text-foreground transition-colors hover:bg-muted" href={directionsHref} rel="noopener noreferrer" target="_blank"><MapPinIcon className="size-3.5 shrink-0" />Directions</a> : null}
        </div>
      </div>
    </article>
  );
}
