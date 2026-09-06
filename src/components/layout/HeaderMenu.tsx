"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ROLE_OPTIONS, roleIcons } from "@/components/layout/SignInMenu";

// The compact header's overflow menu. Below xl the header used to end in five
// separate controls — Emergency, theme, search, list-your-facility, sign in —
// five taps of equal weight competing in a 44px-tall strip, which reads as a
// toolbar rather than as a header with a point of view.
//
// Emergency and the theme toggle stay out here. Emergency because of what it
// is for: a control you may need to find without reading, which is the one
// case that earns permanent space. The theme toggle because it is a display
// setting people flip while looking at the page, and burying it behind a menu
// means opening the menu to see the effect of the thing you just changed.
//
// The other three fold in here. Search and List-your-facility are both already
// reachable from the bottom tab bar on exactly the widths where this menu
// shows, so out here they were a second copy of a control the visitor already
// has, spending header room to do it.
export function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Same dismissal contract as SignInMenu: pointer outside closes, Escape
  // closes. Listeners are only attached while open.
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex size-10 shrink-0 items-center justify-center rounded-control border border-border/80 bg-card/95 text-foreground shadow-sm transition-all hover:-translate-y-px hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {/* Three bars that become a cross, rather than two swapped icons: the
            same three elements move, so the control reads as one thing in two
            states. The middle bar fades because it has nowhere to go. */}
        <span aria-hidden="true" className="relative block h-4 w-[18px]">
          <span
            className={`absolute left-0 block h-[2px] w-full rounded-full bg-current transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? "top-[7px] rotate-45" : "top-[2px]"
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] block h-[2px] w-full rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 block h-[2px] w-full rounded-full bg-current transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? "top-[7px] -rotate-45" : "top-[12px]"
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          role="menu"
        >
          <div className="py-1">
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              href="/search?focus=1"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <svg
                aria-hidden="true"
                className="size-4 shrink-0 text-primary"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 4 4" />
              </svg>
              Search
            </Link>
            <Link
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              href="/provider/signup"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <svg
                aria-hidden="true"
                className="size-4 shrink-0 text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
              List your facility
            </Link>
          </div>

          <div className="border-t border-border">
            <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sign in as
            </p>
            <div className="py-1">
              {ROLE_OPTIONS.map((role) => {
                const RoleIcon = roleIcons[role.key];

                if (role.disabled) {
                  return (
                    <div
                      className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground/60"
                      key={role.key}
                    >
                      <RoleIcon className="size-4 shrink-0" />
                      <span className="min-w-0 flex-1 font-medium leading-tight">{role.label}</span>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        Soon
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                    href={role.href!}
                    key={role.key}
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                  >
                    <RoleIcon className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-tight">{role.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {role.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
