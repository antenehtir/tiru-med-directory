import {
  facilityCategoryBadgeLabels,
  facilityMonogram,
  facilityPlateClasses,
  facilityWatermarkIconKey,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { TelegramIcon, WhatsAppIcon } from "@/components/cards/contact-icons";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { getFacilitySpecialtyLabels } from "@/lib/facility/specialty-display";
import { splitFacilityAddress, subCityLabel } from "@/lib/format-location";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Pill } from "@/components/ui/Pill";
import type { Facility, FacilityAppointmentModality } from "@/types/facility";
import { FacilityImageGallery } from "./FacilityImageGallery";
import { FacilityLastUpdated } from "./FacilityLastUpdated";

// Display-only. The stored values stay exactly as WALKIN_APPOINTMENT_OPTIONS
// writes them — renaming the vocabulary would mean a migration and would
// break every saved row — but "Appointment required" reads as a refusal.
// This pill is a category, and the card below it is the instruction, so the
// pill says the noun once and "For appointments" is left to that heading.
const WALKIN_POLICY_LABELS: Record<string, string> = {
  "Appointment required": "Appointments",
};

function walkinPolicyLabel(value: string): string {
  return WALKIN_POLICY_LABELS[value] ?? value;
}

// A booking URL printed in full is the longest unbroken string on the page:
// it takes a line of its own, is the first thing to strain a 320px screen,
// and gives the reader something to read when they wanted something to tap.
//
// The label is the destination itself, not "Book online" — the reader can see
// where the tap leads before taking it. Host and path together while they stay
// short, which keeps "t.me/clinicname" whole; host alone once a booking URL
// starts carrying a query string, which is where the width came from.
const MAX_INLINE_LINK_LABEL = 28;

function bookingLink(value: string): { href: string; label: string } | null {
  const raw = value.trim();
  const hasScheme = /^https?:\/\//i.test(raw);
  // A bare domain with no scheme still needs to look like one: dotted, no
  // whitespace. Phone numbers and @handles must not become links.
  if (!hasScheme && !/^[\w-]+(?:\.[\w-]+)+(?:[/?#]\S*)?$/.test(raw)) return null;

  try {
    const url = new URL(hasScheme ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./i, "");
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    const full = `${host}${path}`;
    return { href: url.href, label: full.length <= MAX_INLINE_LINK_LABEL ? full : host };
  } catch {
    return null;
  }
}

// Phone/online/in-person have no single brand to represent, so an emoji
// stays the simplest option there. Telegram and WhatsApp do have one — an
// emoji speech bubble doesn't carry WhatsApp's identity the way its own
// mark does, so those two render the same branded icons used everywhere
// else on the site rather than a generic emoji standing in for a brand.
const GENERIC_MODALITY_EMOJI: Partial<Record<FacilityAppointmentModality["type"], string>> = {
  phone: "📞",
  online: "🌐",
  in_person: "🏥",
};

function AppointmentModalityMark({ type }: { type: FacilityAppointmentModality["type"] }) {
  if (type === "whatsapp") return <WhatsAppIcon className="inline size-3.5 shrink-0 -translate-y-px text-[#1EBE5A]" />;
  if (type === "telegram") return <TelegramIcon className="inline size-3.5 shrink-0 -translate-y-px text-[#26A5E4]" />;
  return <>{GENERIC_MODALITY_EMOJI[type] ?? ""}</>;
}

type FacilityDetailHeaderProps = { facility: Facility };

export function FacilityDetailHeader({ facility }: FacilityDetailHeaderProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);

  // "Specialty Center" tells a visitor almost nothing — a dental clinic and a
  // dermatology clinic wear the identical badge. Naming the specialty answers
  // the question the page is there to answer, in the first thing read.
  //
  // Only when there is exactly one. This badge used to render
  // facility.subcategory and was changed away from it because 28 facilities
  // hold a full comma-separated specialty list in that field, which turned the
  // badge into a wall of text duplicating the pills further down. Reading the
  // controlled list instead avoids the free-text half of that problem, and
  // stopping at one avoids the rest: a centre offering six specialties has no
  // single name, and "Specialty Center" is already the honest word for it.
  const specialties = getFacilitySpecialtyLabels(facility);
  const categoryLabel = facilityCategoryBadgeLabels[categoryKey] || "Facility details";
  const badgeLabel =
    specialties.length === 1 ? `${specialties[0]} · ${categoryLabel}` : categoryLabel;
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];

  // Real branch data, not the old heuristic (subCity === "multiple" or a
  // "/"-separated location string) — that convention was never written by
  // onboarding and never matched a single live facility. A branch entry
  // still needs a name or area to count as real; the onboarding form no
  // longer saves blank ones, but this stays defensive against older rows.
  const branches = (facility.branches ?? []).filter(
    (branch) => branch.name.trim() || branch.area.trim(),
  );
  const hasMultipleBranches = branches.length > 0;
  const mapsHref = facility.contactChannels?.find((channel) => channel.channelType === "maps")?.href;
  const bannerPhotos = (facility.photoUrls?.length ? facility.photoUrls : facility.photoUrl ? [facility.photoUrl] : []).map((url) => url?.trim()).filter((url): url is string => Boolean(url));
  const hasLocation = Boolean(facility.location?.trim()) || hasMultipleBranches;
  const address = splitFacilityAddress(facility);

  return (
    <header className="rounded-card border border-border bg-card p-4 shadow-card sm:p-6 lg:p-8">
      <div className="relative h-48 w-full overflow-hidden rounded-card sm:h-56">
        {bannerPhotos.length > 0 ? (
          <FacilityImageGallery alt={`${facility.name} entrance`} images={bannerPhotos} />
        ) : (
          <div aria-hidden="true" className={`relative flex h-full w-full items-center overflow-hidden ${facilityPlateClasses[categoryKey]}`}>
            <span className="pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2 select-none font-display text-[9rem] font-bold leading-none tracking-[-0.06em] opacity-[0.16] sm:text-[11rem]">{facilityMonogram(facility.name)}</span>
            <WatermarkIcon className="absolute right-6 size-12 opacity-35" />
          </div>
        )}
        {facility.logoUrl ? <img alt={`${facility.name} logo`} className="absolute bottom-3 left-3 size-16 rounded-full border-2 border-card object-cover shadow-md sm:size-20" src={facility.logoUrl} /> : null}
        <div className="absolute right-3 top-3 drop-shadow-sm"><VerificationBadge size="lg" status={facility.verificationStatus} /></div>
      </div>

      <div className="mt-5 min-w-0 sm:mt-6">
        {/* Was facility.subcategory — meant as a short classification, but
            for 28 of 106 facilities (mostly Specialty Centers) that field
            holds a full comma-separated specialty list instead, e.g.
            "Internal Medicine, Gastroenterology, Cardiology, ...". Rendered
            here it looked like — and for the affected facilities, WAS — an
            exact duplicate of the "Clinical specialties" pills further down
            the page, which read from a different field (services) with the
            same content. subcategory is a real, useful search-matching
            field elsewhere (frontend-search-filters.ts, specialty-match.ts)
            and is intentionally left alone there — only this one display
            site was wrong. facility.category replaces it: never shown
            anywhere else on this page, and drawn from a small fixed
            taxonomy (General Hospital, Specialty Center, Clinic, ...) that
            cannot reproduce this failure mode the way free-text subcategory
            can. Same label convention FacilityCard already uses. */}
        <p className="mb-2 inline-flex rounded-full border border-border bg-soft-accent px-3 py-1.5 text-xs font-semibold text-primary">{badgeLabel}</p>
        <h1 className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-balance text-foreground sm:text-[2.75rem]">{facility.name}</h1>
        {facility.address ? <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{facility.address}</p> : null}

        {/* The "Information confidence" panel that used to live here (badge +
            label + a per-status description) duplicated FacilityTrustSection
            further down the page word-for-word — both are always rendered,
            neither is behind a collapsible toggle, so it was a genuine
            duplicate, not two views of different scope. Removed in favor of
            the fuller Trust & verification section. FacilityLastUpdated is
            kept: it doesn't appear in FacilityTrustSection and carries real,
            non-duplicated information (the provider's last-edit date). */}
        <FacilityLastUpdated facility={facility} />

        {(facility.emergencyType || facility.walkinAppointment) ? <div className="mt-3 flex flex-wrap gap-2">
          {facility.emergencyType ? <Pill variant="danger" dot>{facility.emergencyType}</Pill> : null}
          {facility.walkinAppointment ? <Pill variant="default">{walkinPolicyLabel(facility.walkinAppointment)}</Pill> : null}
        </div> : null}

        {/* One row per way in, each on its own line with its mark in a fixed
            column. They used to wrap inline after a bold "Appointments:", so a
            phone number and a long booking URL ran together into a paragraph
            and the reader had to parse where one ended and the next began.
            These are things to act on, not prose. */}
        {facility.walkinAppointment && facility.walkinAppointment !== "Walk-in only" && facility.appointmentModalities?.length ? (
          <div className="mt-3 rounded-card border border-border bg-background p-3 sm:p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              For appointments
            </p>
            <ul className="mt-2 grid gap-1.5">
              {facility.appointmentModalities.map((modality) => {
                // A provider can tick a way in without typing a detail for it —
                // Lancet's "In-person at reception" is saved with an empty
                // value — which rendered as a bare icon sitting under the
                // booking link with nothing beside it. The label is the useful
                // half of that row anyway ("you can book at reception" is real
                // information), so it stands in when there is no value, and
                // only a row with neither is dropped.
                const detail = modality.value?.trim() || modality.label?.trim() || "";
                if (!detail) return null;
                const link = bookingLink(detail);
                return (
                  <li className="flex items-start gap-2 text-sm text-foreground" key={modality.type}>
                    <span className="mt-0.5 shrink-0 text-muted-foreground">
                      <AppointmentModalityMark type={modality.type} />
                    </span>
                    {link ? (
                      <a
                        // py/-my pair: the row is a flex container, so the
                        // anchor is blockified and its padding would otherwise
                        // move the list. This grows the thumb target to fill
                        // the row gap and pulls the layout back to where it was.
                        className="-my-1.5 min-w-0 break-words py-1.5 font-semibold text-primary hover:underline"
                        href={link.href}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span className="min-w-0 break-words">{detail}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      {hasLocation ? <div className="mt-5 sm:mt-6">
        {hasMultipleBranches ? (
          <div className="rounded-card border border-border bg-background p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Multiple branches</p>
            <div className="flex flex-col gap-2">
              {facility.location ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{facility.location}</p>
                    <p className="text-xs text-muted-foreground/70">Main location</p>
                  </div>
                  {mapsHref ? <a className="shrink-0 text-xs font-semibold text-primary hover:underline" href={mapsHref} rel="noopener noreferrer" target="_blank">Map →</a> : null}
                </div>
              ) : null}
              {branches.map((branch, index) => (
                <div className="flex items-center justify-between gap-2" key={index}>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{branch.name || branch.area}</p>
                    {branch.landmark ? <p className="text-xs text-muted-foreground/70">{branch.landmark}</p> : null}
                  </div>
                  {branch.maps_link ? <a className="shrink-0 text-xs font-semibold text-primary hover:underline" href={branch.maps_link} rel="noopener noreferrer" target="_blank">Map →</a> : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-background p-4">
            {/* Street and sub-city on separate lines. Printed as one string,
                "Megenagna, Afarensis Bldg, Bole" reads as an address ending in
                a place called Bole rather than an address IN Bole sub-city. */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {address.street || (address.subCity ? subCityLabel(address.subCity) : facility.location)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {address.street && address.subCity ? subCityLabel(address.subCity) : "Location"}
              </p>
            </div>
            {mapsHref ? <a className="shrink-0 rounded-control border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-muted" href={mapsHref} rel="noopener noreferrer" target="_blank">View map</a> : null}
          </div>
        )}
      </div> : null}
    </header>
  );
}
