import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";
import { HeroLocationButton } from "./HeroLocationButton";

// Hierarchy is search > location > browse, expressed through surface rather
// than three competing filled buttons: the search box is the only element in
// its own raised surface, location is a bordered control on a card fill with
// a lift shadow, and browse is the same bordered control with neither fill nor
// shadow. Browse used to carry no resting treatment at all — no border, no
// background, no shadow — so on a touch screen it read as a line of text until
// it was already being pressed.
export function HeroSearchSection({ mappedFacilityLabel }: { mappedFacilityLabel: string }) {
  return (
    <section className="tiru-hero-light bg-transparent">
      <span aria-hidden="true" className="tiru-hero-light__glow" />
      <PageContainer className="pb-6 pt-5 sm:pb-10 sm:pt-12 lg:pb-12 lg:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mx-auto max-w-4xl font-display text-[2.7rem] font-bold leading-[0.98] tracking-[-0.04em] text-balance text-foreground sm:text-6xl lg:text-7xl">
            Find the right care, right now
          </h1>

          {/* Hidden below sm so the chip row clears the fold on a 390x844
              phone. The h1 and the search placeholder already say what this
              site is; on a phone this paragraph restated it for 68px of the
              only screen the visitor can see without scrolling. It returns
              intact from sm up, where the space is not contested. */}
          <p className="mx-auto mt-3 hidden max-w-2xl text-[15px] leading-7 text-muted-foreground sm:block sm:text-base lg:text-lg">
            Discover and connect with trusted private healthcare facilities
            across Addis Ababa.
          </p>

          <div className="mx-auto mt-5 max-w-3xl text-left sm:mt-8">
            <HealthcareSearchBox />
            <p className="mt-2.5 px-1 text-xs leading-5 text-muted-foreground">
              Try &ldquo;ambulance&rdquo;, &ldquo;pediatrics&rdquo; or &ldquo;dialysis&rdquo;
            </p>
          </div>

          <div className="mx-auto mt-4 flex max-w-3xl flex-col gap-2 sm:flex-row sm:justify-center">
            <HeroLocationButton />
            <Link
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-control border border-border px-5 text-sm font-semibold text-primary transition-colors hover:border-strong-border hover:bg-soft-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-none"
              href="/facilities"
            >
              Browse all care
            </Link>
          </div>

          {/* Real count from the rendered dataset, not a hardcoded figure —
              "mapped" is the number with resolvable coordinates, which is what
              actually determines whether a facility can be placed on a map or
              distance-sorted. Set at 14px with the figure itself in foreground
              weight: at 12px in muted grey this read as a caption on the CTA
              above it rather than as a claim about the directory. */}
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-balance text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {mappedFacilityLabel}
            </span>{" "}
            healthcare facilities mapped across Addis Ababa
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
