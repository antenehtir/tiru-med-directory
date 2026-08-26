"use client";

import { useId, useState } from "react";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import type { Facility } from "@/types/facility";

type FacilityTrustSectionProps = {
  facility: Facility;
};

// summary is new (one compact sentence for the always-visible default);
// title/body are unchanged, verbatim from before this pass — nothing here
// was cut, only re-bucketed between the compact default and the expanded
// detail. See the accordion below for where title/body now render.
const trustCopy: Record<Facility["verificationStatus"], { summary: string; title: string; body: string }> = {
  verified: {
    summary: "Tiru has reviewed key details for this facility.",
    title: "Key information reviewed by Tiru",
    body: "Tiru has reviewed key listing information for this provider. Information can still change, so the latest update date is shown on the profile.",
  },
  "facility-owned": {
    summary: "This facility manages its own listing on Tiru.",
    title: "Provider-managed listing",
    body: "The facility has claimed this listing and can manage its public information through Tiru.",
  },
  "community-submitted": {
    summary: "This listing hasn't been claimed yet — confirm details with the facility.",
    title: "Community-sourced information",
    body: "This listing was initially contributed from community information and has not yet been provider-claimed. Confirm important details with the facility.",
  },
  pending: {
    summary: "This listing is currently being verified.",
    title: "Verification in progress",
    body: "This listing is undergoing review. Please confirm important details directly with the provider until verification is complete.",
  },
};

// Progressive disclosure: badge + one summary sentence are always visible so
// a glancing visitor gets the answer immediately; the full existing
// explanation (title + body + the general "how Tiru separates tiers" note)
// is one tap away rather than always taking up the page. Mirrors the
// toggle-button + .detail-reveal pattern FacilityActionPanel already uses on
// this same page for "More numbers" — same visual language, not a new
// pattern — with aria-expanded/aria-controls added since this reveals a full
// content block rather than a couple of inline chips.
export function FacilityTrustSection({ facility }: FacilityTrustSectionProps) {
  const copy = trustCopy[facility.verificationStatus];
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = useId();

  return (
    <section className="rounded-card border border-border bg-sunken p-5 sm:p-6">
      {/* items-start is required on the BASE, not just at sm:. Without it a
          column flex container defaults to align-items: stretch, which
          blockifies the VerificationBadge and stretches it to full width —
          the badge rendered as a full-width bar with its label alone at the
          left on mobile. The badge's own `inline-flex` cannot prevent this:
          flex items are blockified and the parent's cross-axis alignment
          wins. Matches DoctorCard, which already sets items-start on its
          equivalent base flex-col. */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
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

      <p className="mt-3 text-sm leading-6 text-foreground">{copy.summary}</p>

      <button
        aria-controls={detailsId}
        aria-expanded={isExpanded}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        {isExpanded ? "Hide details" : "Learn how we verify facilities"}
        <svg
          aria-hidden="true"
          className={`size-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isExpanded ? (
        <div className="detail-reveal mt-4" id={detailsId}>
          <div className="rounded-card border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">{copy.title}</p>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{copy.body}</p>
          </div>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Tiru separates provider-managed, verified, pending, and community-sourced information so health seekers can judge the level of confidence before making a decision.
          </p>
        </div>
      ) : null}
    </section>
  );
}
