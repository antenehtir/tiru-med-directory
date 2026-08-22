import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Facility } from "@/types/facility";

type FacilityTrustSectionProps = {
  facility: Facility;
};

export function FacilityTrustSection({ facility }: FacilityTrustSectionProps) {
  return (
    <section className="rounded-card border border-border bg-sunken p-5 sm:p-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">
            Trust and verification
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-foreground">
            Verification is visible before action.
          </h2>
        </div>
        <VerificationBadge status={facility.verificationStatus} />
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        DigitalDirectory-v2 separates verified, pending, and
        community-submitted healthcare information so patients can understand
        what has been reviewed.
      </p>
      <div className="mt-5 rounded-md border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">
          Provider information review
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Provider information is reviewed before publication and may be updated
          as facilities confirm details.
        </p>
      </div>
    </section>
  );
}
