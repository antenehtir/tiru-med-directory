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
          sub-label on the 11px micro step shared with the card category
          labels. */}
      <span className="font-display text-2xl font-bold leading-none tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
        Tiru
      </span>
      <span className="mt-1 max-w-[8.5rem] truncate text-[11px] font-medium leading-none tracking-[0.01em] text-muted-foreground min-[380px]:max-w-none">
        Trace the right care.
      </span>
    </Link>
  );
}
