import Link from "next/link";
import { mainNavigationItems } from "./navigation-items";

export function DesktopNavigation() {
  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
      {mainNavigationItems.map((item) => (
        <Link
          key={item.href}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
