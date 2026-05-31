import Link from "next/link";

export function RequestFacilityAdditionCta() {
  return (
    <section className="rounded-lg bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal">
            Facility addition
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            Want a healthcare facility to appear here?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/85">
            This prepares the future facility request flow without forms,
            uploads, authentication, or database logic.
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-card px-5 text-center text-sm font-semibold text-[#0F172A]"
          href="/register"
        >
          Request facility addition
        </Link>
      </div>
    </section>
  );
}
