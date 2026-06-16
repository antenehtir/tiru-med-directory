import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";

export function HeroSearchSection() {
  return (
    <section className="bg-transparent">
      <PageContainer className="pb-6 pt-8 sm:pb-8 sm:pt-14 lg:pb-10 lg:pt-16">
        <div className="min-w-0">
          <p className="mb-4 inline-flex max-w-full rounded-full border border-border bg-soft-accent px-3 py-2 text-sm font-medium text-primary sm:px-4">
            Addis Ababa &middot; Private Healthcare
          </p>
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
            <Link
              className="inline-flex min-h-10 items-center rounded-full border border-border bg-transparent px-4 text-sm font-semibold text-foreground transition hover:border-strong-border hover:bg-card"
              href="/nearby"
            >
              📍 Find nearby care
            </Link>
            <Link
              className="inline-flex min-h-10 items-center rounded-full border border-border bg-transparent px-4 text-sm font-semibold text-foreground transition hover:border-strong-border hover:bg-card"
              href="/facilities"
            >
              🏥 Browse facilities
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
