"use client";

import { useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/Badge";

const STORAGE_KEY = "tiru-status-banner-dismissed";
const DISMISS_EVENT = "tiru-status-banner-dismiss";

function readIsDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DISMISS_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DISMISS_EVENT, onStoreChange);
  };
}

function getServerSnapshot(): boolean {
  return false;
}

function dismiss() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new Event(DISMISS_EVENT));
  } catch {
    // Dismissal persistence is a convenience; the banner still hides via the event.
  }
}

export function ListingStatusBanner() {
  const isDismissed = useSyncExternalStore(
    subscribe,
    readIsDismissed,
    getServerSnapshot,
  );

  if (isDismissed) {
    return null;
  }

  return (
    <div className="mb-4 flex items-start justify-between gap-4 rounded-card border border-border bg-card px-4 py-3">
      <p className="text-xs leading-5 text-muted-foreground">
        Listings are community sourced — please confirm details with the
        provider. Facilities marked{" "}
        <Badge className="mx-0.5 align-middle" size="sm" variant="info">
          Official
        </Badge>{" "}
        are managed directly by the facility.
      </p>

      <button
        aria-label="Dismiss"
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={dismiss}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  );
}
