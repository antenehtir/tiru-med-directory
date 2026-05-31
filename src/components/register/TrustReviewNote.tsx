export function TrustReviewNote() {
  return (
    <section className="rounded-lg border border-border bg-muted p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-normal text-secondary">
        Trust and review note
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Verification stays clearly separate from discovery.
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        DigitalDirectory-v2 will distinguish verified, pending, and
        community-submitted healthcare information so patients can understand
        what has been reviewed.
      </p>
      <div className="mt-5 rounded-md border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">
          Frontend-only preview
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This page does not collect documents, upload files, submit requests,
          create accounts, or send details to a database.
        </p>
      </div>
    </section>
  );
}
