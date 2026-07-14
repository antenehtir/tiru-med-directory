import Image from "next/image";
import {
  facilityBannerGradientClasses,
  facilityWatermarkIconKey,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { Pill } from "@/components/ui/Pill";
import { getFacilityMedicalSpecialties } from "@/lib/facility/specialty-display";
import type { Facility } from "@/types/facility";

type FacilityDetailHeaderProps = {
  facility: Facility;
};

export function FacilityDetailHeader({ facility }: FacilityDetailHeaderProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];

  const isMultiBranch =
    facility.subCity?.toLowerCase() === "multiple" ||
    (facility.location?.includes("/") ?? false);

  const branchLocations = isMultiBranch && facility.location
    ? facility.location
        .split("/")
        .map((branch) => branch.trim())
        .filter(Boolean)
    : null;

  const mapsHref = facility.contactChannels?.find(
    (channel) => channel.channelType === "maps",
  )?.href;

  const medicalSpecialties = getFacilityMedicalSpecialties(facility.services);
  const bannerPhoto = facility.photoUrl?.trim() ? facility.photoUrl : null;
  const hasLocation =
    Boolean(facility.location?.trim()) || Boolean(branchLocations?.length);

  return (
    <header className="rounded-3xl border border-border bg-card p-5 shadow-[0_14px_34px_rgba(31,41,55,0.045)] sm:p-6 lg:p-8">
      {/* Banner — real entrance photo when available, gradient placeholder otherwise */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl sm:h-56">
        {bannerPhoto ? (
          <Image
            alt={`${facility.name} entrance`}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            src={bannerPhoto}
          />
        ) : (
          <div
            className={`flex h-full w-full flex-col items-center justify-center gap-3 ${facilityBannerGradientClasses[categoryKey]}`}
          >
            <WatermarkIcon className="size-14 text-primary/30" />
            <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm dark:bg-gray-900/60 dark:text-gray-100">
              {facility.category}
            </span>
          </div>
        )}

        {/* Circular logo overlay (cover-photo pattern) */}
        {facility.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${facility.name} logo`}
            className="absolute bottom-3 left-3 size-16 rounded-full border-2 border-card object-cover shadow-md sm:size-20"
            src={facility.logoUrl}
          />
        ) : null}

        {/* Verification badge top-right — drop-shadow keeps it legible over photos */}
        <div className="absolute right-3 top-3 drop-shadow-sm">
          <VerificationBadge size="lg" status={facility.verificationStatus} />
        </div>
      </div>

      <div className="mt-6 min-w-0">
        <p className="mb-3 inline-flex rounded-full border border-border bg-soft-accent px-3 py-2 text-sm font-medium text-primary">
          Facility details
        </p>
        <h1 className="text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl">
          {facility.name}
        </h1>
        {(facility.subcategory || facility.address) ? (
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            {facility.subcategory}
            {facility.subcategory && facility.address ? " in " : ""}
            {facility.address}
          </p>
        ) : null}

        {/* Compact emergency + walk-in pills */}
        {(facility.emergencyType || facility.walkinAppointment) ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {facility.emergencyType ? (
              <Pill variant="danger" dot>
                {facility.emergencyType}
              </Pill>
            ) : null}
            {facility.walkinAppointment ? (
              <Pill variant="default">
                {facility.walkinAppointment}
              </Pill>
            ) : null}
          </div>
        ) : null}

        {/* Specialties pill row */}
        {medicalSpecialties.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {medicalSpecialties.map((specialty) => (
              <Pill key={specialty} variant="default">
                {specialty}
              </Pill>
            ))}
          </div>
        ) : null}
      </div>

      {/* Location card only — the "Facility type" card was redundant with the
          subtitle above and the category badge, so it has been removed. */}
      {hasLocation ? (
        <div className="mt-6">
          {isMultiBranch && branchLocations ? (
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="mb-2 text-sm font-semibold text-foreground">
                Multiple branches
              </p>
              <div className="flex flex-col gap-2">
                {branchLocations.map((branch, index) => (
                  <div className="flex items-center justify-between gap-2" key={index}>
                    <p className="text-sm text-muted-foreground">{branch}</p>
                    {mapsHref ? (
                      <a
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                        href={mapsHref}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Map →
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Location</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">
                {facility.location}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Location</p>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}
