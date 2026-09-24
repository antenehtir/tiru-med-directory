import type { ReactNode } from "react";
import { BuildingIcon, PinIcon, RefreshIcon, ShieldIcon } from "./home-icons";

// Only the first figure is data: the live count of active listings, exactly
// as loaded, with no "+" — the directory's whole promise is that its numbers
// are real. The other three are statements about the service, not counts.
export function HomeStats({ listingCount }: { listingCount: number }) {
  return (
    <section aria-label="Tiru Health at a glance" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ul className="-mt-2 grid grid-cols-3 gap-y-4 rounded-2xl bg-home-surface px-3 py-4 shadow-home ring-1 ring-home-line sm:px-6 lg:mt-0 lg:grid-cols-4 lg:divide-x lg:divide-home-line lg:py-5">
        <Stat icon={<BuildingIcon className="size-6" />} label="Healthcare listings" shortLabel="Listings" value={listingCount.toLocaleString("en-US")} />
        <Stat icon={<PinIcon className="size-6" />} label="Citywide coverage" shortLabel="Coverage" value="Addis Ababa" />
        <Stat icon={<ShieldIcon className="size-6" />} label="To search" value="Free" />
        <Stat
          className="col-span-3 justify-center border-t border-home-line pt-4 lg:col-span-1 lg:justify-start lg:border-t-0 lg:pt-0"
          icon={<RefreshIcon className="size-6" />}
          label="Provider information"
          value="Updated regularly"
        />
      </ul>
    </section>
  );
}

function Stat({
  icon,
  value,
  label,
  shortLabel,
  className = "",
}: {
  icon: ReactNode;
  value: string;
  label: string;
  shortLabel?: string;
  className?: string;
}) {
  return (
    <li className={`flex min-w-0 items-center gap-1.5 px-0.5 sm:gap-3 sm:px-1 lg:px-6 lg:first:pl-2 ${className}`}>
      <span className="shrink-0 text-home-accent-text [&>svg]:size-[18px] sm:[&>svg]:size-6">{icon}</span>
      <span className="min-w-0">
        {/* Wraps rather than truncating: "Addis Ababa" is a name, and cut to
            "Addis Aba…" in a 110px phone column it stops being one. */}
        <span className="block text-[12.5px] font-semibold leading-tight text-home-ink sm:text-base">{value}</span>
        {shortLabel ? (
          <>
            <span className="block truncate text-[11px] text-home-muted sm:hidden">{shortLabel}</span>
            <span className="hidden truncate text-sm text-home-muted sm:block">{label}</span>
          </>
        ) : (
          <span className="block truncate text-[11px] text-home-muted sm:text-sm">{label}</span>
        )}
      </span>
    </li>
  );
}
