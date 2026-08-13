"use client";

import { useEffect, useState } from "react";

export type FacilitySuggestion = {
  id: string;
  name: string;
  slug: string;
  metadata: string;
  detailHref: string;
  resultType: "facility" | "specialist";
};

type UseFacilitySuggestionsOptions = {
  // Off by default — the provider "claim your facility" search
  // (ClaimFacilityForm.tsx) reuses this same hook and must never surface
  // specialist matches, only general search (homepage hero + /search page)
  // opts in.
  includeSpecialists?: boolean;
};

// Shared live-search logic behind both the homepage hero autocomplete
// (SearchAutocompleteInput) and the Facilities/Search page dropdown
// (ListingSearchBar). Reuses /api/provider/search-facilities — 150ms debounce,
// 2-char minimum, .or() multi-field matching (name/area/sub_city/category) —
// and, when includeSpecialists is set, /api/search/specialists for matching
// doctors (by name, with "Dr." stripped from both sides, or specialty).
export function useFacilitySuggestions(query: string, options: UseFacilitySuggestionsOptions = {}) {
  const { includeSpecialists = false } = options;
  const [suggestions, setSuggestions] = useState<FacilitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timer = setTimeout(() => {
      const requests: Promise<FacilitySuggestion[]>[] = [
        fetch(`/api/provider/search-facilities?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
          .then((r) => r.json())
          .then((json) => {
            const facilities: Record<string, string | null>[] = json.facilities ?? [];
            return facilities.map((f) => ({
              id: f.id ?? "",
              name: f.name ?? "",
              slug: f.slug ?? "",
              metadata: [
                f.category,
                [f.area, f.sub_city].filter(Boolean).join(", "),
              ]
                .filter(Boolean)
                .join(" | "),
              detailHref: `/facilities/${f.slug}`,
              resultType: "facility" as const,
            }));
          }),
      ];

      if (includeSpecialists) {
        requests.push(
          fetch(`/api/search/specialists?q=${encodeURIComponent(trimmed)}`, {
            signal: controller.signal,
          })
            .then((r) => r.json())
            .then((json) => {
              const specialists: Record<string, string>[] = json.specialists ?? [];
              return specialists.map((s) => ({
                id: s.id ?? "",
                name: s.name ?? "",
                slug: s.slug ?? "",
                metadata: s.metadata ?? "",
                detailHref: s.detailHref ?? `/specialists/${s.slug}`,
                resultType: "specialist" as const,
              }));
            }),
        );
      }

      Promise.all(requests)
        .then((results) => {
          setSuggestions(results.flat());
          setIsLoading(false);
        })
        .catch((error: unknown) => {
          // Ignore aborts (a newer keystroke superseded this request); surface
          // real failures by clearing the in-flight state so the spinner stops.
          if ((error as { name?: string })?.name !== "AbortError") {
            setIsLoading(false);
          }
        });
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, includeSpecialists]);

  return { suggestions, isLoading };
}
