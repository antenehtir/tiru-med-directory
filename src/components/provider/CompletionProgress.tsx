"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

// The listing's completion percentage, shown in the provider menu and on the
// phone's top bar while a new listing is being filled in.
//
// The server recalculates provider_accounts.completion_pct on every autosave;
// this makes the shell re-read it. Each step calls useRefreshCompletion()'s
// function after a save, and the refresh is debounced so a burst of ticks
// costs one re-read. router.refresh() re-renders the server parts only —
// what the provider has typed on the page is kept.
const RefreshCompletionContext = createContext<() => void>(() => {});

export function CompletionRefreshProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const refresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => router.refresh(), 700);
  }, [router]);

  return <RefreshCompletionContext.Provider value={refresh}>{children}</RefreshCompletionContext.Provider>;
}

export function useRefreshCompletion(): () => void {
  return useContext(RefreshCompletionContext);
}

export function CompletionMeter({ pct, compact = false }: { pct: number; compact?: boolean }) {
  const value = Math.max(0, Math.min(100, Math.round(pct)));
  const message =
    value >= 100
      ? "Everything is filled in"
      : value >= 70
        ? "Almost there"
        : value >= 40
          ? "Good progress"
          : "Just getting started";

  return (
    <div className={compact ? "" : "mt-3"}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">Listing {value}% complete</p>
        {!compact && <p className="text-xs text-muted-foreground">{message}</p>}
      </div>
      <div
        aria-label="Listing completion"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
