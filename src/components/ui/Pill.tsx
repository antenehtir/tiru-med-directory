import type { ReactNode } from "react";
import type { PillVariant, PillSize } from "@/lib/design-tokens";

const base =
  "inline-flex items-center font-medium leading-none rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<PillVariant, string> = {
  default:
    "border border-border bg-card text-foreground hover:border-strong-border hover:bg-muted active:scale-[0.98]",
  selected:
    "border border-primary bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(15,118,110,0.18)] hover:bg-primary-hover active:scale-[0.98]",
  muted:
    "border border-border bg-muted text-muted-foreground",
  warning:
    "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  danger:
    "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
  success:
    "border border-success-border bg-success-bg text-success-text",
  info:
    "border border-info-border bg-info-bg text-info-text",
};

const sizeClasses: Record<PillSize, string> = {
  sm: "px-2.5 py-1 text-xs gap-1",
  md: "px-3 py-1.5 text-xs gap-1.5",
  lg: "px-3.5 py-2 text-sm gap-2",
};

const dotClasses: Record<PillVariant, string> = {
  default: "bg-foreground",
  selected: "bg-primary-foreground",
  muted: "bg-muted-foreground",
  warning: "bg-amber-500 dark:bg-amber-400",
  danger: "bg-red-500 dark:bg-red-400",
  success: "bg-success",
  info: "bg-info",
};

export function getPillClassName(
  variant: PillVariant = "default",
  size: PillSize = "md",
  className = "",
): string {
  return `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

type PillProps = {
  variant?: PillVariant;
  size?: PillSize;
  dot?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  ariaPressed?: boolean;
};

export function Pill({
  variant = "default",
  size = "md",
  dot = false,
  icon,
  onClick,
  className = "",
  children,
  ariaPressed,
}: PillProps) {
  const cls = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  const prefix = icon ?? (dot ? (
    <span className={`size-1.5 shrink-0 rounded-full ${dotClasses[variant]}`} />
  ) : null);

  if (onClick) {
    return (
      <button
        aria-pressed={ariaPressed}
        className={cls}
        onClick={onClick}
        type="button"
      >
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
