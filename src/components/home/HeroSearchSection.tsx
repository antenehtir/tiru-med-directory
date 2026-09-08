import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";
import { CountUpFigure } from "./CountUpFigure";
import { HeroLocationButton } from "./HeroLocationButton";

// Hierarchy is search > location > browse, expressed through surface rather
// than three competing filled buttons: the search box is the only element in
// its own raised surface, location is a bordered control on a card fill with
// a lift shadow, and browse is the same bordered control with neither fill nor
// shadow. Browse used to carry no resting treatment at all — no border, no
// background, no shadow — so on a touch screen it read as a line of text until
// it was already being pressed.
// Below this, the clause is withheld. A trust signal that reads "1 managed by
// their facility" out of 105 does not build confidence, it advertises that
// almost nobody has claimed a listing — the number has to be large enough to
// mean something before it earns a place next to the headline figure. At ten
// it reads as traction rather than as an experiment, and because the count is
// live the clause switches itself on as claiming ramps up, with no copy edit.
const MIN_FACILITY_MANAGED_TO_SHOW = 10;

export function HeroSearchSection({
  mappedFacilityCount,
  facilityManagedCount,
}: {
  mappedFacilityCount: number;
  facilityManagedCount: number;
}) {
  const showManaged = facilityManagedCount >= MIN_FACILITY_MANAGED_TO_SHOW;

  return (
    <section className="tiru-hero-light bg-transparent">
      <span aria-hidden="true" className="tiru-hero-light__glow" />
      <PageContainer className="pb-6 pt-5 sm:pb-10 sm:pt-12 lg:pb-12 lg:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mx-auto max-w-4xl font-display text-[2.7rem] font-bold leading-[0.98] tracking-[-0.04em] text-balance text-foreground sm:text-6xl lg:text-7xl">
            Find the right care.
          </h1>

          {/* Was hidden below sm so "Browse by category" would clear the fold
              on a 390x844 phone — measured then at pushing it past the
              ~734px usable budget (accounting for mobile browser chrome).
              The headline shortening to "Find the right care." (from "...,
              right now") freed enough height that this now clears with
              125px to spare (browseTop 609px), so it's back for every
              width rather than only from sm up. */}
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base lg:text-lg">
            Discover and connect with trusted care across{" "}
            {/* The city name is one proper noun and was splitting across two
                lines at desktop widths, where this line lands just past the
                max-w-2xl measure. Held together rather than reworded. */}
            <span className="whitespace-nowrap">Addis Ababa.</span>
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
              Browse with filters
            </Link>
          </div>

          {/* Real count from the rendered dataset, not a hardcoded figure —
              "mapped" is the number with resolvable coordinates, which is what
              actually determines whether a facility can be placed on a map or
              distance-sorted.

              Exact, no trailing "+". The figure is computed live on every
              render, so it is not an estimate that needs hedging, and "105+"
              read as marketing rounding on a page whose whole promise is that
              the information is real. "across Addis Ababa" is dropped because
              the sentence two lines above already says it.

              The figure carries the brand teal and the display face, which is
              what ties it to the stat band further down the page: those
              figures sit ON --deep, a near-black derived from this same teal,
              so the hero states the directory's scale in the colour the band
              later repeats it in. */}
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-balance text-muted-foreground">
            <CountUpFigure
              className="font-display text-lg font-bold text-primary"
              value={mappedFacilityCount}
            />{" "}
            private healthcare facilities mapped
            {showManaged ? (
              <>
                {" · "}
                {/* Deliberately NOT a second count-up. One authored moment per
                    screen: two numbers racing each other would make the pair
                    feel like a dashboard rather than a single claim, and this
                    one is the qualifier, not the headline. */}
                <span className="font-display text-lg font-bold tabular-nums text-primary">
                  {facilityManagedCount}
                </span>{" "}
                {/* Named for the badge itself, so the hero teaches the marker
                    the visitor is about to meet on every card. */}
                Facility Managed
              </>
            ) : null}
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
