import Link from "next/link";
import { healthcareCategories } from "./search-options";

const categoryRoutes: Record<string, string> = {
  All: "/search",
  "General Hospitals": "/facilities?category=hospital",
  "Specialty Centers": "/facilities?category=specialty",
  Clinics: "/facilities?category=clinic",
  Doctors: "/doctors",
  Diagnostics: "/diagnostics",
  Pharmacies: "/pharmacies",
};

export function CategoryChips() {
  return (
    <div aria-label="Healthcare categories">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        Search by category
      </p>
      <div className="flex max-w-full flex-wrap items-center gap-2">
        {healthcareCategories.map((category, index) => (
          <Link
            key={category}
            className={`inline-flex h-11 max-w-full items-center justify-center rounded-full border px-4 text-center text-sm font-semibold leading-none transition sm:px-5 ${
              index === 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-strong-border"
            }`}
            href={categoryRoutes[category]}
            aria-current={index === 0 ? "page" : undefined}
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
}
