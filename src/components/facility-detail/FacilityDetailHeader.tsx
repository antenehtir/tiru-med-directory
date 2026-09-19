import {
  facilityCategoryDisplayLabel,
  facilityMonogram,
  facilityPlateClasses,
  facilityWatermarkIconKey,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { getFacilitySpecialtyLabels } from "@/lib/facility/specialty-display";
import { splitFacilityAddress, subCityLabel } from "@/lib/format-location";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Pill } from "@/components/ui/Pill";
import type { Facility } from "@/types/facility";
import { AppointmentOptionsList } from "./AppointmentOptionsList";
import { FacilityBranchList } from "./FacilityBranchList";
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
  const categoryLabel = facilityCategoryDisplayLabel(facility, categoryKey) || "Facility details";
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
        {/* compact: the full phrase already has a section of its own further
            down this page (FacilityTrustSection), which is where the legend
            defining "CS"/"FM" lives — VerificationBadge's own contract for
            when compact is safe to use. A hero badge spelling out "Community
            sourced" over a photo took more room than the signal was worth. */}
        <div className="absolute right-3 top-3 drop-shadow-sm"><VerificationBadge compact size="lg" status={facility.verificationStatus} /></div>
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
            <AppointmentOptionsList className="mt-2" modalities={facility.appointmentModalities} />
          </div>
        ) : null}
      </div>

      {hasLocation ? <div className="mt-5 sm:mt-6">
        {hasMultipleBranches ? (
          <div className="rounded-card border border-border bg-background p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Multiple branches</p>
            <div className="flex flex-col">
              {facility.location ? (
                <div className="flex items-center justify-between gap-2 border-b border-border py-2">
                  <div className="min-w-0">
                    {/* Same street/sub-city split the single-location layout
                        below already uses — this row used to just print the
                        raw concatenated `location` string, which buried the
                        sub-city inside it (or, for a facility with no street
                        recorded, showed nothing distinguishing "Main Branch"
                        from any other row at all). */}
                    <p className="text-sm text-muted-foreground">
                      {address.street || (address.subCity ? subCityLabel(address.subCity) : facility.location)}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Main Branch
                      {address.street && address.subCity ? ` · ${subCityLabel(address.subCity)}` : ""}
                    </p>
                  </div>
                  {mapsHref ? <a className="shrink-0 text-xs font-semibold text-primary hover:underline" href={mapsHref} rel="noopener noreferrer" target="_blank">Map →</a> : null}
                </div>
              ) : null}
              <FacilityBranchList branches={branches} mainServices={facility.services} />
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
