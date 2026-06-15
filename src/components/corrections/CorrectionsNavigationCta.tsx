import Link from "next/link";

export function CorrectionsNavigationCta() {
  return (
    <section className="rounded-lg bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal">
            Next step
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            Find the listing or request a new profile.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/85">
            Search first when you want to review an existing listing. Use
            provider registration when the provider or facility is missing from
            the directory.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-card px-5 text-center text-sm font-semibold text-foreground sm:w-auto"
            href="/search"
          >
            Back to search
          </Link>
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-primary-foreground/40 px-5 text-center text-sm font-semibold text-primary-foreground sm:w-auto"
            href="/register"
          >
            Provider registration
          </Link>
        </div>
      </div>
    </section>
  );
}
