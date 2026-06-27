import {
  facilityBannerGradientClasses,
  facilityWatermarkIconKey,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Facility } from "@/types/facility";

type FacilityDetailHeaderProps = {
  facility: Facility;
};

export function FacilityDetailHeader({ facility }: FacilityDetailHeaderProps) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];

  return (
    <header className="rounded-3xl border border-border bg-card p-5 shadow-[0_14px_34px_rgba(31,41,55,0.045)] sm:p-6 lg:p-8">
      {/* Rich banner — taller on detail page */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl sm:h-56">
        {facility.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={facility.name}
            className="h-full w-full object-cover"
            src={facility.logoUrl}
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
        {/* Verification badge top-right */}
        <div className="absolute right-3 top-3">
          <VerificationBadge size="lg" status={facility.verificationStatus} />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div className="min-w-0">
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
        </div>
      </div>

      <div
        className={`mt-6 grid gap-3 ${
          facility.availabilityNote ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">
            {facility.category}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Facility type</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">
            {facility.location}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Location</p>
        </div>
        {facility.availabilityNote ? (
          <div className="rounded-2xl border border-border bg-background p-4">
            <p
              className={`text-sm font-semibold ${
                facility.isOpen ? "text-success" : "text-warning"
              }`}
            >
              {facility.availabilityNote}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Availability</p>
          </div>
        ) : null}
      </div>
    </header>
  );
}
