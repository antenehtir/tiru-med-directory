import Link from "next/link";
import { DesktopNavigation } from "@/components/navigation/DesktopNavigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SignInMenu } from "@/components/layout/SignInMenu";

const actionClassName =
  "flex size-10 shrink-0 items-center justify-center rounded-control border border-border/80 bg-card/95 text-foreground shadow-sm transition-all hover:-translate-y-px hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 shadow-[0_1px_10px_rgba(28,25,23,0.035)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-2 px-3 min-[360px]:px-4 sm:gap-3 sm:px-6 lg:min-h-[4.25rem] lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center">
          <BrandMark />
        </div>

        <DesktopNavigation />

        <SignInMenu />

        <Link
          className="ml-2 hidden min-h-9 items-center rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 lg:inline-flex"
          href="/provider/signup"
        >
          List your facility
        </Link>

        <div className="hidden lg:flex">
          <ThemeToggle />
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <ThemeToggle />
          <Link className={actionClassName} href="/search?focus=1" aria-label="Search">
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
              <path d="m20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0Z" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </Link>
          <Link className={actionClassName} href="/provider/signup" aria-label="List your facility">
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </Link>
          <SignInMenu compact />
        </div>
      </div>
    </header>
  );
}
