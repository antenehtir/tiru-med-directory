import Link from "next/link";
import type { SVGProps } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  facilityCategoryIconChipClasses,
  type FacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";

// "Specialists" links to the doctors directory, not a facility category — it
// gets a neutral treatment instead of borrowing one of the 7 category hues.
const NEUTRAL_ICON_CHIP_CLASS = "bg-muted text-muted-foreground";

function CategoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

const categories: {
  label: string;
  description: string;
  href: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  categoryKey: FacilityCardCategoryKey | null;
}[] = [
  {
    label: "General Hospitals",
    description: "Full-service private hospitals",
    href: "/facilities?category=hospital",
    icon: facilityCategoryIcons.hospital,
    categoryKey: "hospital",
  },
  {
    label: "Specialty Centers",
    description: "Focused care and specialist units",
    href: "/facilities?category=specialty",
    icon: facilityCategoryIcons.specialty,
    categoryKey: "specialty",
  },
  {
    label: "Clinics",
    description: "Primary and outpatient care",
    href: "/facilities?category=clinic",
    icon: facilityCategoryIcons.clinic,
    categoryKey: "clinic",
  },
  {
    label: "Specialists",
    description: "Specialist profiles and specialties",
    href: "/doctors",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <CategoryIcon {...props}>
        <path d="M6 3v6a6 6 0 006 6 6 6 0 006-6V3" />
        <path d="M6 3H4M18 3h2M18 15a4 4 0 01-4 4H10" />
        <circle cx="18" cy="19" r="2" />
      </CategoryIcon>
    ),
    categoryKey: null,
  },
  {
    label: "Diagnostics",
    description: "Labs, imaging, and tests",
    href: "/diagnostics",
    icon: facilityCategoryIcons.diagnostics,
    categoryKey: "diagnostics",
  },
  {
    label: "Pharmacies",
    description: "Medicine access points",
    href: "/pharmacies",
    icon: facilityCategoryIcons.pharmacy,
    categoryKey: "pharmacy",
  },
  {
    label: "Ambulance",
    description: "Emergency transport",
    href: "/facilities?category=ambulance",
    icon: facilityCategoryIcons.ambulance,
    categoryKey: "ambulance",
  },
  {
    label: "Home Care",
    description: "Care at your home",
    href: "/facilities?category=home-care",
    icon: facilityCategoryIcons["home-care"],
    categoryKey: "home-care",
  },
];

export function QuickCategoriesSection() {
  return (
    // Sunken band — the second surface tier. Alternating grounds are what give
    // the page vertical rhythm now that the decorative dot field is gone.
    <section className="border-y border-border bg-sunken">
      <PageContainer className="py-8 sm:py-10 lg:py-12">
        <div>
          <h2 className="font-display text-[2rem] font-semibold leading-[1.1] text-foreground">
            Browse by category
          </h2>
          {/* auto-rows-fr keeps every row the same height: descriptions wrap to
              different line counts, which previously staggered rows 121/103/87px
              down the grid. */}
          <div className="mt-5 grid auto-rows-fr gap-3 grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const iconChipClass = category.categoryKey
                ? facilityCategoryIconChipClasses[category.categoryKey]
                : NEUTRAL_ICON_CHIP_CLASS;

              return (
                <Link
                  key={category.label}
                  // Stacked at 2-col mobile, horizontal from sm. Icon-beside-
                  // text left ~82px for the label in a 166px card, which
                  // broke "General Hospitals" onto two lines and the
                  // description onto three. Stacking gives the text the full
                  // card width.
                  className="flex min-w-0 flex-col items-start gap-2.5 rounded-card border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-px hover:border-strong-border hover:shadow-lift motion-reduce:transform-none motion-reduce:transition-none sm:flex-row sm:items-center sm:gap-3"
                  href={category.href}
                  prefetch={true}
                >
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-control sm:size-10 ${iconChipClass}`}>
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-balance font-display text-sm font-semibold leading-[1.25] text-foreground sm:text-[15px]">
                      {category.label}
                    </span>
                    {/* Hidden at 2-col mobile: a 12px description wrapping to
                        three lines in a 134px column is noise, and the label
                        already names the destination. */}
                    <span className="mt-1 hidden line-clamp-2 text-[13px] leading-snug text-muted-foreground sm:block">
                      {category.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
