const trustPoints = [
  "Verified facilities use clear badges.",
  "Open status and working hours stay visible.",
  "Actions are preview-only until detail pages and workflows are added.",
];

export function FacilityTrustBlock() {
  return (
    <section className="rounded-lg border border-border bg-muted p-5">
      <p className="text-sm font-semibold uppercase tracking-normal text-secondary">
        Trust first
      </p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">
        Facility listings should make trust easy to scan.
      </h2>
      <div className="mt-4 grid gap-3">
        {trustPoints.map((point) => (
          <div key={point} className="flex gap-3">
            <span className="mt-2 size-2 shrink-0 rounded-full bg-success" />
            <p className="text-sm leading-6 text-muted-foreground">{point}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
