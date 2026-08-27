"use client";

import { MapPinIcon } from "@/components/cards/contact-icons";
import { useHomeLocation } from "./HomeLocationProvider";

const SHARED =
  "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control px-5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:flex-none";

// The homepage's ONLY location action. Once permission is granted this stops
// being a request and becomes a jump-link to the results it produced — the
// nearby section has already populated by then, so asking again would be
// exactly the duplicate prompt this restructure removes.
export function HeroLocationButton() {
  const { locationState, requestLocation } = useHomeLocation();

  if (locationState === "ready") {
    return (
      <a
        className={`${SHARED} border border-border bg-card text-foreground hover:border-strong-border hover:bg-muted`}
        href="#nearby-care"
      >
        <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
        View nearby results
      </a>
    );
  }

  const isLoading = locationState === "loading";

  return (
    <button
      className={`${SHARED} border border-border bg-card text-foreground hover:border-strong-border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70`}
      disabled={isLoading}
      onClick={requestLocation}
      type="button"
    >
      <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
      {isLoading ? "Finding your location…" : "Use my location"}
      {/* Politely announced so a screen-reader user learns the outcome of
          pressing this without having to hunt for the section it affects. */}
      <span aria-live="polite" className="sr-only">
        {isLoading ? "Finding your location" : ""}
      </span>
    </button>
  );
}
