import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";

export function HeroSearchSection() {
  return (
    <section className="bg-transparent">
      <PageContainer className="pb-6 pt-6 sm:pb-8 sm:pt-12 lg:pt-16">
        <div className="min-w-0">
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.04] tracking-[-0.03em] text-balance text-foreground sm:text-[3.5rem] sm:leading-[1.0]">
            Find the care you need.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">
            Search hospitals, clinics, specialists, diagnostics and pharmacies
            across Addis Ababa.
          </p>

          <div className="mt-6 max-w-4xl">
            <HealthcareSearchBox />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-11 items-center rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              href="/nearby"
            >
              Find nearby care
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-control border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:border-strong-border hover:bg-muted"
              href="/search"
            >
              Browse with filter
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
