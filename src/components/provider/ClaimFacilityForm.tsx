"use client";

import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch(
      `/api/provider/search-facilities?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    setResults(data.facilities ?? []);
    setSearching(false);
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
      {/* Search */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 font-semibold text-foreground">
          Search for your facility
        </p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Type facility name..."
            type="text"
            value={query}
          />
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            disabled={searching || !query.trim()}
            onClick={handleSearch}
            type="button"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-3 space-y-2">
            {results.map((facility) => (
              <button
                key={facility.id}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selected?.id === facility.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/40"
                }`}
                onClick={() => setSelected(facility)}
                type="button"
              >
                <p className="font-medium text-foreground">{facility.name}</p>
                <p className="text-xs text-muted-foreground">
                  {facility.category} · {facility.location}
                </p>
                {facility.verification_status === "facility-owned" && (
                  <p className="mt-1 text-xs font-medium text-blue-600">
                    Already claimed
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {results.length === 0 && query && !searching && (
          <p className="mt-3 text-sm text-muted-foreground">
            No results found for &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Actions */}
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
