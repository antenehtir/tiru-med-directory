import Link from "next/link";
import { MapPinIcon, PhoneIcon } from "@/components/cards/contact-icons";
import { ShareButton } from "@/components/cards/ShareButton";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import {
  createPublicContactActions,
  getExternalLinkProps,
} from "@/lib/contact-actions";
import type { Facility } from "@/types/facility";

type FacilityCardProps = {
  facility: Facility;
};

export function FacilityLogo({ facility }: { facility: Facility }) {
  if (facility.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className="size-16 shrink-0 rounded-xl border border-border bg-primary/10 object-cover"
        src={facility.logoUrl}
      />
    );
  }

  return (
    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-xl font-bold text-primary">
      {facility.name.charAt(0).toUpperCase()}
    </div>
  );
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const detailHref = facility.detailHref ?? `/facilities/${facility.slug}`;
  const contactActions = createPublicContactActions(facility.contactChannels);
  const callAction = contactActions.find((action) => action.kind === "phone");
  const mapAction = contactActions.find((action) => action.kind === "maps");

  return (
    <article className="group relative rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-transparent p-[1px] transition hover:from-primary/40 active:scale-[0.98]">
      <div className="flex h-full min-w-0 flex-col rounded-2xl bg-card p-4 shadow-sm group-hover:shadow-md">
        <div className="flex items-center gap-3">
          <FacilityLogo facility={facility} />
          <div className="min-w-0 flex-1">
            <VerificationBadge status={facility.verificationStatus} />
            <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
              {facility.category}
            </p>
          </div>
        </div>

        <h3 className="mt-2 break-words text-lg font-semibold leading-snug text-foreground">
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

        <div className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
          {facility.workingHours}
        </div>

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
    </article>
  );
}
