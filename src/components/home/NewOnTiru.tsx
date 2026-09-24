import Link from "next/link";
import {
  facilityCategoryDisplayLabel,
  facilityMonogram,
  facilityPlateClasses,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { facilityLocalityLabel } from "@/lib/format-location";
import { getAvailabilityStatus, isRoundTheClockHours } from "@/lib/schedule-availability";
import type { Facility } from "@/types/facility";
import { ArrowRightIcon, ChevronRightIcon } from "./home-icons";

// The four most recently created active listings, chosen in page.tsx from the
// facilities it already loaded. Rendered on the server at request time, so the
// open-now line reflects the moment the page was served.
export function NewOnTiru({ facilities }: { facilities: Facility[] }) {
  if (facilities.length === 0) return null;

  return (
    <section aria-labelledby="new-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-[-0.01em] text-home-ink sm:text-[2rem]" id="new-heading">
            New on Tiru Health
          </h2>
          <p className="mt-1 hidden text-sm text-home-muted sm:block">Recently added healthcare providers in your area.</p>
        </div>
        <Link
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-home-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal"
          href="/facilities"
        >
          View all
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      {/* One card and a peek of the next on a phone, swiped sideways; a row of
          four from lg up. */}
      <ul className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-4 [&::-webkit-scrollbar]:hidden">
        {facilities.map((facility) => (
          <li className="w-[86%] shrink-0 snap-start sm:w-auto" key={facility.id}>
            <NewFacilityCard facility={facility} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewFacilityCard({ facility }: { facility: Facility }) {
  const categoryKey = resolveFacilityCardCategoryKey(facility);
  const photo = facility.photoUrls?.find((url) => url?.trim())?.trim() || facility.photoUrl?.trim() || "";
  const locality = facility.onlineOnly ? "Online" : facilityLocalityLabel(facility);
  const place = locality && locality !== "Online" ? `${locality}, Addis Ababa` : locality || "Addis Ababa";
  const availability = availabilityLine(facility);

  return (
    <Link
      className="group flex h-full items-start gap-3 rounded-2xl bg-home-surface p-3 shadow-home ring-1 ring-home-line transition-all hover:-translate-y-0.5 hover:ring-home-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal motion-reduce:transform-none"
      href={facility.detailHref ?? `/facilities/${facility.slug}`}
    >
      <span className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl lg:size-20">
        {photo ? (
          // Plain <img>, as the other facility cards use: listing photos come
          // from provider uploads and are not all on the optimiser allow-list.
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" loading="lazy" src={photo} />
        ) : (
          <span className={`flex h-full w-full items-center justify-center font-serif text-2xl font-semibold ${facilityPlateClasses[categoryKey]}`}>
            {facilityMonogram(facility.name)}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col self-stretch">
        <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-home-ink">{facility.name}</span>
        <span className="mt-0.5 text-[13px] text-home-text">{facilityCategoryDisplayLabel(facility, categoryKey)}</span>
        <span className="text-[13px] text-home-muted">{place}</span>
        <span className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          {availability ? (
            <span className={`flex min-w-0 items-center gap-1.5 text-[12px] font-medium ${availability.open ? "text-success-text" : "text-home-muted"}`}>
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${availability.open ? "bg-success" : "bg-strong-border"}`} />
              <span className="truncate">{availability.label}</span>
            </span>
          ) : (
            <span />
          )}
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-home-line text-home-muted transition-colors group-hover:border-home-teal group-hover:text-home-accent-text">
            <ChevronRightIcon className="size-3.5" />
          </span>
        </span>
      </span>
    </Link>
  );
}

// Same rules and wording as the facility cards' availability line, so the
// homepage and the listing pages never disagree about whether a place is open.
function availabilityLine(facility: Facility): { label: string; open: boolean } | null {
  if (facility.schedule?.length) {
    const status = getAvailabilityStatus(facility.schedule);
    if (status.state === "open-now") return { label: status.is24Hours ? "Open 24 hours" : "Open now", open: true };
    if (status.state === "opens-later-today") return { label: `Opens ${status.opensAt}`, open: false };
    if (status.state === "next-available-day") return { label: `Opens ${status.day.slice(0, 3)}`, open: false };
    return { label: "Closed now", open: false };
  }
  const hours = facility.workingHours?.trim();
  if (hours && isRoundTheClockHours(hours)) return { label: "Open 24 hours", open: true };
  if (hours) return { label: hours, open: false };
  return null;
}
