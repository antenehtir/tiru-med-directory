import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      className="flex min-w-0 flex-col items-start"
      href="/"
      aria-label="Tiru home"
    >
      <span className="text-2xl font-semibold leading-none tracking-normal text-foreground sm:text-[1.65rem]">
        Tiru
      </span>
      <span className="mt-1 text-xs font-medium leading-none text-muted-foreground">
        Trace the right care.
      </span>
    </Link>
  );
}
