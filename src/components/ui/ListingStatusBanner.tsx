"use client";

import { useSyncExternalStore } from "react";
import { VerificationBadge } from "@/components/trust/VerificationBadge";

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
    <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <VerificationBadge status="community-submitted" />
          <span className="text-xs text-muted-foreground">
            Community sourced — verify with provider
          </span>
        </div>
        <div className="flex items-center gap-2">
          <VerificationBadge status="facility-owned" />
          <span className="text-xs text-muted-foreground">
            Official — managed directly by the facility
          </span>
        </div>
      </div>

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
