type SearchResultsEmptyStateProps = {
  query?: string;
};

export function SearchResultsEmptyState({
  query = "",
}: SearchResultsEmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-sm font-bold text-muted-foreground">
        0
      </div>
      <h2 className="text-lg font-semibold text-foreground">
        No matching healthcare providers
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {query
          ? `No providers matched "${query}". Try a broader category, location, specialty, or service.`
          : "Search real facility names, areas, services, or categories."}
      </p>
    </section>
  );
}
