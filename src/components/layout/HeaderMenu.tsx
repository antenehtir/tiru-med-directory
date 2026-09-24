"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UserIcon } from "@/components/home/home-icons";
import { headerNavigationItems } from "@/components/navigation/navigation-items";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// The compact header's menu (below xl): the same navigation as the desktop
// bar, with each dropdown's links listed under its heading, then the two
// provider actions and the theme switch. Built from the same
// headerNavigationItems, so the two menus can't drift apart.
export function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pointer outside closes, Escape closes. Listeners only while open.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-home-ink transition-colors hover:bg-home-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {/* Three bars that become a cross: the same three elements move, so
            the control reads as one thing in two states. */}
        <span aria-hidden="true" className="relative block h-4 w-[18px]">
          <span className={`absolute left-0 block h-[2px] w-full rounded-full bg-current transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "top-[7px] rotate-45" : "top-[2px]"}`} />
          <span className={`absolute left-0 top-[7px] block h-[2px] w-full rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${isOpen ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute left-0 block h-[2px] w-full rounded-full bg-current transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "top-[7px] -rotate-45" : "top-[12px]"}`} />
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-40 mt-2 max-h-[calc(100dvh-5.5rem)] w-72 overflow-y-auto rounded-2xl border border-home-line bg-home-surface p-2 shadow-home"
          role="menu"
        >
          <nav aria-label="Menu">
            {headerNavigationItems.map((item) =>
              "href" in item ? (
                <Link
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-home-ink transition-colors hover:bg-home-mint"
                  href={item.href}
                  key={item.label}
                  onClick={close}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              ) : (
                <div className="py-1" key={item.label}>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-home-muted">{item.label}</p>
                  {item.items.map((link) => (
                    <Link
                      className="flex min-h-10 items-center rounded-xl px-3 text-sm text-home-ink transition-colors hover:bg-home-mint"
                      href={link.href}
                      key={link.href}
                      onClick={close}
                      role="menuitem"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ),
            )}
          </nav>

          <div className="mt-2 grid gap-2 border-t border-home-line pt-3">
            <Link
              className="flex min-h-11 items-center justify-center rounded-full bg-home-deep px-4 text-sm font-semibold text-white dark:bg-home-teal-bright dark:text-home-deep"
              href="/provider/signup"
              onClick={close}
              role="menuitem"
            >
              List your facility
            </Link>
            <Link
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-home-line px-4 text-sm font-semibold text-home-ink"
              href="/provider/login"
              onClick={close}
              role="menuitem"
            >
              <UserIcon className="size-4" />
              Sign in
            </Link>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-xl px-3 py-2">
            <span className="text-sm text-home-text">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
