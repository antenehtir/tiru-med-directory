type PharmacySearchPreviewProps = {
  query?: string;
};

export function PharmacySearchPreview({
  query = "",
}: PharmacySearchPreviewProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-normal text-primary">
        Pharmacy search preview
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Search shape for future pharmacy discovery.
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Static preview only. No medication search, inventory lookup, or
        prescription upload is active.
      </p>

      <div className="mt-5 grid gap-3 rounded-md border border-border bg-background p-4">
        <div className="rounded-md border border-border bg-input px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm">
          {query || "Search pharmacy name, area, or medicine category"}
        </div>
        <div className="rounded-md bg-muted px-4 py-3 text-sm font-semibold text-primary">
          Location preview: Addis Ababa
        </div>
      </div>
    </section>
  );
}
