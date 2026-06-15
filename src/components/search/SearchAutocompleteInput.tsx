"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { realFacilities } from "@/data/real-facility-profiles";
import {
  getProviderSearchSuggestions,
  type SearchSuggestion,
} from "@/lib/search-suggestions";

type SearchAutocompleteInputProps = {
  autoFocus?: boolean;
  buttonClassName: string;
  formClassName: string;
  id: string;
  initialQuery?: string;
  inputClassName: string;
  label: string;
  placeholder: string;
};

export function SearchAutocompleteInput({
  autoFocus = false,
  buttonClassName,
  formClassName,
  id,
  initialQuery = "",
  inputClassName,
  label,
  placeholder,
}: SearchAutocompleteInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.scrollIntoView({ block: "center", behavior: "smooth" });
    input.focus({ preventScroll: true });
  }, [autoFocus]);

  const suggestions = useMemo(
    () => getProviderSearchSuggestions(realFacilities, query),
    [query],
  );
  const showSuggestions = isOpen && query.trim().length > 0 && suggestions.length > 0;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToSearch(query);
  }

  function navigateToSearch(value: string) {
    const trimmedQuery = value.trim();

    setIsOpen(false);

    if (trimmedQuery.length === 0) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  function selectSuggestion(suggestion: SearchSuggestion) {
    setQuery(suggestion.name);
    setIsOpen(false);

    if (suggestion.detailHref) {
      router.push(suggestion.detailHref);
      return;
    }

    navigateToSearch(suggestion.name);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <form className={formClassName} onSubmit={submitSearch}>
      <div className="relative min-w-0">
        <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          ref={inputRef}
          autoComplete="off"
          className={inputClassName}
          placeholder={placeholder}
          value={query}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {showSuggestions ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_34px_rgba(31,41,55,0.12)]">
            <ul className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    className="flex w-full min-w-0 flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-muted focus:bg-muted"
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span className="w-full truncate text-sm font-semibold text-foreground">
                      {suggestion.name}
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
          </div>
        ) : null}
      </div>

      <button className={buttonClassName} type="submit">
        Search
      </button>
    </form>
  );
}
