import Link from "next/link";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import {
  createPublicContactActions,
  getExternalLinkProps,
} from "@/lib/contact-actions";
import type { Facility } from "@/types/facility";

type FacilityCardProps = {
  facility: Facility;
};

export function FacilityCard({ facility }: FacilityCardProps) {
  const detailHref =
    facility.detailHref ??
    (facility.slug === "addis-health-center"
      ? "/facilities/addis-health-center"
      : "/facilities");
  const contactActions = createPublicContactActions(facility.contactChannels);
  const callAction = contactActions.find((action) => action.kind === "phone");
  const mapAction = contactActions.find((action) => action.kind === "maps");

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.035)] sm:p-5">
      <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-muted-foreground">
            {facility.category}
          </p>
          <h3 className="mt-2 break-words text-lg font-semibold leading-snug text-foreground sm:text-xl">
            {facility.name}
          </h3>
        </div>
        <VerificationBadge status={facility.verificationStatus} />
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6">
        <div>
          <p className="font-medium text-card-foreground">
            {facility.subcategory}
          </p>
          <p className="mt-1 text-muted-foreground">{facility.address}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {facility.services.slice(0, 3).map((service) => (
            <span
              key={service}
              className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
            >
              {service}
            </span>
          ))}
        </div>
        <div className="grid gap-2 rounded-xl bg-muted p-3">
          <p className="text-muted-foreground">{facility.location}</p>
          <p className="text-muted-foreground">{facility.workingHours}</p>
          <p
            className={`font-semibold ${
              facility.isOpen ? "text-success" : "text-warning"
            }`}
          >
            {facility.availabilityNote}
          </p>
        </div>
      </div>

      <div className="mt-auto grid gap-2 pt-5 min-[520px]:grid-cols-3">
        {callAction ? (
          <a
            className="flex min-h-12 items-center justify-center rounded-lg border border-border bg-card px-3 text-center text-sm font-semibold text-foreground transition hover:border-strong-border"
            href={callAction.href}
            {...getExternalLinkProps(callAction)}
          >
            {callAction.label}
          </a>
        ) : null}
        {mapAction ? (
          <a
            className="flex min-h-12 items-center justify-center rounded-lg border border-border bg-card px-3 text-center text-sm font-semibold text-foreground transition hover:border-strong-border"
            href={mapAction.href}
            {...getExternalLinkProps(mapAction)}
          >
            {mapAction.label}
          </a>
        ) : null}
        <Link
          className="flex min-h-12 items-center justify-center rounded-lg bg-primary px-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          href={detailHref}
        >
          View details
        </Link>
      </div>
    </article>
  );
}
