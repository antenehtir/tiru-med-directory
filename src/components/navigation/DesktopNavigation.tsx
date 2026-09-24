"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/home/home-icons";
import { headerNavigationItems, type HeaderNavLink } from "./navigation-items";

function isActiveRoute(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

const linkBase =
  "relative inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal";

// Current page gets a short underline in the brand teal, as in the mockup,
// rather than a filled pill.
function ActiveBar({ active }: { active: boolean }) {
  return active ? <span aria-hidden="true" className="absolute inset-x-3 -bottom-[0.55rem] h-0.5 rounded-full bg-home-teal dark:bg-home-teal-bright" /> : null;
}

export function DesktopNavigation() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close on outside press and Escape; choosing a link closes it via onNavigate.
  useEffect(() => {
    if (!openMenu) return;
    function onPointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  return (
    <nav aria-label="Primary" className="mx-auto hidden items-center gap-0.5 xl:flex" ref={navRef}>
      {headerNavigationItems.map((item) => {
        if ("href" in item) {
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`${linkBase} ${active ? "text-home-ink" : "text-home-text hover:text-home-ink"}`}
              href={item.href}
              key={item.label}
            >
              {item.label}
              <ActiveBar active={active} />
            </Link>
          );
        }

        const active = item.match.some((prefix) => pathname.startsWith(prefix));
        const isOpen = openMenu === item.label;
        const menuId = `nav-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          <div className="relative" key={item.label}>
            <button
              aria-controls={menuId}
              aria-expanded={isOpen}
              className={`${linkBase} ${active || isOpen ? "text-home-ink" : "text-home-text hover:text-home-ink"}`}
              onClick={() => setOpenMenu(isOpen ? null : item.label)}
              type="button"
            >
              {item.label}
              <ChevronDownIcon className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              <ActiveBar active={active} />
            </button>
            {isOpen ? <DropdownPanel id={menuId} links={item.items} onNavigate={() => setOpenMenu(null)} /> : null}
          </div>
        );
      })}
    </nav>
  );
}

function DropdownPanel({ id, links, onNavigate }: { id: string; links: HeaderNavLink[]; onNavigate: () => void }) {
  return (
    <div className="absolute left-1/2 top-full z-40 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-home-line bg-home-surface p-1.5 shadow-home" id={id}>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-home-mint focus-visible:bg-home-mint focus-visible:outline-none"
              href={link.href}
              onClick={onNavigate}
            >
              <span className="block text-sm font-semibold text-home-ink">{link.label}</span>
              {link.description ? <span className="mt-0.5 block text-xs text-home-muted">{link.description}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
