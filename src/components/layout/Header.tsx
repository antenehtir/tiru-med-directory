import Link from "next/link";
import { DesktopNavigation } from "@/components/navigation/DesktopNavigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SignInMenu } from "@/components/layout/SignInMenu";
import { EmergencyLink } from "@/components/layout/EmergencyLink";

const actionClassName =
  "flex size-10 shrink-0 items-center justify-center rounded-control border border-border/80 bg-card/95 text-foreground shadow-sm transition-all hover:-translate-y-px hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 shadow-[0_1px_10px_rgba(28,25,23,0.035)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-2 px-3 min-[360px]:px-4 sm:gap-3 sm:px-6 xl:min-h-[4.25rem] xl:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <BrandMark />
        </div>

        {/* Full desktop identity: primary nav, "Sign in", a labelled Emergency
            link, a labelled "List your facility" button, and the theme
            toggle, all switched on together. This used to switch on at lg
            (1024px) and overflowed twice as items were added there, because
            that is six independent pieces of content turning on at once with
            no margin behind them — see EmergencyLink and the header-overflow
            fix history. Moved the whole tier to xl (1280px), where it has
            room to spare rather than just barely fitting. */}
        <DesktopNavigation />

        {/* SignInMenu's own root div carries no responsive class — only the
            button inside it does — so without this wrapper it stays a real,
            zero-width flex item below xl and still costs a full `gap` unit
            on both sides at every one of those widths, for nothing visible.
            Wrapping it the same way EmergencyLink and ThemeToggle already
            are removes it from the flex flow entirely below xl instead. */}
        <div className="hidden xl:flex">
          <SignInMenu />
        </div>

        <div className="ml-2 hidden xl:flex">
          <EmergencyLink />
        </div>

        <Link
          className="ml-2 hidden min-h-9 items-center rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 xl:inline-flex"
          href="/provider/signup"
        >
          List your facility
        </Link>

        <div className="hidden xl:flex">
          <ThemeToggle />
        </div>

        {/* Below xl: a compact row, not a "just barely fitting" desktop row.
            Emergency and List-your-facility are the two items that stay
            genuine CTAs at every width — Emergency because of what it's for,
            List-your-facility because it's the site's one conversion action
            for providers — so both keep a labelled state, just later than
            their desktop position: Emergency's own sm:inline label already
            covers 640px+, and List-your-facility gains the same treatment at
            lg (1024px), which is exactly the range this tier now spans
            without full nav+Sign in+theme toggle competing for the space.
            Sign in, the primary nav (already duplicated by the bottom tab
            bar below xl) and the theme toggle are the items that fold away
            here — Sign in and theme toggle to icon-only, nav to nothing,
            since the bottom bar already serves it. */}
        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2 xl:hidden">
          <EmergencyLink />
          <ThemeToggle />
          <Link className={actionClassName} href="/search?focus=1" aria-label="Search">
            {/* Same circle+handle construction as SearchAutocompleteInput's and
                EmptyState's SearchIcon. The previous single fused <path> tried
                to draw the lens with one elliptical-arc command whose endpoint
                sat exactly opposite its start — that only sweeps a 180° arc,
                so the lens rendered as a half-circle (bounding box 16x9.5
                instead of the ~13x13 a full r=6.5 circle needs), closed with a
                straight chord — the "clipped" look. */}
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 4 4" />
            </svg>
          </Link>
          <Link
            aria-label="List your facility"
            className="inline-flex size-10 shrink-0 items-center justify-center gap-1.5 rounded-control bg-primary px-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0 lg:w-auto"
            href="/provider/signup"
          >
            <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <span className="hidden lg:inline">List your facility</span>
          </Link>
          <SignInMenu compact />
        </div>
      </div>
    </header>
  );
}
