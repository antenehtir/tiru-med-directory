import Link from "next/link";
import { DesktopNavigation } from "@/components/navigation/DesktopNavigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SignInMenu } from "@/components/layout/SignInMenu";
import { EmergencyLink } from "@/components/layout/EmergencyLink";
import { HeaderMenu } from "@/components/layout/HeaderMenu";

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

        {/* Below xl: two controls and a menu, not a five-icon toolbar.
            Emergency and the theme toggle stay visible — one because it is
            the control you may need to find without reading, the other
            because burying a display setting means opening a menu to see
            what you just changed. Search, List-your-facility and Sign in
            fold into HeaderMenu; the first two already sit in the bottom tab
            bar at exactly these widths, so out here they were a second copy
            of a control the visitor already had. Emergency keeps its own
            sm:inline label, so this tier still reads as Emergency first. */}
        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2 xl:hidden">
          <EmergencyLink />
          <ThemeToggle />
          <HeaderMenu />
        </div>
      </div>
    </header>
  );
}
