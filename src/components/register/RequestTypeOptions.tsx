const requestTypes = [
  {
    title: "Add a new listing",
    description: "Prepare a doctor or facility profile for future review.",
  },
  {
    title: "Verify an existing listing",
    description: "Preview how verified status will be requested later.",
  },
  {
    title: "Correct listing information",
    description: "Flag outdated contact, location, or service details.",
  },
];

export function RequestTypeOptions() {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-secondary">
          Request type
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
          What would you like to request?
        </h2>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {requestTypes.map((request) => (
          <div
            className="min-h-12 rounded-md border border-border bg-background px-4 py-3 text-left text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:bg-muted"
            key={request.title}
          >
            <span className="block">{request.title}</span>
            <span className="mt-1 block text-sm font-normal leading-5 text-muted-foreground">
              {request.description}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
