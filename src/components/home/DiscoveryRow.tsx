import Link from "next/link";
import {
  facilityCategoryIconChipClasses,
  resolveFacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { PageContainer } from "@/components/layout/PageContainer";
import { specialtyMatchesAliases } from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

// A chip is only worth showing if tapping it lands on a populated result set.
// A live audit found Ambulance = 1, Pharmacy = 2, Home Care = 2 and Clinic = 0
// facilities out of 108, so those categories are deliberately not offered
// here — a chip that leads to one result (or none) reads as broken. Counts are
// computed from the same data the page renders rather than hardcoded, so a
// category that fills up later starts appearing on its own, and one that
// empties out disappears instead of going stale.
const MIN_FACILITIES_FOR_CHIP = 5;

// Matches the merged tag list used by the specialty audit and by
// filterFacilitiesBySpecialtyKeyword — services + special_services (already
// deduped upstream) unioned with customServiceCategories values.
function mergedTags(facility: Facility): string {
  const custom = Object.values(facility.customServiceCategories ?? {}).flat();
  return Array.from(new Set([...facility.services, ...custom]))
    .filter(Boolean)
    .join(" ");
}

type ChipCandidate = {
  label: string;
  href: string;
  // FacilityCategoryFilter, not FacilityCardCategoryKey: facilityCategoryIcons
  // has no "default" entry.
  iconKey: FacilityCategoryFilter;
  matches: (facility: Facility) => boolean;
};

const CANDIDATES: ChipCandidate[] = [
  {
    label: "Hospitals",
    href: "/facilities?category=hospital",
    iconKey: "hospital",
    matches: (f) => resolveFacilityCardCategoryKey(f) === "hospital",
  },
  {
    label: "Specialty centers",
    href: "/facilities?category=specialty",
    iconKey: "specialty",
    matches: (f) => resolveFacilityCardCategoryKey(f) === "specialty",
  },
  {
    label: "Pediatrics",
    href: `/facilities?specialty=${encodeURIComponent("Pediatrics")}`,
    iconKey: "home-care",
    matches: (f) => specialtyMatchesAliases(mergedTags(f), "Pediatrics"),
  },
  {
    label: "Surgery",
    href: `/facilities?specialty=${encodeURIComponent("General Surgery")}`,
    iconKey: "specialty",
    matches: (f) => specialtyMatchesAliases(mergedTags(f), "General Surgery"),
  },
  {
    label: "Internal medicine",
    href: `/facilities?specialty=${encodeURIComponent("Internal Medicine")}`,
    iconKey: "clinic",
    matches: (f) => specialtyMatchesAliases(mergedTags(f), "Internal Medicine"),
  },
  {
    label: "Gynecology & obstetrics",
    href: `/facilities?specialty=${encodeURIComponent("Gynecology & Obstetrics")}`,
    iconKey: "home-care",
    matches: (f) => specialtyMatchesAliases(mergedTags(f), "Gynecology & Obstetrics"),
  },
  {
    label: "Diagnostics",
    href: "/facilities?category=diagnostics",
    iconKey: "diagnostics",
    matches: (f) => resolveFacilityCardCategoryKey(f) === "diagnostics",
  },
];

export function DiscoveryRow({ facilities }: { facilities: Facility[] }) {
  const chips = CANDIDATES.map((candidate) => ({
    ...candidate,
    count: facilities.filter(candidate.matches).length,
  })).filter((chip) => chip.count >= MIN_FACILITIES_FOR_CHIP);

  if (chips.length === 0) return null;

  return (
    <section aria-labelledby="discovery-heading" className="border-y border-border bg-sunken">
      <PageContainer className="py-8 sm:py-10 lg:py-12">
        <h2
          className="font-display text-[1.75rem] font-semibold leading-tight text-foreground sm:text-3xl"
          id="discovery-heading"
        >
          What are you looking for?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump straight to the care you need.
        </p>

        {/* Horizontally scrollable on mobile, wrapping grid from sm up. The
            negative margin lets the row bleed to the screen edge so the last
            chip is visibly cut off — the affordance that tells you it scrolls
            — while padding keeps the first chip aligned to the page gutter. */}
        <ul className="-mx-3 mt-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3 pb-2 min-[360px]:-mx-4 min-[360px]:px-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {chips.map((chip) => {
            const Icon = facilityCategoryIcons[chip.iconKey];
            return (
              <li className="snap-start" key={chip.label}>
                <Link
                  className="flex h-full min-h-14 w-max min-w-[9.5rem] items-center gap-3 rounded-card border border-border bg-card px-4 py-3 shadow-card transition-all duration-150 hover:-translate-y-px hover:border-strong-border hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto sm:min-w-0"
                  href={chip.href}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-control ${facilityCategoryIconChipClasses[chip.iconKey]}`}
                  >
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[15px] font-semibold leading-tight text-foreground">
                      {chip.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted-foreground">
                      {chip.count} {chip.count === 1 ? "facility" : "facilities"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </PageContainer>
    </section>
  );
}
