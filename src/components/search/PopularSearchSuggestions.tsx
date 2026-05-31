import { popularSearchSuggestions } from "./search-options";

export function PopularSearchSuggestions() {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Popular searches
      </p>
      <div className="flex flex-wrap gap-2">
        {popularSearchSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            className="min-h-10 rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground"
            type="button"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
