import type { VerificationStatus } from "@/types/verification";

type VerificationBadgeProps = {
  status: VerificationStatus;
  entityType?: "facility" | "doctor";
};

const badgeContent: Record<
  VerificationStatus,
  { label: string; className: string; title: string }
> = {
  verified: {
    label: "✓",
    className:
      "border border-[#A7F3D0] bg-[#ECFDF5] text-[#0F766E] dark:border-[#0F766E] dark:bg-[#064E3B] dark:text-[#A7F3D0]",
    title: "Verified by Tiru team",
  },
  pending: {
    label: "Pending",
    className:
      "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E] dark:border-[#B45309] dark:bg-[#451A03] dark:text-[#FCD34D]",
    title: "Pending verification",
  },
  "community-submitted": {
    label: "CS",
    className: "border border-amber-200 bg-amber-50 text-amber-700",
    title: "Community submitted — pending verification",
  },
};

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const badge = badgeContent[status];

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center rounded-full px-2 py-0.5 text-center text-xs font-bold leading-4 ${badge.className}`}
      title={badge.title}
    >
      {badge.label}
    </span>
  );
}
