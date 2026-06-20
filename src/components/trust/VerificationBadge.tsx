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
      "border border-[#A7F3D0] bg-[#ECFDF5] text-[#0F766E] dark:border-[#0F766E] dark:bg-[#064E3B] dark:text-[#A7F3D0]",
  },
  pending: {
    label: "Pending",
    className:
      "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E] dark:border-[#B45309] dark:bg-[#451A03] dark:text-[#FCD34D]",
  },
  "community-submitted": {
    label: "Community submitted",
    className:
      "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E] dark:border-[#B45309] dark:bg-[#451A03] dark:text-[#FCD34D]",
  },
};

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const badge = badgeContent[status];

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center rounded-full px-2.5 py-1 text-center text-xs font-medium leading-4 ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
