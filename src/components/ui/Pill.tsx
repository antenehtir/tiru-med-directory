import type { ReactNode } from "react";
import type { PillVariant, PillSize } from "@/lib/design-tokens";

// Base classes shared by all pill variants — compact, rounded-full, inline-flex
const base =
  "inline-flex items-center font-medium leading-none rounded-full transition-colors";

const variantClasses: Record<PillVariant, string> = {
  // Neutral bordered chip — use for tag clouds, filter pills (unselected),
  // language tags, informational labels with no urgency
  default:
    "border border-border bg-card text-foreground",
  // Active/selected state — use for pressed filter pills, chosen categories
  selected:
    "border border-primary bg-primary text-primary-foreground",
  // Subdued neutral — use for "Not uploaded", disabled states, closed indicators
  muted:
    "border border-border bg-muted text-muted-foreground",
  // Amber/caution — CS badge, pre-approval, "Required for approval", unverified,
  // "By appointment" (action required before access)
  warning:
    "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  // Red/urgent — expired, rejected, inactive, error states, deactivation
  danger:
    "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
  // Green/positive — "Available now", "Active", approved, "Open now", on-file confirmations
  success:
    "border border-success-border bg-success-bg text-success-text",
  // Blue/informational — Official badge (transitional; target is primary/teal)
  info:
    "border border-info-border bg-info-bg text-info-text",
};

const sizeClasses: Record<PillSize, string> = {
  // Tight — timestamps, inline count badges, very compact contexts
  sm: "px-2 py-0.5 text-xs gap-1",
  // Standard — most pills across the UI
  md: "px-3 py-1 text-xs gap-1.5",
};

// Colored dot matching the variant — for status indicators ("Available now", etc.)
const dotClasses: Record<PillVariant, string> = {
  default:  "bg-foreground",
  selected: "bg-primary-foreground",
  muted:    "bg-muted-foreground",
  warning:  "bg-amber-500 dark:bg-amber-400",
  danger:   "bg-red-500 dark:bg-red-400",
  success:  "bg-success",
  info:     "bg-info",
};

type PillProps = {
  variant?: PillVariant;
  size?: PillSize;
  dot?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
};

export function Pill({
  variant = "default",
  size = "md",
  dot = false,
  icon,
  onClick,
  className = "",
  children,
}: PillProps) {
  const cls = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const prefix = icon ?? (dot ? (
    <span className={`size-1.5 shrink-0 rounded-full ${dotClasses[variant]}`} />
  ) : null);

  if (onClick) {
    return (
      <button className={cls} onClick={onClick} type="button">
        {prefix}
        {children}
      </button>
    );
  }

  return (
    <span className={cls}>
      {prefix}
      {children}
    </span>
  );
}
