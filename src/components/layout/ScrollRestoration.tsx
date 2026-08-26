"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Resets scroll to the top on every client-side route change — fixes
// "recommended facility" navigation (facility -> facility via the Similar
// Facilities section) loading pre-scrolled on mobile. FacilityCard already
// uses a plain next/link <Link> with no scroll={false}, so this is a genuine
// backstop for cases where the framework's own built-in reset doesn't land
// reliably on some mobile browsers, not a sign that Link is misconfigured.
//
// history.scrollRestoration is deliberately left at the browser default
// "auto" rather than forced to "manual". An earlier version of this file set
// "manual" on the theory that taking restoration out of the browser's hands
// entirely, with this component reasserting position on every route change,
// would be a strictly safer backstop. It wasn't: "manual" disables the
// browser's native scroll handling for every path, but this component only
// ever resets scroll on a pathname change — it has no pageshow/persisted
// listener. On bfcache restoration (event.persisted === true), the entire JS
// heap, including React's fiber tree and its record of which effects already
// ran, is frozen and thawed verbatim — no new render occurs, so neither
// effect below re-fires. With "manual" set, that left bfcache restores with
// nothing managing scroll at all: not the browser (disabled) and not this
// component (never re-invoked). That gap is what caused the homepage to load
// scrolled on mobile after "manual" shipped. Left at "auto", the browser's
// own restoration continues to correctly handle bfcache, tab-resume, and any
// other entry path this component doesn't explicitly know about, while the
// effect below independently handles the one case it was written for.
export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
