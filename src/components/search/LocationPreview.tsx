export function LocationPreview() {
  return (
    <div className="rounded-lg border border-border bg-muted p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        Location preview
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-semibold text-foreground">Addis Ababa, Ethiopia</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Location is shown as a preview only. No geolocation logic is active.
          </p>
        </div>
        <button
          className="min-h-11 rounded-md border border-border bg-card px-4 text-sm font-semibold text-primary"
          type="button"
        >
          Change
        </button>
      </div>
    </div>
  );
}
