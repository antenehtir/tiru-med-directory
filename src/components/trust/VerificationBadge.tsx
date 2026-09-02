import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant, PillSize } from "@/lib/design-tokens";
import type { VerificationStatus } from "@/types/verification";

type VerificationBadgeProps = {
  status: VerificationStatus;
  entityType?: "facility" | "doctor";
  size?: "sm" | "lg";
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

export function VerificationBadge({ status, size = "sm" }: VerificationBadgeProps) {
  const badge = badgeContent[status];
  const badgeSize: PillSize = size === "lg" ? "lg" : "sm";
  return <Badge className="!font-semibold" size={badgeSize} title={badge.title} variant={badge.variant}>{badge.label}</Badge>;
}
