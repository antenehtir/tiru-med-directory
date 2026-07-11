import type { ReactNode } from "react";
import type { BadgeVariant, PillSize } from "@/lib/design-tokens";

// Badges are semantic status labels — slightly bolder than Pill, never interactive.
// Use for: verification status, facility Active/Inactive, role labels, claim status,
// availability indicators on cards.
//
// For interactive chips (filter pills, toggles): use Pill instead.

const base =
  "inline-flex items-center font-medium leading-none rounded-full";

const variantClasses: Record<BadgeVariant, string> = {
  // Neutral bordered label — general-purpose, low-emphasis
  default:
    "border border-border bg-card text-foreground",
  // Subdued gray — "Closed", inactive secondary labels, "N/A" states
  muted:
    "border border-border bg-muted text-muted-foreground",
  // Amber — CS badge, pending verification, "Under review"
  warning:
    "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  // Red — Inactive, rejected, expired, deactivated
  danger:
    "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
  // Green — Active, Verified, "Open now", approved, on-file confirmed
  success:
    "border border-success-border bg-success-bg text-success-text",
  // Blue — Official badge (transitional; target = primary/teal in a later phase)
  info:
    "border border-info-border bg-info-bg text-info-text",
};

const sizeClasses: Record<PillSize, string> = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-0.5 text-xs gap-1.5",
};

const dotClasses: Record<BadgeVariant, string> = {
  default:  "bg-foreground",
  muted:    "bg-muted-foreground",
  warning:  "bg-amber-500 dark:bg-amber-400",
  danger:   "bg-red-500 dark:bg-red-400",
  success:  "bg-success",
  info:     "bg-info",
};

type BadgeProps = {
  variant?: BadgeVariant;
  size?: PillSize;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  icon,
  className = "",
  children,
}: BadgeProps) {
  const prefix = icon ?? (dot ? (
    <span className={`size-1.5 shrink-0 rounded-full ${dotClasses[variant]}`} />
  ) : null);

  return (
    <span className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {prefix}
      {children}
    </span>
  );
}
