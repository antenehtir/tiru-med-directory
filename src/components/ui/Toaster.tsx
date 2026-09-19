"use client";

import { useEffect, useRef, useState } from "react";

// A short confirmation that appears over the page after an action — "Saved",
// or what went wrong — wherever the person has scrolled to. Section editors
// used to confirm a save only with a small "Saved 1:28 PM" beside the
// section's title, out of sight at the top of a long form, so a save looked
// like nothing had happened.
//
// Call showToast() from anywhere on the client; the one <Toaster /> in the
// root layout shows it.

type ToastTone = "success" | "info" | "error";
type ToastDetail = { message: string; tone: ToastTone };

const EVENT = "tiru:toast";

export function showToast(message: string, tone: ToastTone = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastDetail>(EVENT, { detail: { message, tone } }));
}

const VISIBLE_MS = { success: 3500, info: 3500, error: 6000 };

export function Toaster() {
  const [toast, setToast] = useState<(ToastDetail & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (timer.current) clearTimeout(timer.current);
      setToast({ ...detail, id: Date.now() });
      timer.current = setTimeout(() => setToast(null), VISIBLE_MS[detail.tone]);
    }
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    // Always present (empty when idle) so screen readers hear each message.
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:bottom-8"
      role="status"
    >
      {toast && (
        <div
          className={`pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold shadow-lg motion-safe:animate-[toast-in_180ms_ease-out] ${
            toast.tone === "success"
              ? "bg-foreground text-background"
              : toast.tone === "info"
                ? "border border-border bg-card text-foreground"
                : "bg-[var(--error)] text-white"
          }`}
          key={toast.id}
        >
          <span aria-hidden="true">{toast.tone === "success" ? "✓" : toast.tone === "info" ? "i" : "!"}</span>
          <span>{toast.message}</span>
          <button
            aria-label="Dismiss"
            className="-mr-2 ml-1 flex size-7 items-center justify-center rounded-full opacity-70 hover:opacity-100"
            onClick={() => setToast(null)}
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
