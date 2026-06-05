import Link from "next/link";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";

const facilityCategories: {
  label: string;
  href: string;
  value?: FacilityCategoryFilter;
}[] = [
  { label: "All facilities", href: "/facilities" },
  { label: "Clinics", href: "/facilities?category=clinic", value: "clinic" },
  {
    label: "Hospitals",
    href: "/facilities?category=hospital",
    value: "hospital",
  },
  {
    label: "Laboratories",
    href: "/facilities?category=laboratory",
    value: "laboratory",
  },
  {
    label: "Diagnostic centers",
    href: "/facilities?category=laboratory",
    value: "laboratory",
  },
  { label: "Community submitted", href: "/facilities" },
];

type FacilityCategoryFiltersProps = {
  activeCategory?: FacilityCategoryFilter;
};

export function FacilityCategoryFilters({
  activeCategory,
}: FacilityCategoryFiltersProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold text-foreground">
        Facility categories
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {facilityCategories.map((category) => {
          const isActive =
            category.value === activeCategory ||
            (!category.value && !activeCategory);

          return (
            <Link
              key={`${category.label}-${category.href}`}
              className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground"
              }`}
              href={category.href}
              aria-current={isActive ? "page" : undefined}
            >
              {category.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
