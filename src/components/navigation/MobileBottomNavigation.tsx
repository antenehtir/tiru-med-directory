"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, SVGProps } from "react";
import { mobileNavigationItems } from "./navigation-items";

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
  "/": (props) => (
    <NavIcon {...props}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </NavIcon>
  ),
  "/search": (props) => (
    <NavIcon {...props}>
      <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </NavIcon>
  ),
  "/nearby": (props) => (
    <NavIcon {...props}>
      <path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 0114 0C19 13.5 12 21 12 21z" />
      <circle cx="12" cy="8.5" r="2.5" />
    </NavIcon>
  ),
  "/doctors": (props) => (
    <NavIcon {...props}>
      <path d="M6 3v6a6 6 0 006 6 6 6 0 006-6V3" />
      <path d="M6 3H4M18 3h2M18 15a4 4 0 01-4 4H10" />
      <circle cx="18" cy="19" r="2" />
    </NavIcon>
  ),
  "/facilities": (props) => (
    <NavIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </NavIcon>
  ),
};

export function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
      aria-label="Mobile primary"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {mobileNavigationItems.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          const Icon = navIcons[item.href];

          return (
            <Link
              key={item.href}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
            >
              {Icon ? <Icon /> : null}
              <span className="max-w-full truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
