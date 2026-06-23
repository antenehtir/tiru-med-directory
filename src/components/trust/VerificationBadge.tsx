import type { VerificationStatus } from "@/types/verification";

type VerificationBadgeProps = {
  status: VerificationStatus;
  entityType?: "facility" | "doctor";
  size?: "sm" | "lg";
};

const badgeContent: Record<
  VerificationStatus,
  { label: string; className: string; title: string }
> = {
  "community-submitted": {
    label: "CS",
    className:
      "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
    title: "Community submitted — verify details with provider",
  },
  "facility-owned": {
    label: "Official",
    className:
      "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300",
    title: "Managed by the facility — information is provider-maintained",
  },
  verified: {
    label: "✓",
    className:
      "border border-[#A7F3D0] bg-[#ECFDF5] text-[#0F766E] dark:border-[#0F766E] dark:bg-[#064E3B] dark:text-[#A7F3D0]",
    title: "Verified by Tiru — independently confirmed",
  },
  pending: {
    label: "Pending",
    className:
      "border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E] dark:border-[#B45309] dark:bg-[#451A03] dark:text-[#FCD34D]",
    title: "Pending verification",
  },
};

export function VerificationBadge({ status, size = "sm" }: VerificationBadgeProps) {
  const badge = badgeContent[status];

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center rounded-full border text-center font-bold leading-4 ${badge.className} ${
        size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs"
      }`}
      title={badge.title}
    >
      {badge.label}
    </span>
  );
}
