import { healthcareCategories } from "./search-options";

export function CategoryChips() {
  return (
    <div aria-label="Healthcare categories">
      <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Search by category
      </p>
      <div className="flex flex-wrap gap-2">
        {healthcareCategories.map((category, index) => (
          <button
            key={category}
            className={`min-h-10 rounded-full border px-3 text-sm font-semibold sm:px-4 ${
              index === 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
            type="button"
            aria-pressed={index === 0}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
