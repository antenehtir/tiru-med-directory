import Link from "next/link";
import {
  specialtySubFilters,
  type FacilityCategoryFilter,
} from "@/lib/frontend-search-filters";

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
  {
    label: "Pharmacies",
    href: "/facilities?category=pharmacy",
    value: "pharmacy",
  },
  {
    label: "Ambulance",
    href: "/facilities?category=ambulance",
    value: "ambulance",
  },
  {
    label: "Home Care",
    href: "/facilities?category=home-care",
    value: "home-care",
  },
];

type FacilityCategoryFiltersProps = {
  activeCategory?: FacilityCategoryFilter;
  activeSpecialty?: string;
};

export function FacilityCategoryFilters({
  activeCategory,
  activeSpecialty = "",
}: FacilityCategoryFiltersProps) {
  const normalizedSpecialty = activeSpecialty.trim().toLowerCase();

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

      {activeCategory === "specialty" ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {specialtySubFilters.map((sub) => {
            const isAll = sub === "All specialties";
            const subKey = sub.toLowerCase();
            const isActive = isAll
              ? !normalizedSpecialty
              : normalizedSpecialty === subKey;
            const href = isAll
              ? "/facilities?category=specialty"
              : `/facilities?category=specialty&specialty=${encodeURIComponent(sub)}`;

            return (
              <Link
                key={sub}
                className={`flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-strong-border"
                }`}
                href={href}
                aria-current={isActive ? "page" : undefined}
              >
                {sub}
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
