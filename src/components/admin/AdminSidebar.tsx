"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
    label: "Provider Submissions",
    href: "/admin/claims",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3-1-3-3-3-3 2-3 3-2-1-3-1-3 1-3 3 2 3 3 3-2 1-3 3 1 3 3 3 3-2 3-3 2 1 3 1z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Corrections",
    href: "/admin/corrections",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeLinecap="round" strokeLinejoin="round"/>
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
  {
    label: "Admin Users",
    href: "/admin/users",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function AdminSidebar({
  pendingCorrectionsCount = 0,
}: {
  pendingCorrectionsCount?: number;
}) {
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
              {item.href === "/admin/corrections" && pendingCorrectionsCount > 0 && (
                <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                  {pendingCorrectionsCount}
                </span>
              )}
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
    label: "Claims",
    href: "/admin/claims",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3-1-3-3-3-3 2-3 3-2-1-3-1-3 1-3 3 2 3 3 3-2 1-3 3 1 3 3 3 3-2 3-3 2 1 3 1z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Corrections",
    href: "/admin/corrections",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

// Everything the bottom bar has no room for. Audit Log and Admin Users were
// simply absent on mobile before this — the sidebar that holds them is
// lg:flex, so on a phone there was no route to either one, and Corrections
// was unreachable too despite being the page that carries a pending count.
const MOBILE_MORE_ITEMS = [
  {
    label: "Audit Log",
    href: "/admin/audit-log",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="8" x2="16" y1="13" y2="13"/>
        <line strokeLinecap="round" strokeLinejoin="round" x1="8" x2="16" y1="17" y2="17"/>
      </svg>
    ),
  },
  {
    label: "Admin Users",
    href: "/admin/users",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function AdminBottomNav({
  pendingCorrectionsCount = 0,
}: {
  pendingCorrectionsCount?: number;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Every control that navigates closes the sheet itself, rather than an
  // effect watching the pathname: the effect version fired a setState on
  // every route change in the whole admin area to handle the one case where
  // the sheet happened to be open.
  const moreIsActive = MOBILE_MORE_ITEMS.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {moreOpen && (
        <>
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setMoreOpen(false)}
            type="button"
          />
          <div className="fixed bottom-16 left-2 right-2 z-40 overflow-hidden rounded-2xl border border-border bg-card shadow-lg lg:hidden">
            {MOBILE_MORE_ITEMS.map((item) => (
              <Link
                className={`flex items-center gap-3 border-b border-border px-4 py-3 text-sm font-medium last:border-b-0 ${
                  pathname.startsWith(item.href) ? "text-primary" : "text-foreground"
                }`}
                href={item.href}
                key={item.href}
                onClick={() => setMoreOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <Link
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground"
              href="/"
              onClick={() => setMoreOpen(false)}
            >
              View public directory ↗
            </Link>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card lg:hidden">
        {MOBILE_NAV.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const showCount =
            item.href === "/admin/corrections" && pendingCorrectionsCount > 0;

          return (
            <Link
              key={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              href={item.href}
              onClick={() => setMoreOpen(false)}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <span
                className={`relative flex items-center justify-center rounded-xl px-3 py-1 transition-colors ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                {item.icon}
                {/* The pending count reached only the desktop sidebar, so the
                    one page with time-sensitive work showed no sign of it on
                    the device an admin is most likely holding. */}
                {showCount && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {pendingCorrectionsCount > 9 ? "9+" : pendingCorrectionsCount}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}

        <button
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
            moreIsActive || moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setMoreOpen((open) => !open)}
          type="button"
        >
          {moreIsActive && (
            <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
          )}
          <span
            className={`flex items-center justify-center rounded-xl px-3 py-1 transition-colors ${
              moreIsActive || moreOpen ? "bg-primary/10" : ""
            }`}
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
          </span>
          More
        </button>
      </nav>
    </>
  );
}
