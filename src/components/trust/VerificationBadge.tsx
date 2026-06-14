import type { VerificationStatus } from "@/types/verification";

type VerificationBadgeProps = {
  status: VerificationStatus;
  entityType?: "facility" | "doctor";
};

const badgeContent: Record<
  VerificationStatus,
  { label: string; className: string }
> = {
  verified: {
    label: "Verified",
    className: "border border-[#A7F3D0] bg-[#ECFDF5] text-[#0F766E]",
  },
  pending: {
    label: "Pending",
    className: "border border-border bg-muted text-muted-foreground",
  },
  "community-submitted": {
    label: "Community",
    className: "border border-border bg-muted text-muted-foreground",
  },
};

export function VerificationBadge({
  status,
  entityType,
}: VerificationBadgeProps) {
  const badge = badgeContent[status];
  const label =
    status === "verified" && entityType === "doctor"
      ? "Verified Doctor"
      : status === "verified" && entityType === "facility"
        ? "Verified Facility"
        : badge.label;

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center rounded-full px-3 py-1 text-center text-xs font-semibold leading-4 ${badge.className}`}
    >
      {label}
    </span>
  );
}
