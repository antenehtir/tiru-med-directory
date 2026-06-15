import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

const categories = [
  {
    label: "General Hospitals",
    description: "Full-service private hospitals",
    marker: "H",
    href: "/facilities?category=hospital",
  },
  {
    label: "Specialty Centers",
    description: "Focused care and specialist units",
    marker: "S",
    href: "/facilities?category=specialty",
  },
  {
    label: "Clinics",
    description: "Primary and outpatient care",
    marker: "C",
    href: "/facilities?category=clinic",
  },
  {
    label: "Doctors",
    description: "Doctor profiles and specialties",
    marker: "D",
    href: "/doctors",
  },
  {
    label: "Diagnostics",
    description: "Labs, imaging, and tests",
    marker: "L",
    href: "/diagnostics",
  },
  {
    label: "Pharmacies",
    description: "Medicine access points",
    marker: "P",
    href: "/pharmacies",
  },
];

export function QuickCategoriesSection() {
  return (
    <section className="bg-transparent">
      <PageContainer className="py-7 sm:py-10 lg:py-12">
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                Care wayfinding
              </p>
              <h2 className="text-2xl font-semibold leading-tight text-foreground">
                Choose the care path you need.
              </h2>
            </div>
            <Link
              className="hidden min-h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border sm:inline-flex"
              href="/nearby"
            >
              Find nearby care
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.label}
              className="group flex min-h-24 min-w-0 items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(31,41,55,0.035)] transition-colors hover:border-strong-border"
              href={category.href}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-soft-accent text-sm font-bold text-primary">
                {category.marker}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block break-words text-sm font-semibold text-foreground">
                  {category.label}
                </span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  {category.description}
                </span>
              </span>
              <span className="shrink-0 text-lg text-muted-foreground transition group-hover:text-foreground">
                &rarr;
              </span>
            </Link>
          ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
