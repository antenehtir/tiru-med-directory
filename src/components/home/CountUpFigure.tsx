"use client";

import { useEffect, useState } from "react";

// 1100ms: long enough that the digits are visibly counting rather than
// flickering, short enough that the number is settled before a reader who
// came to search has finished reaching for the box above it.
const DURATION_MS = 1100;

// Decelerating. A linear count reads like a loading spinner; easing out lands
// the number the way a tally comes to rest.
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// The one number on the homepage that states the directory's scale, so it is
// the one place a moment of motion is earned — it draws the eye to the claim
// instead of decorating a section that was already read.
//
// The starting value is decided in the initialiser, not in an effect, and it
// differs by environment on purpose:
//
//   server        -> value   so the HTML a crawler or a JavaScript-less
//                            visitor receives says 105, never 0
//   reduced motion -> value  no animation was asked for, so none happens
//   otherwise      -> 0      the client's FIRST paint is already 0
//
// That last line is the whole point. An earlier version started at `value` and
// let the first animation frame reset it to 0, which was measured actually
// doing it: the rendered figure went 105 -> 0 -> 105, a visible reset that
// reads as a glitch on a slow first frame. Beginning the client render at 0
// means 105 is never painted before the count, and the number only ever moves
// upward.
//
// The deliberate server/client difference is a hydration mismatch by design,
// hence suppressHydrationWarning on the one span it affects. That span is
// aria-hidden with the settled figure in an sr-only sibling, so nothing
// assistive ever hears the intermediate numbers.
export function CountUpFigure({ value, className = "" }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(() => {
    if (typeof window === "undefined") return value;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return value;
    return 0;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let startedAt = 0;

    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / DURATION_MS);
      setDisplay(Math.round(easeOutCubic(progress) * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    // tabular-nums so the digits do not jitter the line width while counting,
    // and aria-hidden on the animating text with the settled figure alongside:
    // a screen reader should hear "105", not a stream of intermediate numbers.
    <>
      <span aria-hidden="true" className={`tabular-nums ${className}`} suppressHydrationWarning>
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
