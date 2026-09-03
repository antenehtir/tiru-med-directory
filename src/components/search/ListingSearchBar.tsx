"use client";

import { useEffect, useState, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import {
  useFacilitySuggestions,
  type FacilitySuggestion,
} from "./use-facility-suggestions";

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} viewBox="0 0 24 24" {...props}>
      <path d="M4 5h16l-6 7.5V19l-4 2v-8.5z" />
    </svg>
  );
}

// Exported so SearchAutocompleteInput (the homepage hero) can show the same
// loading cue this dropdown already does — the isLoading state
// useFacilitySuggestions returns was previously read here but discarded
// there, so a slow response looked identical to no results yet.
export function Spinner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" className="size-4 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24" {...props}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" fill="currentColor" />
    </svg>
  );
}

type ListingSearchBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  autoFocus?: boolean;
};

export function ListingSearchBar({
  searchValue,
  onSearchChange,
  activeFilterCount,
  onOpenFilters,
  autoFocus = false,
}: ListingSearchBarProps) {
  const router = useRouter();
  const [localQuery, setLocalQuery] = useState(searchValue);
  const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { suggestions, isLoading } = useFacilitySuggestions(localQuery, {
    includeSpecialists: true,
  });

  if (searchValue !== prevSearchValue) {
    setPrevSearchValue(searchValue);
    setLocalQuery(searchValue);
  }

  useEffect(() => {
    if (localQuery === searchValue) return;

    const timeoutId = setTimeout(() => onSearchChange(localQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [localQuery, onSearchChange, searchValue]);

  const hasQuery = localQuery.trim().length >= 2;
  const showResults = isOpen && hasQuery && suggestions.length > 0;
  const showNoResults = isOpen && hasQuery && !isLoading && suggestions.length === 0;
  const showDropdown = showResults || showNoResults;
  const activeSuggestionId = activeIndex >= 0 ? `search-suggestion-${suggestions[activeIndex]?.id}` : undefined;

  function selectSuggestion(suggestion: FacilitySuggestion) {
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(suggestion.detailHref);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown" && showResults) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp" && showResults) {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
      return;
    }

    if (event.key === "Enter") {
      if (showResults && activeIndex >= 0 && suggestions[activeIndex]) {
        event.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
        return;
      }
      onSearchChange(localQuery);
      setIsOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <label className="sr-only" htmlFor="listing-search">Search healthcare providers</label>
        <input
          id="listing-search"
          aria-activedescendant={activeSuggestionId}
          aria-autocomplete="list"
          aria-controls="listing-search-suggestions"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          autoComplete="off"
          autoFocus={autoFocus}
          className="min-h-12 w-full rounded-control border border-border bg-card pl-10 pr-10 text-sm shadow-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            setLocalQuery(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, area, specialty..."
          role="combobox"
          type="text"
          value={localQuery}
        />
        <SearchIcon className="absolute left-3 top-4 size-4 text-muted-foreground" />
        {isLoading ? <span className="absolute right-3 top-4"><Spinner /></span> : null}

        {showDropdown ? (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-card border border-border bg-card shadow-[0_16px_34px_rgba(31,41,55,0.12)]">
            {showResults ? (
              <ul id="listing-search-suggestions" aria-label="Search suggestions" className="max-h-72 overflow-y-auto py-1" role="listbox">
                {suggestions.map((suggestion, index) => (
                  <li key={suggestion.id} id={`search-suggestion-${suggestion.id}`} role="option" aria-selected={index === activeIndex}>
                    <button
                      className={`flex min-h-16 w-full min-w-0 flex-col items-start justify-center gap-1 px-4 py-3 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none ${index === activeIndex ? "bg-muted" : ""}`}
                      onClick={() => selectSuggestion(suggestion)}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      type="button"
                    >
                      <span className="flex w-full min-w-0 items-center gap-1.5">
                        <span className="min-w-0 truncate text-sm font-semibold text-foreground">{suggestion.name}</span>
                        {suggestion.resultType === "specialist" ? (
                          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">Specialist</span>
                        ) : null}
                      </span>
                      {suggestion.metadata ? <span className="w-full truncate text-xs text-muted-foreground">{suggestion.metadata}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground" role="status">
                No results match “{localQuery.trim()}”
              </p>
            )}
          </div>
        ) : null}
      </div>

      <button
        aria-label={activeFilterCount > 0 ? `Open filters, ${activeFilterCount} active` : "Open filters"}
        className={`min-h-12 shrink-0 rounded-control border px-4 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-colors sm:min-w-28 ${activeFilterCount > 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/40"}`}
        onClick={onOpenFilters}
        type="button"
      >
        <FilterIcon className="size-4 shrink-0" />
        Filters
        {activeFilterCount > 0 ? (
          <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{activeFilterCount}</span>
        ) : null}
      </button>
    </div>
  );
}
