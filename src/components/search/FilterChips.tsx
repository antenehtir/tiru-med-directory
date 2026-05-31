import { healthcareFilters } from "./search-options";

export function FilterChips() {
  return (
    <div aria-label="Search filters">
      <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Helpful filters
      </p>
      <div className="flex flex-wrap gap-2">
        {healthcareFilters.map((filter) => (
          <button
            key={filter}
            className="min-h-10 rounded-full border border-border bg-muted px-3 text-sm font-semibold text-foreground sm:px-4"
            type="button"
            aria-pressed="false"
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
