import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      className="flex min-w-0 flex-col items-start justify-center py-1"
      href="/"
      aria-label="Tiru home"
    >
      <span className="text-[1.45rem] font-semibold leading-none tracking-normal text-foreground min-[380px]:text-[1.6rem] sm:text-[1.7rem]">
        Tiru
      </span>
      <span className="mt-1 max-w-[8.5rem] truncate text-[0.68rem] font-medium leading-none text-muted-foreground min-[380px]:max-w-none min-[380px]:text-xs">
        Trace the right care.
      </span>
    </Link>
  );
}
