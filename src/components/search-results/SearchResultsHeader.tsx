export function SearchResultsHeader() {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 inline-flex rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground">
        Search results
      </p>
      <h1 className="text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl">
        Find trusted healthcare providers faster.
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        Review healthcare providers by category, location, specialty, and
        service information.
      </p>
    </div>
  );
}
