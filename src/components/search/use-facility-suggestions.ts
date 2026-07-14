"use client";

import { useEffect, useState } from "react";

export type FacilitySuggestion = {
  id: string;
  name: string;
  slug: string;
  metadata: string;
  detailHref: string;
};

// Shared live-search logic behind both the homepage hero autocomplete
// (SearchAutocompleteInput) and the Facilities/Search page dropdown
// (ListingSearchBar). Reuses /api/provider/search-facilities — 150ms debounce,
// 2-char minimum, .or() multi-field matching (name/area/sub_city/category).
export function useFacilitySuggestions(query: string) {
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
      fetch(`/api/provider/search-facilities?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((json) => {
          const facilities: Record<string, string | null>[] = json.facilities ?? [];
          setSuggestions(
            facilities.map((f) => ({
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
            })),
          );
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
  }, [query]);

  return { suggestions, isLoading };
}
