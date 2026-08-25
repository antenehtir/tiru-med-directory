import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Facility } from "@/types/facility";

type FacilityTrustSectionProps = {
  facility: Facility;
};

const trustCopy: Record<Facility["verificationStatus"], { title: string; body: string }> = {
  verified: {
    title: "Key information reviewed by Tiru",
    body: "Tiru has reviewed key listing information for this provider. Information can still change, so the latest update date is shown on the profile.",
  },
  "facility-owned": {
    title: "Provider-managed listing",
    body: "The facility has claimed this listing and can manage its public information through Tiru.",
  },
  "community-submitted": {
    title: "Community-sourced information",
    body: "This listing was initially contributed from community information and has not yet been provider-claimed. Confirm important details with the facility.",
  },
  pending: {
    title: "Verification in progress",
    body: "This listing is undergoing review. Please confirm important details directly with the provider until verification is complete.",
  },
};

export function FacilityTrustSection({ facility }: FacilityTrustSectionProps) {
  const copy = trustCopy[facility.verificationStatus];

  return (
    <section className="rounded-card border border-border bg-sunken p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Trust & verification
          </p>
          <h2 className="mt-1.5 font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
            Know how this information was sourced
          </h2>
        </div>
        <VerificationBadge status={facility.verificationStatus} />
      </div>

      <div className="mt-4 rounded-card border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">{copy.title}</p>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{copy.body}</p>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Tiru separates provider-managed, verified, pending, and community-sourced information so health seekers can judge the level of confidence before making a decision.
      </p>
    </section>
  );
}
