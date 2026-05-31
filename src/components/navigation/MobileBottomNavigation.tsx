import Link from "next/link";
import { mobileNavigationItems } from "./navigation-items";

export function MobileBottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
      aria-label="Mobile primary"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {mobileNavigationItems.map((item) => (
          <Link
            key={item.href}
            className="flex min-h-16 flex-col items-center justify-center rounded-md px-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            href={item.href}
          >
            <span
              className="mb-1 flex size-5 items-center justify-center rounded bg-muted text-[10px] font-bold text-primary"
              aria-hidden="true"
            >
              {item.label.charAt(0)}
            </span>
            <span className="max-w-full truncate">{item.shortLabel}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
