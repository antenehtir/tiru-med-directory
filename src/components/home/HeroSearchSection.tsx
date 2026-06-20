import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";

export function HeroSearchSection() {
  return (
    <section className="bg-transparent">
      <PageContainer className="pb-6 pt-8 sm:pb-8 sm:pt-14 lg:pb-10 lg:pt-16">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700">
              Addis Ababa &middot; Private Healthcare
            </span>
          </div>
          <h1 className="max-w-3xl text-[2.15rem] font-semibold leading-[1.04] text-foreground sm:text-5xl sm:leading-[1.02]">
            Find the care you need.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Search hospitals, clinics, specialists, diagnostics and pharmacies
            across Addis Ababa.
          </p>

          <div className="mt-6 max-w-4xl">
            <HealthcareSearchBox />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="relative inline-flex">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-20" />
              <Link
                className="relative z-10 inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                href="/nearby"
              >
                Find nearby care
              </Link>
            </span>
            <Link
              className="inline-flex min-h-10 items-center rounded-full border border-border bg-transparent px-5 text-sm font-semibold text-foreground transition hover:border-strong-border hover:bg-card"
              href="/facilities"
            >
              Browse with filter
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 sm:hidden">
              <svg
                aria-hidden="true"
                className="size-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
              >
                <path d="M9 6h10M9 12h10M9 18h10M4 6h.01M4 12h.01M4 18h.01" />
              </svg>
              100+ Listings &middot; Citywide Coverage
            </span>

            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 sm:inline-flex">
              <svg
                aria-hidden="true"
                className="size-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
              >
                <path d="M9 6h10M9 12h10M9 18h10M4 6h.01M4 12h.01M4 18h.01" />
              </svg>
              100+ Healthcare Listings
            </span>
            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 sm:inline-flex">
              <svg
                aria-hidden="true"
                className="size-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
              >
                <path d="M12 2a6 6 0 016 6c0 5-6 12-6 12S6 13 6 8a6 6 0 016-6z" />
                <circle cx="12" cy="8" r="2" />
              </svg>
              Citywide Addis Coverage
            </span>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
