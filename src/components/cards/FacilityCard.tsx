import Link from "next/link";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import {
  createPublicContactActions,
  getExternalLinkProps,
} from "@/lib/contact-actions";
import { getAvatarColorClasses } from "@/lib/avatar-color";
import type { Facility } from "@/types/facility";

type FacilityCardProps = {
  facility: Facility;
};

function FacilityLogo({ facility }: { facility: Facility }) {
  if (facility.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className="size-10 shrink-0 rounded-xl border border-border bg-muted object-cover"
        src={facility.logoUrl}
      />
    );
  }

  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl border border-border text-sm font-bold ${getAvatarColorClasses(facility.name)}`}
    >
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
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
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

      <div className="mt-3 grid gap-2 min-[520px]:grid-cols-3">
        {callAction ? (
          <a
            className="flex min-h-10 items-center justify-center rounded-full border border-border bg-transparent px-3 text-center text-xs font-semibold text-foreground transition hover:border-strong-border"
            href={callAction.href}
            {...getExternalLinkProps(callAction)}
          >
            Call
          </a>
        ) : null}
        {mapAction ? (
          <a
            className="flex min-h-10 items-center justify-center rounded-full border border-border bg-transparent px-3 text-center text-xs font-semibold text-foreground transition hover:border-strong-border"
            href={mapAction.href}
            {...getExternalLinkProps(mapAction)}
          >
            Map
          </a>
        ) : null}
        <Link
          className="flex min-h-10 items-center justify-center rounded-full bg-primary px-3 text-center text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
          href={detailHref}
        >
          View details
        </Link>
      </div>
    </article>
  );
}
