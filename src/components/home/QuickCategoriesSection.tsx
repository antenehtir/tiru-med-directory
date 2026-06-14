import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

const categories = [
  { label: "General Hospitals", href: "/facilities?category=hospital" },
  { label: "Specialty Centers", href: "/facilities?category=specialty" },
  { label: "Clinics", href: "/facilities?category=clinic" },
  { label: "Doctors", href: "/doctors" },
  { label: "Diagnostics", href: "/diagnostics" },
  { label: "Pharmacies", href: "/pharmacies" },
];

export function QuickCategoriesSection() {
  return (
    <section className="bg-background">
      <PageContainer className="py-7 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Browse
              </p>
              <h2 className="text-2xl font-semibold leading-tight text-foreground">
                Care categories
              </h2>
            </div>
            <Link
              className="hidden min-h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-strong-border sm:inline-flex"
              href="/nearby"
            >
              Find nearby care
            </Link>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.label}
              className="flex min-h-13 items-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(17,24,39,0.025)] transition-colors hover:border-strong-border"
              href={category.href}
            >
              {category.label}
            </Link>
          ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
