import Link from "next/link";

const categoryFilters = [
  { label: "All", href: "/search" },
  { label: "General Hospitals", href: "/facilities?category=hospital" },
  { label: "Specialty Centers", href: "/facilities?category=specialty" },
  { label: "Clinics", href: "/facilities?category=clinic" },
  { label: "Doctors", href: "/doctors" },
  { label: "Diagnostics", href: "/diagnostics" },
  { label: "Pharmacies", href: "/pharmacies" },
];

export function SearchFilterControls() {
  return (
    <aside className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.025)]">
      <div>
        <p className="text-sm font-semibold text-foreground">Categories</p>
        <div className="mt-3 flex flex-wrap gap-2 lg:grid">
          {categoryFilters.map((filter, index) => (
            <Link
              key={filter.label}
              className={`min-h-11 rounded-full border px-4 text-left text-sm font-semibold lg:rounded-md ${
                index === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-strong-border"
              }`}
              href={filter.href}
              aria-pressed={index === 0}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
