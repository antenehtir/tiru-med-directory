"use client";

import { useEffect, useRef, useState, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import {
  useFacilitySuggestions,
  type FacilitySuggestion,
} from "./use-facility-suggestions";

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M4 5h16l-6 7.5V19l-4 2v-8.5z" />
    </svg>
  );
}

function Spinner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 animate-spin text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
        fill="currentColor"
      />
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

  // Live dropdown suggestions (150ms debounce) — independent of the 300ms grid
  // filter below, so the dropdown feels instant while the grid updates calmly.
  const { suggestions, isLoading } = useFacilitySuggestions(localQuery, {
    includeSpecialists: true,
  });

  if (searchValue !== prevSearchValue) {
    setPrevSearchValue(searchValue);
    setLocalQuery(searchValue);
  }

  // Debounce the typed query into the grid filter (unchanged behavior).
  useEffect(() => {
    if (localQuery === searchValue) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localQuery, onSearchChange, searchValue]);

  const hasQuery = localQuery.trim().length >= 2;
  const showResults = isOpen && hasQuery && suggestions.length > 0;
  const showNoResults =
    isOpen && hasQuery && !isLoading && suggestions.length === 0;
  const showDropdown = showResults || showNoResults;

  function selectSuggestion(suggestion: FacilitySuggestion) {
    setIsOpen(false);
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
      // No highlighted suggestion — commit the typed query to the grid filter.
      onSearchChange(localQuery);
      setIsOpen(false);
    }
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          autoComplete="off"
          autoFocus={autoFocus}
          className="min-h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            setLocalQuery(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, area, specialty..."
          type="text"
          value={localQuery}
        />
        <SearchIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
        {isLoading ? (
          <span className="absolute right-3 top-3">
            <Spinner />
          </span>
        ) : null}

        {showDropdown ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_34px_rgba(31,41,55,0.12)]">
            {showResults ? (
              <ul className="max-h-72 overflow-y-auto py-1">
                {suggestions.map((suggestion, index) => (
                  <li key={suggestion.id}>
                    <button
                      className={`flex w-full min-w-0 flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-muted ${
                        index === activeIndex ? "bg-muted" : ""
                      }`}
                      onClick={() => selectSuggestion(suggestion)}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      type="button"
                    >
                      <span className="flex w-full min-w-0 items-center gap-1.5">
                        <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                          {suggestion.name}
                        </span>
                        {suggestion.resultType === "specialist" ? (
                          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Specialist
                          </span>
                        ) : null}
                      </span>
                      {suggestion.metadata ? (
                        <span className="w-full truncate text-xs text-muted-foreground">
                          {suggestion.metadata}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No results match &ldquo;{localQuery.trim()}&rdquo;
              </p>
            )}
          </div>
        ) : null}
      </div>
      <button
        className={`min-h-11 shrink-0 rounded-xl border px-4 flex items-center gap-2 text-sm font-medium transition-colors ${
          activeFilterCount > 0
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-foreground hover:border-primary/40"
        }`}
        onClick={onOpenFilters}
        type="button"
      >
        <FilterIcon className="size-4 shrink-0" />
        Filters
        {activeFilterCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
