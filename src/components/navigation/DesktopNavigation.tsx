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
    <nav className="ml-auto hidden items-center gap-0.5 xl:flex" aria-label="Primary">
      {mainNavigationItems.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
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
