export function DiagnosticsHero() {
  return (
    <header className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_30px_rgba(17,24,39,0.035)] sm:p-6 lg:p-8">
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex rounded-full border border-border bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
          Diagnostics discovery
        </p>
        <h1 className="text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl">
          Find laboratories and imaging services.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Browse diagnostic centers for laboratory and imaging services with
          provider information reviewed before publication.
        </p>
      </div>
    </header>
  );
}
