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
    className:
      "border border-emerald-200 bg-[#ECFDF5] text-[#0F766E] dark:border-emerald-300/40 dark:bg-emerald-300/15 dark:text-emerald-200",
  },
  pending: {
    label: "Pending",
    className:
      "border border-amber-300 bg-[#FEF3C7] text-[#B45309] dark:border-amber-300/40 dark:bg-amber-300/15 dark:text-amber-200",
  },
  "community-submitted": {
    label: "Community submitted",
    className:
      "border border-amber-300 bg-[#FEF3C7] text-[#B45309] dark:border-amber-300/40 dark:bg-amber-300/15 dark:text-amber-200",
  },
};

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const badge = badgeContent[status];

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center rounded-full px-3 py-1 text-center text-xs font-semibold leading-4 ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
