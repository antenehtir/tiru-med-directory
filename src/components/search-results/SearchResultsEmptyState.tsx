type SearchResultsEmptyStateProps = {
  query?: string;
};

export function SearchResultsEmptyState({
  query = "",
}: SearchResultsEmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card p-5 text-center shadow-sm">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary">
        0
      </div>
      <h2 className="text-lg font-semibold text-foreground">
        No matching healthcare providers preview
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {query
          ? `No mock providers matched "${query}". Try a broader category, location, specialty, or service.`
          : "Future search can suggest broader categories, nearby facilities, verified-only changes, or popular specialties when no results match."}
      </p>
    </section>
  );
}
