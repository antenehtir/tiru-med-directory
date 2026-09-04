import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      className="flex min-w-0 flex-col items-start justify-center py-1"
      href="/"
      aria-label="Tiru home"
    >
      {/* Was three arbitrary rem one-offs (1.45/1.6/1.7) plus a 0.68rem
          sub-label. Now the display face on the scale's 24→28 step, with the
          sub-label on the 12px step (text-xs) rather than the 11px micro
          step: at 11px, against text-muted-foreground, this read as
          "invisible" on a real phone even though it renders correctly and
          clears WCAG AA contrast (7.25:1 light, 6.93:1 dark) — sub-pixel
          rendering at that size on a high-DPI screen is the likely reason a
          bug report couldn't be reproduced in this environment. One step up
          the type scale is the fix; the color and weight were never the
          problem. */}
      <span className="font-display text-2xl font-bold leading-none tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
        Tiru
      </span>
      <span className="mt-1 max-w-[8.5rem] truncate text-xs font-medium leading-none tracking-[0.01em] text-muted-foreground min-[380px]:max-w-none">
        Trace the right care.
      </span>
    </Link>
  );
}
