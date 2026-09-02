"use client";

import { useEffect, useRef } from "react";
import { MapPinIcon } from "@/components/cards/contact-icons";
import { useHomeLocation } from "./HomeLocationProvider";

const SHARED =
  "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none";

// One action, one outcome: press it and you end up looking at nearby results.
//
// It used to become a second button — "View nearby results" — once permission
// was granted, which handed the visitor a second decision as the reward for
// making the first one. Now the grant itself carries them to the results, and
// pressing it again when location is already known scrolls straight there
// without re-requesting anything.
export function HeroLocationButton() {
  const { locationState, requestLocation } = useHomeLocation();
  const pendingScrollRef = useRef(false);

  const scrollToResults = () => {
    const target = document.getElementById("nearby-care");
    if (!target) return;
    // Honour reduced motion: someone who has asked the system to stop animating
    // should be moved to the results, not glided there.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  // Only scrolls for a grant this button asked for. Without the ref, a page
  // that already had permission would yank the visitor down the page on load.
  //
  // Scrolls straight from the effect rather than deferring to
  // requestAnimationFrame. The effect already runs after the DOM is committed,
  // so the target is present and laid out — and rAF does not fire at all while
  // a tab is hidden, which would silently swallow the scroll for anyone who
  // granted permission in a background tab and then switched back.
  useEffect(() => {
    if (locationState !== "ready" || !pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    scrollToResults();
  }, [locationState]);

  const isLoading = locationState === "loading";
  const isReady = locationState === "ready";

  return (
    <button
      className={SHARED}
      disabled={isLoading}
      onClick={() => {
        if (isReady) {
          scrollToResults();
          return;
        }
        pendingScrollRef.current = true;
        requestLocation();
      }}
      type="button"
    >
      <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
      {isLoading ? "Finding you…" : "Find near me"}
      <span aria-live="polite" className="sr-only">
        {isLoading ? "Finding you" : isReady ? "Nearby results ready" : ""}
      </span>
    </button>
  );
}
