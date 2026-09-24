import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { specialtyMatchesAliases } from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";
import { ArrowRightIcon, EyeIcon, HeartIcon, PersonIcon, PlusCircleIcon, SparkIcon } from "./home-icons";

// Labels are the mockup's; `specialty` is the canonical value the /facilities
// specialty filter and its alias matching already understand (the same values
// the previous homepage's category row linked to). A chip is shown only when
// at least one loaded facility actually offers it, so no chip leads to an
// empty page.
const SPECIALTIES: { label: string; specialty: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { label: "Pediatrics", specialty: "Pediatrics", Icon: PersonIcon },
  { label: "Surgery", specialty: "General Surgery", Icon: PlusCircleIcon },
  { label: "Internal Medicine", specialty: "Internal Medicine", Icon: PlusCircleIcon },
  { label: "Obstetrics & Gynecology", specialty: "Gynecology & Obstetrics", Icon: HeartIcon },
  { label: "Fertility", specialty: "Fertility", Icon: HeartIcon },
  { label: "ENT", specialty: "ENT (Ear, Nose, Throat)", Icon: PlusCircleIcon },
  { label: "Ophthalmology", specialty: "Ophthalmology (Eye Care)", Icon: EyeIcon },
  { label: "Dermatology", specialty: "Dermatology", Icon: SparkIcon },
  { label: "Dental", specialty: "Dental", Icon: PlusCircleIcon },
  { label: "Mental Health", specialty: "Psychiatry & Mental Health", Icon: SparkIcon },
  { label: "Physiotherapy", specialty: "Physiotherapy", Icon: PersonIcon },
];

// Same merged tag set the /facilities specialty filter matches against:
// services plus category-tagged custom entries.
function mergedTags(facility: Facility): string {
  const custom = Object.values(facility.customServiceCategories ?? {}).flat();
  return Array.from(new Set([...facility.services, ...custom])).filter(Boolean).join(" ");
}

export function ExploreMoreCare({ facilities }: { facilities: Facility[] }) {
  const tags = facilities.map(mergedTags);
  const chips = SPECIALTIES.filter(({ specialty }) =>
    tags.some((text) => specialtyMatchesAliases(text, specialty)),
  );

  if (chips.length === 0) return null;

  return (
    <section aria-labelledby="explore-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-[-0.01em] text-home-ink sm:text-[2rem]" id="explore-heading">
            Explore more care
          </h2>
          <p className="mt-1 hidden text-sm text-home-muted sm:block">Browse by category or specialty to find more options.</p>
        </div>
        <Link
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-home-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal"
          href="/facilities"
        >
          View all categories
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <ul className="mt-5 flex flex-wrap gap-2 sm:gap-3">
        {chips.map(({ label, specialty, Icon }) => (
          <li key={specialty}>
            <Link
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-home-line bg-home-surface px-3 text-[12px] font-medium text-home-ink transition-colors hover:border-home-teal/50 hover:bg-home-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal sm:min-h-11 sm:px-4 sm:text-sm"
              href={`/facilities?specialty=${encodeURIComponent(specialty)}`}
            >
              {/* Icons from sm up; on a phone the mockup's chips are text only,
                  which keeps the set to a few compact rows. */}
              <Icon className="hidden size-4 text-home-accent-text sm:block" />
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            aria-label="More categories"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border border-home-line bg-home-surface px-3 text-home-muted transition-colors hover:border-home-teal/50 hover:bg-home-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal sm:min-h-11"
            href="/facilities"
          >
            <span aria-hidden="true" className="text-lg leading-none tracking-widest">···</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
