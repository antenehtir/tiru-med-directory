import Link from "next/link";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";

const facilityCategories: {
  label: string;
  href: string;
  value?: FacilityCategoryFilter;
}[] = [
  { label: "All", href: "/facilities" },
  {
    label: "General Hospitals",
    href: "/facilities?category=hospital",
    value: "hospital",
  },
  {
    label: "Specialty Centers",
    href: "/facilities?category=specialty",
    value: "specialty",
  },
  { label: "Clinics", href: "/facilities?category=clinic", value: "clinic" },
  {
    label: "Diagnostics",
    href: "/facilities?category=diagnostics",
    value: "diagnostics",
  },
];

type FacilityCategoryFiltersProps = {
  activeCategory?: FacilityCategoryFilter;
};

export function FacilityCategoryFilters({
  activeCategory,
}: FacilityCategoryFiltersProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.025)]">
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
                : "border-border bg-card text-foreground hover:border-strong-border"
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
