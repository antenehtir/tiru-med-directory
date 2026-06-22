import Link from "next/link";
import { MapPinIcon, PhoneIcon } from "@/components/cards/contact-icons";
import {
  facilityBannerGradientClasses,
  facilityBorderGradientClasses,
  facilityWatermarkIconKey,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { ShareButton } from "@/components/cards/ShareButton";
import { WorkingHoursIndicator } from "@/components/cards/WorkingHoursIndicator";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import {
  createPublicContactActions,
  getExternalLinkProps,
} from "@/lib/contact-actions";
import type { Facility } from "@/types/facility";

type FacilityCardProps = {
  facility: Facility;
};

export function FacilityBanner({ facility }: { facility: Facility }) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const WatermarkIcon = facilityCategoryIcons[facilityWatermarkIconKey[categoryKey]];

  return (
    <div className="relative h-28 shrink-0 overflow-hidden rounded-t-2xl">
      {facility.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-28 w-full object-cover"
          src={facility.logoUrl}
        />
      ) : (
        <div
          className={`flex h-28 w-full items-center justify-center ${facilityBannerGradientClasses[categoryKey]}`}
        >
          <WatermarkIcon className="size-10 text-primary/40" />
        </div>
      )}
      <div className="absolute right-2 top-2">
        <VerificationBadge status={facility.verificationStatus} />
      </div>
      <span className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
        {facility.category}
      </span>
    </div>
  );
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const detailHref = facility.detailHref ?? `/facilities/${facility.slug}`;
  const contactActions = createPublicContactActions(facility.contactChannels);
  const callAction = contactActions.find((action) => action.kind === "phone");
  const mapAction = contactActions.find((action) => action.kind === "maps");
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const borderGradientClass = facilityBorderGradientClasses[categoryKey];

  return (
    <article
      className={`group relative rounded-2xl bg-gradient-to-br p-[1px] transition active:scale-[0.98] ${borderGradientClass}`}
    >
      <div className="flex h-full min-w-0 flex-col rounded-2xl bg-card shadow-sm group-hover:shadow-md">
        <FacilityBanner facility={facility} />

        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <h3 className="break-words text-lg font-semibold leading-snug text-foreground">
            {facility.name}
          </h3>

          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {facility.location}
          </p>

          {facility.services.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {facility.services.slice(0, 3).map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {service}
                </span>
              ))}
            </div>
          ) : null}

          {facility.workingHours?.trim() ? (
            <div className="mt-4 border-t border-border pt-3">
              <WorkingHoursIndicator hours={facility.workingHours} />
            </div>
          ) : null}

          <div className="mt-3 flex gap-2">
            {callAction ? (
              <a
                className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-card text-center text-xs font-semibold text-foreground transition-all duration-150 hover:border-primary/60 hover:bg-primary/5 active:scale-95 active:border-primary active:bg-primary/10"
                href={callAction.href}
                {...getExternalLinkProps(callAction)}
              >
                <PhoneIcon className="size-4 shrink-0" />
                Call
              </a>
            ) : null}
            {mapAction ? (
              <a
                className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-card text-center text-xs font-semibold text-foreground transition-all duration-150 hover:border-primary/60 hover:bg-primary/5 active:scale-95 active:border-primary active:bg-primary/10"
                href={mapAction.href}
                {...getExternalLinkProps(mapAction)}
              >
                <MapPinIcon className="size-4 shrink-0" />
                Map
              </a>
            ) : null}
            <ShareButton name={facility.name} slug={facility.slug} />
            <Link
              className="flex min-h-9 flex-1 items-center justify-center rounded-full bg-primary text-center text-xs font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:scale-95"
              href={detailHref}
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
