"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  useFacilitySuggestions,
  type FacilitySuggestion,
} from "./use-facility-suggestions";

type SearchAutocompleteInputProps = {
  autoFocus?: boolean;
  buttonLabel?: string;
  buttonClassName: string;
  buttonText?: string;
  formClassName: string;
  id: string;
  initialQuery?: string;
  isIconButton?: boolean;
  inputClassName: string;
  label: string;
  labelClassName?: string;
  placeholder: string;
};

export function SearchAutocompleteInput({
  autoFocus = false,
  buttonLabel = "Search",
  buttonClassName,
  buttonText = "Search",
  formClassName,
  id,
  initialQuery = "",
  isIconButton = false,
  inputClassName,
  label,
  labelClassName = "mb-2 block text-sm font-semibold text-foreground",
  placeholder,
}: SearchAutocompleteInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const { suggestions } = useFacilitySuggestions(query, {
    includeSpecialists: true,
    includeServices: true,
  });

  useEffect(() => {
    if (!autoFocus) return;
    const input = inputRef.current;
    if (!input) return;
    input.scrollIntoView({ block: "center", behavior: "smooth" });
    input.focus({ preventScroll: true });
  }, [autoFocus]);

  const listboxId = `${id}-suggestions`;
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

  function selectSuggestion(suggestion: FacilitySuggestion) {
    setQuery(suggestion.name);
    setIsOpen(false);
    router.push(suggestion.detailHref);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <form className={formClassName} onSubmit={submitSearch}>
      <div className="relative min-w-0">
        <label className={labelClassName} htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          ref={inputRef}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showSuggestions}
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
          role="combobox"
        />

        {showSuggestions ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-card border border-border bg-card shadow-[0_16px_34px_rgba(31,41,55,0.12)]">
            <ul className="max-h-72 overflow-y-auto py-1" id={listboxId} role="listbox" aria-label={`${label} suggestions`}>
              {suggestions.map((suggestion) => (
                <li key={suggestion.id} role="option" aria-selected="false">
                  <button
                    className="flex w-full min-w-0 flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-muted focus:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span className="flex w-full min-w-0 items-center gap-1.5">
                      <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                        {suggestion.name}
                      </span>
                      {suggestion.resultType === "specialist" ? (
                        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          Specialist
                        </span>
                      ) : null}

        {/* Sighted users see the list appear; this is the equivalent cue
            for screen-reader users, who otherwise get no signal that
            typing produced results. */}
        <span aria-live="polite" className="sr-only" role="status">
          {showSuggestions
            ? `${suggestions.length} ${suggestions.length === 1 ? "suggestion" : "suggestions"} available`
            : ""}
        </span>
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


      <button
        aria-label={isIconButton ? buttonLabel : undefined}
        className={buttonClassName}
        type="submit"
      >
        {isIconButton ? <SearchIcon /> : buttonText}
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}
