"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Root cause of "recommended facility" navigation loading pre-scrolled on
// mobile (confirmed live): src/components/cards/FacilityCard.tsx already
// uses a plain next/link <Link> with no scroll={false} anywhere, and a real
// click-through test (facility -> facility via the Similar Facilities
// section) confirmed window.scrollY correctly resets to 0 right after the
// Next.js router completes the transition — so the app's own scroll-reset
// logic is not missing or disabled.
//
// The gap is one level up: history.scrollRestoration was never set anywhere
// in this app, leaving it at the browser default "auto". Both facility pages
// render through the SAME dynamic route template (src/app/facilities/[slug]/
// page.tsx, with a loading.tsx boundary in between) — a "auto" scroll
// restoration is documented to independently re-assert a browser-remembered
// scroll offset for a history entry on some mobile browsers for exactly this
// same-route-template transition shape, racing with (and sometimes winning
// against) the framework's own programmatic reset. That race is invisible to
// a window.scrollY check taken immediately after navigation (as confirmed
// here) and doesn't reproduce in headless/emulated Chromium, which is why
// this could only be confirmed on a real mobile device, not in this session's
// available tooling.
//
// Fix: take restoration out of the browser's hands entirely (the standard,
// documented mitigation for this bug class), and re-assert the top-of-page
// position on every route change as a harmless backstop — a no-op on
// browsers where the framework's own reset already worked, a real fix on
// the ones where it didn't.
export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
