import Link from "next/link";

export function CorrectionRequestCta() {
  return (
    <section className="rounded-lg bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-normal">
        Correction request
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">
        Need to fix existing healthcare information?
      </h2>
      <p className="mt-3 text-sm leading-6 text-primary-foreground/85">
        Request review for outdated phone numbers,
        locations, services, or trust status.
      </p>
      <Link
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-card px-5 text-center text-sm font-semibold text-foreground sm:w-auto"
        href="/register"
      >
        Request correction
      </Link>
    </section>
  );
}
