export function EmptyStatePreview() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background p-4 text-center sm:p-5">
      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary sm:mb-4 sm:size-12">
        0
      </div>
      <h3 className="text-base font-semibold text-foreground sm:text-lg">
        No matching providers preview
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Future search results can use this empty state to suggest broader
        specialties, nearby facilities, or verified-only adjustments.
      </p>
    </div>
  );
}
