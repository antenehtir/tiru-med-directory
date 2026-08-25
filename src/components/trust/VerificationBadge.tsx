import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant, PillSize } from "@/lib/design-tokens";
import type { VerificationStatus } from "@/types/verification";

type VerificationBadgeProps = {
  status: VerificationStatus;
  entityType?: "facility" | "doctor";
  size?: "sm" | "lg";
};

const badgeContent: Record<VerificationStatus, { label: string; variant: BadgeVariant; title: string }> = {
  "community-submitted": { label: "Community sourced", variant: "warning", title: "Community sourced — details should be confirmed with the provider" },
  "facility-owned": { label: "Provider claimed", variant: "info", title: "Provider claimed — this facility manages its information on Tiru" },
  verified: { label: "Tiru verified", variant: "success", title: "Tiru verified — information has been independently confirmed" },
  pending: { label: "Verification pending", variant: "warning", title: "Verification is currently pending" },
};

export function VerificationBadge({ status, size = "sm" }: VerificationBadgeProps) {
  const badge = badgeContent[status];
  const badgeSize: PillSize = size === "lg" ? "lg" : "sm";
  return <Badge className="!font-semibold" size={badgeSize} title={badge.title} variant={badge.variant}>{badge.label}</Badge>;
}
