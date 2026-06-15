"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNavigationItems } from "./navigation-items";

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
      {mainNavigationItems.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            className={`rounded-full px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground xl:px-3 ${
              isActive ? "bg-soft-accent text-primary" : "text-muted-foreground"
            }`}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
