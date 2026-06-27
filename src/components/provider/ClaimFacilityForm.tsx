"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { claimExistingFacility, startNewListing } from "@/app/provider/onboarding/claim/actions";

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string | null;
  verification_status: string;
};

export function ClaimFacilityForm({ providerId }: { providerId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    // If a facility is already selected and query matches it, don't re-search
    if (selected && query === selected.name) {
      return;
    }

    if (trimmed.length < 2) {
      setResults([]);
      setShowDropdown(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/provider/search-facilities?q=${encodeURIComponent(trimmed)}`,
        );
        const data = await res.json();
        setResults(data.facilities ?? []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectFacility(facility: SearchResult) {
    setSelected(facility);
    setQuery(facility.name);
    setShowDropdown(false);
  }

  function handleClaim() {
    if (!selected) return;
    startTransition(() => claimExistingFacility(selected.id));
  }

  function handleNewListing() {
    startTransition(() => startNewListing());
  }

  return (
    <div className="space-y-4" data-provider-id={providerId}>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 font-semibold text-foreground">
          Search for your facility
        </p>

        {/* Live search input with dropdown */}
        <div className="relative" ref={containerRef}>
          <input
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
            placeholder="Start typing your facility name..."
            type="text"
            value={query}
          />

          {/* Loading spinner */}
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          )}

          {/* Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
              {results.map((facility) => (
                <button
                  key={facility.id}
                  className="flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted/40"
                  onClick={() => handleSelectFacility(facility)}
                  type="button"
                >
                  <span className="font-medium text-foreground">{facility.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {facility.category}
                    {facility.location ? ` · ${facility.location}` : ""}
                  </span>
                  {facility.verification_status === "facility-owned" && (
                    <span className="mt-0.5 text-xs font-medium text-blue-600">
                      Already claimed
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDropdown &&
            !searching &&
            results.length === 0 &&
            query.trim().length >= 2 && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
                <p className="text-sm text-muted-foreground">
                  No facility found matching &quot;{query}&quot;
                </p>
              </div>
            )}
        </div>

        {/* Selected facility confirmation */}
        {selected && (
          <div className="mt-3 rounded-xl border border-primary bg-primary/5 p-3">
            <p className="text-sm font-medium text-foreground">{selected.name}</p>
            <p className="text-xs text-muted-foreground">
              {selected.category}
              {selected.location ? ` · ${selected.location}` : ""}
            </p>
          </div>
        )}
      </div>

      {/* Claim button — only if a non-claimed facility is selected */}
      {selected && selected.verification_status !== "facility-owned" && (
        <button
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          disabled={isPending}
          onClick={handleClaim}
          type="button"
        >
          {isPending ? "Claiming..." : `Claim "${selected.name}"`}
        </button>
      )}

      {selected && selected.verification_status === "facility-owned" && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          This facility is already claimed by another provider. If this is
          your facility, please contact support.
        </p>
      )}

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
        disabled={isPending}
        onClick={handleNewListing}
        type="button"
      >
        My facility is not listed — add it
      </button>
    </div>
  );
}
