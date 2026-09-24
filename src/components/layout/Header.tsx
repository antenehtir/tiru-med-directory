import Link from "next/link";
import { SearchIcon, UserIcon } from "@/components/home/home-icons";
import { DesktopNavigation } from "@/components/navigation/DesktopNavigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { HeaderMenu } from "@/components/layout/HeaderMenu";

// tiruhealth.com-style header shared by every public page.
//
// xl and up: lockup, primary nav with dropdowns, search, theme, "List your
// facility", "Sign in". Below xl: lockup, search and a menu — the same
// breakpoint the bottom tab bar hides at, so primary navigation is never
// missing at any width.
//
// The xl-only ThemeToggle is hidden with CSS, not unmounted, below xl: the
// toggle is also what applies the stored theme on load, so one instance has
// to stay mounted at every width (the menu's copy only exists while open).
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-home-line bg-home-surface/90 font-body backdrop-blur-xl supports-[backdrop-filter]:bg-home-surface/80">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 xl:min-h-[4.5rem] xl:gap-4 xl:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <BrandMark />
        </div>

        <DesktopNavigation />

        <div className="ml-auto flex items-center gap-1 xl:ml-0 xl:gap-2">
          <Link
            aria-label="Search"
            className="flex size-10 items-center justify-center rounded-full text-home-ink transition-colors hover:bg-home-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal xl:bg-home-mint"
            href="/search?focus=1"
          >
            <SearchIcon className="size-[18px]" />
          </Link>

          <div className="hidden xl:flex">
            <ThemeToggle />
          </div>

          <Link
            className="hidden min-h-10 items-center rounded-full bg-home-deep px-5 text-sm font-semibold text-white transition-colors hover:bg-home-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal focus-visible:ring-offset-2 dark:bg-home-teal-bright dark:text-home-deep dark:hover:bg-home-teal xl:inline-flex"
            href="/provider/signup"
          >
            List your facility
          </Link>
          <Link
            className="hidden min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-home-ink transition-colors hover:bg-home-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal xl:inline-flex"
            href="/provider/login"
          >
            <UserIcon className="size-[18px]" />
            Sign in
          </Link>

          <div className="xl:hidden">
            <HeaderMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
