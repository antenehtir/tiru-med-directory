import Link from "next/link";
import { DesktopNavigation } from "@/components/navigation/DesktopNavigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-2 px-3 min-[360px]:px-4 sm:gap-3 sm:px-6 lg:min-h-[4.5rem] lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="hidden size-9 shrink-0 rounded-xl border border-border bg-[#ECFEFF] sm:block"
            aria-hidden="true"
          />
          <BrandMark />
        </div>

        <div className="hidden min-w-64 flex-1 items-center rounded-full border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground md:flex lg:max-w-sm">
          <span className="mr-2 size-2 rounded-full bg-[#14B8A6]" />
          Search hospitals, clinics, diagnostics
        </div>

        <DesktopNavigation />

        <ThemeToggle />

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <Link
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted min-[380px]:size-10"
            href="/search"
            aria-label="Search"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </Link>
          <Link
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted min-[380px]:size-10"
            href="/register"
            aria-label="Add provider"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 5v14m-7-7h14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
