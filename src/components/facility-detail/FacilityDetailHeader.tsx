import {
  facilityMonogram,
  facilityPlateClasses,
  facilityWatermarkIconKey,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Pill } from "@/components/ui/Pill";
import { getFacilityMedicalSpecialties } from "@/lib/facility/specialty-display";
import type { Facility, FacilityAppointmentModality } from "@/types/facility";
import { FacilityImageGallery } from "./FacilityImageGallery";
import { FacilityLastUpdated } from "./FacilityLastUpdated";

const APPOINTMENT_MODALITY_ICONS: Record<FacilityAppointmentModality["type"], string> = {
  phone: "📞",
  telegram: "✈️",
  whatsapp: "💬",
  online: "🌐",
  in_person: "🏥",
};

type FacilityDetailHeaderProps = { facility: Facility };

const trustCopy: Record<Facility["verificationStatus"], string> = {
  verified: "Tiru has independently confirmed key listing information.",
  "facility-owned": "This provider manages its listing and keeps its information up to date.",
  "community-submitted": "This listing was community sourced. Please confirm important details with the provider.",
  pending: "This listing is currently undergoing verification.",
};

export function FacilityDetailHeader({ facility }: FacilityDetailHeaderProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];

  const isMultiBranch = facility.subCity?.toLowerCase() === "multiple" || (facility.location?.includes("/") ?? false);
  const branchLocations = isMultiBranch && facility.location ? facility.location.split("/").map((branch) => branch.trim()).filter(Boolean) : null;
  const mapsHref = facility.contactChannels?.find((channel) => channel.channelType === "maps")?.href;
  const medicalSpecialties = getFacilityMedicalSpecialties(facility.services);
  const bannerPhotos = (facility.photoUrls?.length ? facility.photoUrls : facility.photoUrl ? [facility.photoUrl] : []).map((url) => url?.trim()).filter((url): url is string => Boolean(url));
  const hasLocation = Boolean(facility.location?.trim()) || Boolean(branchLocations?.length);

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
        <p className="mb-2 inline-flex rounded-full border border-border bg-soft-accent px-3 py-1.5 text-xs font-semibold text-primary">{facility.subcategory || "Facility details"}</p>
        <h1 className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-balance text-foreground sm:text-[2.75rem]">{facility.name}</h1>
        {facility.address ? <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{facility.address}</p> : null}

        <div className="mt-3 rounded-card border border-border bg-background p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><VerificationBadge status={facility.verificationStatus} /><span className="text-sm font-semibold text-foreground">Information confidence</span></div>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:text-sm">{trustCopy[facility.verificationStatus]}</p>
              <FacilityLastUpdated facility={facility} />
            </div>
          </div>
        </div>

        {(facility.emergencyType || facility.walkinAppointment) ? <div className="mt-3 flex flex-wrap gap-2">
          {facility.emergencyType ? <Pill variant="danger" dot>{facility.emergencyType}</Pill> : null}
          {facility.walkinAppointment ? <Pill variant="default">{facility.walkinAppointment}</Pill> : null}
        </div> : null}

        {facility.walkinAppointment && facility.walkinAppointment !== "Walk-in only" && facility.appointmentModalities?.length ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground">
            <span className="font-semibold">Appointments:</span>
            {facility.appointmentModalities.map((modality) => <span className="text-muted-foreground" key={modality.type}>{APPOINTMENT_MODALITY_ICONS[modality.type] ?? ""} {modality.value}</span>)}
          </div>
        ) : null}

        {medicalSpecialties.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{medicalSpecialties.map((specialty) => <Pill key={specialty} variant="default">{specialty}</Pill>)}</div> : null}
      </div>

      {hasLocation ? <div className="mt-5 sm:mt-6">
        {isMultiBranch && branchLocations ? (
          <div className="rounded-card border border-border bg-background p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Multiple branches</p>
            <div className="flex flex-col gap-2">
              {branchLocations.map((branch, index) => <div className="flex items-center justify-between gap-2" key={index}><p className="text-sm text-muted-foreground">{branch}</p>{mapsHref ? <a className="shrink-0 text-xs font-semibold text-primary hover:underline" href={mapsHref} rel="noopener noreferrer" target="_blank">Map →</a> : null}</div>)}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-background p-4">
            <div className="min-w-0"><p className="text-sm font-semibold text-foreground">{facility.location}</p><p className="mt-1 text-xs text-muted-foreground">Location</p></div>
            {mapsHref ? <a className="shrink-0 rounded-control border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-muted" href={mapsHref} rel="noopener noreferrer" target="_blank">View map</a> : null}
          </div>
        )}
      </div> : null}
    </header>
  );
}
