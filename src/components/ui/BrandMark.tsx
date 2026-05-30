import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      className="flex min-w-0 items-center gap-3"
      href="/"
      aria-label="DigitalDirectory-v2 home"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground shadow-sm">
        DD
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-base font-semibold text-foreground">
          DigitalDirectory-v2
        </span>
        <span className="block truncate text-sm text-muted-foreground">
          Healthcare discovery
        </span>
      </span>
    </Link>
  );
}
