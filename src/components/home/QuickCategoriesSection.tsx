import Link from "next/link";
import type { SVGProps } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  facilityCategoryBorderTopClasses,
  facilityCategoryIconChipClasses,
  type FacilityCardCategoryKey,
} from "@/components/cards/facility-category-style";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";

// "Specialists" links to the doctors directory, not a facility category — it
// gets a neutral treatment instead of borrowing one of the 7 category hues.
const NEUTRAL_BORDER_TOP_CLASS = "border-t-strong-border";
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
    <section className="bg-transparent">
      <PageContainer className="py-7 sm:py-10 lg:py-12">
        <div>
          <h2 className="text-2xl font-semibold leading-tight text-foreground">
            Browse by category
          </h2>
          <div className="mt-5 grid gap-3 grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const borderTopClass = category.categoryKey
                ? facilityCategoryBorderTopClasses[category.categoryKey]
                : NEUTRAL_BORDER_TOP_CLASS;
              const iconChipClass = category.categoryKey
                ? facilityCategoryIconChipClasses[category.categoryKey]
                : NEUTRAL_ICON_CHIP_CLASS;

              return (
                <Link
                  key={category.label}
                  className={`flex min-w-0 items-center gap-3 rounded-2xl border border-border border-t-2 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-strong-border hover:shadow-md active:scale-[0.98] ${borderTopClass}`}
                  href={category.href}
                  prefetch={true}
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${iconChipClass}`}>
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words hyphens-auto text-sm font-semibold leading-tight text-foreground sm:text-base">
                      {category.label}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-xs leading-snug text-muted-foreground">
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
