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

// Was "Official", which claimed more than the product does. Nothing in the
// flow that produces this badge checks a credential, a licence or a
// registration — a provider proves control of the listing and then manages it.
// "Official" is the word a health seeker reads as "vetted", and on a medical
// directory that gap is the kind that gets someone hurt. "Facility Managed"
// says the thing that is actually true: these words came from the facility.
//
// "verified" is deliberately NOT merged into it. It is reserved for a future
// quality mark whose criteria are still to be defined, and it is unassigned
// today — 107 of the 108 active listings are community-submitted and exactly
// one is facility-owned, so nothing renders it. Do not assign this status to a
// facility until those criteria exist and a real review has happened; the
// label below promises one.
//
// Amber for community sourced, green for facility managed — the scheme this
// project has used since the badge existed. A previous pass made community
// sourced a muted grey on the theory that the common state should recede; that
// removed the amber "check this yourself" cue, which is the more useful signal
// on a directory where almost every listing is unclaimed. Amber earns its
// place by saying something, not by being rare.
//
// "pending" reads as Community sourced on purpose: until a claim completes,
// the listing has exactly the provenance it started with, and saying anything
// stronger would promise a review that has not happened.
const badgeContent: Record<VerificationStatus, { label: string; variant: BadgeVariant; title: string }> = {
  "community-submitted": { label: "Community sourced", variant: "warning", title: "Community sourced — gathered independently, not yet confirmed by the facility" },
  pending: { label: "Community sourced", variant: "warning", title: "Community sourced — a provider claim is in review" },
  "facility-owned": { label: "Facility Managed", variant: "success", title: "Facility Managed — the facility claimed this listing and keeps it up to date. Tiru has not checked credentials or licences." },
  verified: { label: "Verified", variant: "info", title: "Verified — reviewed by Tiru against published criteria" },
};

// Both long labels abbreviate on dense surfaces. "Facility Managed" is two
// words where "Official" was one, so a card that fits the old label does not
// automatically fit this one.
const COMPACT_LABELS: Partial<Record<VerificationStatus, string>> = {
  "community-submitted": "CS",
  pending: "CS",
  "facility-owned": "FM",
};

export function VerificationBadge({ status, size = "sm", compact = false }: VerificationBadgeProps) {
  const badge = badgeContent[status];
  const badgeSize: PillSize = size === "lg" ? "lg" : "sm";
  // The full phrase stays in visually-hidden text and in the title attribute,
  // so nothing is lost to a screen reader or to a hover. Badge does not accept
  // aria-label, and widening its API for one caller is not worth it.
  const shortLabel = COMPACT_LABELS[status];
  const abbreviated = compact && Boolean(shortLabel);
  return (
    <Badge
      className="!font-semibold"
      size={badgeSize}
      title={badge.title}
      variant={badge.variant}
    >
      {abbreviated ? (
        <>
          <span aria-hidden="true">{shortLabel}</span>
          <span className="sr-only">{badge.label}</span>
        </>
      ) : (
        badge.label
      )}
    </Badge>
  );
}
