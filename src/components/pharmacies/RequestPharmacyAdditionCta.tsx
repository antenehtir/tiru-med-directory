import Link from "next/link";

export function RequestPharmacyAdditionCta() {
  return (
    <section className="rounded-lg bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal">
            Pharmacy addition
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            Want a pharmacy to appear here?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/85">
            This prepares the future pharmacy listing request flow without
            forms, uploads, authentication, ordering, inventory, or database
            logic.
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-card px-5 text-center text-sm font-semibold text-foreground sm:w-auto"
          href="/register"
        >
          Request pharmacy addition
        </Link>
      </div>
    </section>
  );
}
