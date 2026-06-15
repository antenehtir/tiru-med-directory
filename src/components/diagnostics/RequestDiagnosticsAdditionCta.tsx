import Link from "next/link";

export function RequestDiagnosticsAdditionCta() {
  return (
    <section className="rounded-lg bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal">
            Diagnostics addition
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            Request a diagnostics listing.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/85">
            Share the provider details for review before publication.
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-card px-5 text-center text-sm font-semibold text-foreground sm:w-auto"
          href="/register"
        >
          Request diagnostics addition
        </Link>
      </div>
    </section>
  );
}
