import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";

export function HeroSearchSection() {
  return (
    <section className="bg-transparent">
      <PageContainer className="pb-6 pt-6 sm:pb-8 sm:pt-12 lg:pt-16">
        <div className="min-w-0">
          <h1 className="max-w-3xl text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.02em] text-balance text-foreground sm:text-5xl sm:leading-[1.02]">
            Find the care you need.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Search hospitals, clinics, specialists, diagnostics and pharmacies
            across Addis Ababa.
          </p>

          <div className="mt-6 max-w-4xl">
            <HealthcareSearchBox />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="relative inline-flex">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-20" />
              <Link
                className="relative z-10 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                href="/nearby"
              >
                Find nearby care
              </Link>
            </span>
            <Link
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-transparent px-5 text-sm font-semibold text-foreground transition hover:border-strong-border hover:bg-card"
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
