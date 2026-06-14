import Link from "next/link";
import { DesktopNavigation } from "@/components/navigation/DesktopNavigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:min-h-[4.5rem] lg:px-8">
        <BrandMark />

        <div className="hidden min-w-64 flex-1 items-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground md:flex lg:max-w-sm">
          Search doctors, facilities, pharmacies
        </div>

        <DesktopNavigation />

        <ThemeToggle />

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link
            className="flex h-10 items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground"
            href="/search"
            aria-label="Open search"
          >
            Search
          </Link>
          <Link
            className="flex size-10 items-center justify-center rounded-lg bg-primary text-xl font-semibold text-primary-foreground"
            href="/register"
            aria-label="Open register"
          >
            <span aria-hidden="true">+</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
