import Link from "next/link";
import { MapPinIcon } from "@/components/cards/contact-icons";

// Goes to /nearby rather than filling a section on the homepage.
//
// The homepage version cost a step and never left "/": results appeared
// below the fold, so the visitor was on the homepage looking at nearby
// results while the Home tab in the bottom navigation showed as the current
// page. Tapping Home then did nothing, because it already was Home — a dead
// control at the exact moment someone wanted to get back out.
//
// /nearby already owns this job properly: it has the Facilities/Specialists
// toggle, the full filter set, and it requests location on arrival — every
// arrival, not only this one — which is the right moment to ask. Nothing on
// the homepage touches geolocation any more.
export function HeroLocationButton() {
  return (
    <Link
      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:flex-none"
      href="/nearby"
    >
      <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
      Find near me
    </Link>
  );
}
