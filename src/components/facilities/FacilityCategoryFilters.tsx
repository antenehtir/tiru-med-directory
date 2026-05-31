const facilityCategories = [
  "All facilities",
  "Clinics",
  "Hospitals",
  "Laboratories",
  "Diagnostic centers",
  "Community submitted",
];

export function FacilityCategoryFilters() {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold text-foreground">
        Facility categories
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {facilityCategories.map((category, index) => (
          <button
            key={category}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
              index === 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground"
            }`}
            type="button"
            aria-pressed={index === 0}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}
