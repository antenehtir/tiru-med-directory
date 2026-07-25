import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant, PillSize } from "@/lib/design-tokens";
import type { VerificationStatus } from "@/types/verification";

type VerificationBadgeProps = {
  status: VerificationStatus;
  entityType?: "facility" | "doctor";
  size?: "sm" | "lg";
};

const badgeContent: Record<
  VerificationStatus,
  { label: string; variant: BadgeVariant; title: string }
> = {
  "community-submitted": {
    label: "CS",
    variant: "warning",
    title: "Community submitted — verify details with provider",
  },
  "facility-owned": {
    label: "Official",
    variant: "info",
    title: "Managed by the facility — information is provider-maintained",
  },
  verified: {
    label: "✓",
    variant: "success",
    title: "Verified by Tiru — independently confirmed",
  },
  pending: {
    label: "Pending",
    variant: "warning",
    title: "Pending verification",
  },
};

export function VerificationBadge({ status, size = "sm" }: VerificationBadgeProps) {
  const badge = badgeContent[status];
  const badgeSize: PillSize = size === "lg" ? "lg" : "sm";

  return (
    <Badge className="!font-bold" size={badgeSize} title={badge.title} variant={badge.variant}>
      {badge.label}
    </Badge>
  );
}
