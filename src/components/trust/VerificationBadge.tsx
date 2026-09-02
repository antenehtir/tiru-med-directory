import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant, PillSize } from "@/lib/design-tokens";
import type { VerificationStatus } from "@/types/verification";

type VerificationBadgeProps = {
  status: VerificationStatus;
  entityType?: "facility" | "doctor";
  size?: "sm" | "lg";
  // Renders the community state as "CS" instead of the full phrase. Only for
  // surfaces that also show the legend defining it — an unexplained
  // abbreviation is worse than the words it saves.
  compact?: boolean;
};

// Exactly two user-facing labels. The internal statuses are an implementation
// detail: "facility-owned" and "verified" both mean the same thing to a
// visitor — the facility stands behind this listing — so both read "Official".
// The words "facility owned" never reach the UI.
//
// Amber for community sourced, green for Official — the scheme this project
// has used since the badge existed. A previous pass made community sourced a
// muted grey on the theory that the common state should recede; that removed
// the amber "check this yourself" cue, which is the more useful signal on a
// directory where 105 of 106 listings are unverified. Amber earns its place by
// saying something, not by being rare.
//
// "pending" reads as Community sourced on purpose: until a claim completes,
// the listing has exactly the provenance it started with, and saying anything
// stronger would promise a review that has not happened.
const badgeContent: Record<VerificationStatus, { label: string; variant: BadgeVariant; title: string }> = {
  "community-submitted": { label: "Community sourced", variant: "warning", title: "Community sourced — please confirm details with the provider" },
  pending: { label: "Community sourced", variant: "warning", title: "Community sourced — a provider claim is in review" },
  "facility-owned": { label: "Official", variant: "success", title: "Official — managed directly by the facility" },
  verified: { label: "Official", variant: "success", title: "Official — managed directly by the facility and confirmed by Tiru" },
};

export function VerificationBadge({ status, size = "sm", compact = false }: VerificationBadgeProps) {
  const badge = badgeContent[status];
  const badgeSize: PillSize = size === "lg" ? "lg" : "sm";
  // Only the long label abbreviates; "Official" is already short and rare.
  // The full phrase stays in visually-hidden text and in the title attribute,
  // so nothing is lost to a screen reader or to a hover. Badge does not accept
  // aria-label, and widening its API for one caller is not worth it.
  const isCommunity = badge.label === "Community sourced";
  const abbreviated = compact && isCommunity;
  return (
    <Badge
      className="!font-semibold"
      size={badgeSize}
      title={badge.title}
      variant={badge.variant}
    >
      {abbreviated ? (
        <>
          <span aria-hidden="true">CS</span>
          <span className="sr-only">{badge.label}</span>
        </>
      ) : (
        badge.label
      )}
    </Badge>
  );
}
