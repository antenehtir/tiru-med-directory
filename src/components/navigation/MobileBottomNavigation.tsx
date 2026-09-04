"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, SVGProps } from "react";
import { mobileNavigationItems, ROUTES } from "./navigation-items";

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

function NavIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

const navIcons: Record<string, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  [ROUTES.home]: (props) => (
    <NavIcon {...props}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </NavIcon>
  ),
  [ROUTES.search]: (props) => (
    <NavIcon {...props}>
      <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </NavIcon>
  ),
  [ROUTES.nearby]: (props) => (
    <NavIcon {...props}>
      <path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 0114 0C19 13.5 12 21 12 21z" />
      <circle cx="12" cy="8.5" r="2.5" />
    </NavIcon>
  ),
  [ROUTES.specialists]: (props) => (
    <NavIcon {...props}>
      <path d="M6 3v6a6 6 0 006 6 6 6 0 006-6V3" />
      <path d="M6 3H4M18 3h2M18 15a4 4 0 01-4 4H10" />
      <circle cx="18" cy="19" r="2" />
    </NavIcon>
  ),
  [ROUTES.facilities]: (props) => (
    <NavIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </NavIcon>
  ),
};

// Hides at xl (1280px), matching Header's own collapse point — not the more
// obvious md (768px) — because the header drops its full primary-nav row to
// a compact utility strip below xl and relies on this bar to cover Home /
// Search / Nearby / Facilities / Specialists in that entire range. Moving
// this independently of the header would reopen a 768-1279px dead zone
// where neither one shows primary navigation. PageShell's `xl:pb-0` on
// <main> has to move with this — it is the clearance padding that stops
// this fixed bar from covering the last 80px of page content.
export function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden"
      aria-label="Primary mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-0.5">
        {mobileNavigationItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          const Icon = navIcons[item.href];

          return (
            <Link
              key={item.href}
              className="flex min-h-16 touch-manipulation flex-col items-center justify-center rounded-xl px-1 py-1 outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              prefetch={true}
            >
              <span
                className={`mb-1 h-[3px] w-5 rounded-full ${
                  isActive ? "bg-primary" : "bg-transparent"
                }`}
              />
              <span
                className={`flex min-w-12 flex-col items-center gap-1 rounded-xl px-2 py-1 transition-colors ${
                  isActive ? "bg-primary/8 text-primary" : "text-muted-foreground"
                }`}
              >
                {Icon ? <Icon /> : null}
                <span
                  className={`max-w-full truncate text-[11px] ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.shortLabel}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
