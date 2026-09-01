"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Edge fades that signal "there is more this way", driven by scroll position
// rather than painted on unconditionally — a permanent left fade would dim the
// first chip before the user has scrolled anywhere, which reads as a rendering
// fault rather than as an affordance.
//
// Three things here were arrived at by measurement, not preference:
//
// 1. The fade is a mask, not a gradient overlay in a background colour. The row
//    sits on --sunken today, but a mask needs no colour at all, so it cannot
//    drift out of sync if the section's surface ever changes.
//
// 2. The scroll listener is attached with addEventListener rather than React's
//    onScroll prop. Scroll does not bubble, and React's delegated handler never
//    saw it: scrollLeft reached the end of the track while the mask stayed
//    frozen at its initial value.
//
// 3. Whether the mask exists at all is decided in CSS, not JavaScript. The row
//    only scrolls below sm; from sm it wraps and there is nothing to fade. That
//    condition was originally derived by comparing scrollWidth to clientWidth,
//    and it was unreliable in exactly the way transient layout reads are:
//    resizing across the breakpoint fired the observer mid-transition and
//    latched a stale answer with no later trigger to correct it. Settling one
//    frame left the right fade off with 1769px still to scroll; settling a
//    frame earlier left it on with nothing to scroll. The breakpoint is a fact
//    CSS already knows, so sm:[mask-image:none] states it directly and cannot
//    disagree with the layout. JavaScript keeps only the question CSS cannot
//    answer: which end of the track the user is at right now.
export function ChipScroller({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const scrollable = el.scrollWidth - el.clientWidth;
    // 1px of slack: fractional scroll offsets never land exactly on the bound.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(scrollable <= 1 || el.scrollLeft >= scrollable - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  return (
    <ul
      aria-label={ariaLabel}
      className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-3 pb-2 [mask-image:linear-gradient(to_right,transparent_0,#000_var(--chip-fade-start),#000_calc(100%-var(--chip-fade-end)),transparent_100%)] min-[360px]:-mx-4 min-[360px]:px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
      ref={ref}
      style={
        {
          "--chip-fade-start": atStart ? "0px" : "28px",
          "--chip-fade-end": atEnd ? "0px" : "28px",
        } as CSSProperties
      }
    >
      {children}
    </ul>
  );
}
