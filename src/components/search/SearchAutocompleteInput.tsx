"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type SearchSuggestion = {
  id: string;
  name: string;
  metadata: string;
  detailHref: string;
};

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
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    if (!autoFocus) return;
    const input = inputRef.current;
    if (!input) return;
    input.scrollIntoView({ block: "center", behavior: "smooth" });
    input.focus({ preventScroll: true });
  }, [autoFocus]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
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
              metadata: [
                f.category,
                [f.area, f.sub_city].filter(Boolean).join(", "),
              ]
                .filter(Boolean)
                .join(" | "),
              detailHref: `/facilities/${f.slug}`,
            })),
          );
        })
        .catch(() => {
          // aborted or network error — leave existing suggestions
        });
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

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
