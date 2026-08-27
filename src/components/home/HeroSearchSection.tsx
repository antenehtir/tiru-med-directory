import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";
import { HeroLocationButton } from "./HeroLocationButton";

// Hierarchy is search > location > browse, expressed through weight rather
// than three competing filled buttons: the search box is the only element in
// its own raised surface, location is a bordered secondary control, and
// browse is a plain tertiary link.
export function HeroSearchSection({ mappedFacilityCount }: { mappedFacilityCount: number }) {
  return (
    <section className="tiru-hero-light bg-transparent">
      <span aria-hidden="true" className="tiru-hero-light__glow" />
      <PageContainer className="pb-7 pt-7 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            Tiru Medical Directory · Addis Ababa
          </div>

          <h1 className="mx-auto max-w-4xl font-display text-[2.7rem] font-bold leading-[0.98] tracking-[-0.04em] text-balance text-foreground sm:text-6xl lg:text-7xl">
            Find the right care.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base lg:text-lg">
            Trusted healthcare information for facilities, specialists and
            services across Addis Ababa.
          </p>

          <div className="mx-auto mt-7 max-w-3xl text-left sm:mt-8">
            <HealthcareSearchBox />
            <p className="mt-2.5 px-1 text-xs leading-5 text-muted-foreground">
              Try &ldquo;Bole&rdquo;, &ldquo;pediatrics&rdquo; or &ldquo;dialysis&rdquo;
            </p>
          </div>

          <div className="mx-auto mt-5 flex max-w-3xl flex-col gap-2 sm:flex-row sm:justify-center">
            <HeroLocationButton />
            <Link
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-control px-5 text-sm font-semibold text-primary transition-colors hover:bg-soft-accent hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-none"
              href="/facilities"
            >
              Browse all care
            </Link>
          </div>

          {/* Real count from the rendered dataset, not a hardcoded figure —
              "mapped" is the number with resolvable coordinates, which is what
              actually determines whether a facility can be placed on a map or
              distance-sorted. */}
          <p className="mt-5 text-xs text-muted-foreground">
            {mappedFacilityCount} healthcare facilities mapped across Addis Ababa
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
