"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="7" rx="1" width="7" x="3" y="3"/>
        <rect height="7" rx="1" width="7" x="14" y="3"/>
        <rect height="7" rx="1" width="7" x="14" y="14"/>
        <rect height="7" rx="1" width="7" x="3" y="14"/>
      </svg>
    ),
  },
  {
    label: "Facilities",
    href: "/admin/facilities",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Listing Requests",
    href: "/admin/listings",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="12" x2="12" y1="18" y2="12"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="9" x2="15" y1="15" y2="15"/>
      </svg>
    ),
  },
  {
    label: "Audit Log",
    href: "/admin/audit-log",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="8" x2="16" y1="13" y2="13"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="8" x2="16" y1="17" y2="17"/>
        <polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-56 flex-col border-r border-border bg-card lg:flex">
      <nav className="flex flex-col gap-1 p-3 pt-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              href={item.href}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <a
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          href="/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
            <line strokeLinecap="round" strokeLinejoin="round" x1="10" x2="21" y1="14" y2="3"/>
          </svg>
          View public directory ↗
        </a>
      </div>
    </aside>
  );
}

const MOBILE_NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="7" rx="1" width="7" x="3" y="3"/>
        <rect height="7" rx="1" width="7" x="14" y="3"/>
        <rect height="7" rx="1" width="7" x="14" y="14"/>
        <rect height="7" rx="1" width="7" x="3" y="14"/>
      </svg>
    ),
  },
  {
    label: "Facilities",
    href: "/admin/facilities",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Listings",
    href: "/admin/listings",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="12" x2="12" y1="18" y2="12"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="9" x2="15" y1="15" y2="15"/>
      </svg>
    ),
  },
  {
    label: "Audit",
    href: "/admin/audit-log",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="8" x2="16" y1="13" y2="13"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="8" x2="16" y1="17" y2="17"/>
        <polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card lg:hidden">
      {MOBILE_NAV.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            href={item.href}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
