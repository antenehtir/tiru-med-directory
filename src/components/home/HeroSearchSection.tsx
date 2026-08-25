import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";

export function HeroSearchSection() {
  return (
    <section className="tiru-hero-light bg-transparent">
      <span aria-hidden="true" className="tiru-hero-light__glow" />
      <PageContainer className="pb-7 pt-7 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Tiru Medical Directory · Addis Ababa
          </div>
          <h1 className="mx-auto max-w-4xl font-display text-[2.7rem] font-bold leading-[0.98] tracking-[-0.04em] text-balance text-foreground sm:text-6xl lg:text-7xl">
            Find the right care.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base lg:text-lg">
            Trusted healthcare information to help you find hospitals, clinics,
            specialists, diagnostics and pharmacies across Addis Ababa.
          </p>
          <div className="mx-auto mt-7 max-w-3xl text-left sm:mt-8">
            <HealthcareSearchBox />
          </div>
          <div className="mx-auto mt-4 flex max-w-3xl flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:flex-none"
              href="/nearby"
            >
              Find care near me
            </Link>
            <Link
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-control border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:flex-none"
              href="/search"
            >
              Browse all care
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Search by facility, specialist, service or pharmacy.
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
