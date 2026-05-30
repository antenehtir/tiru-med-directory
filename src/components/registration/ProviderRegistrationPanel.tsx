import Link from "next/link";

export function ProviderRegistrationPanel() {
  return (
    <div className="rounded-lg bg-primary p-6 text-primary-foreground shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-normal">
        Provider registration
      </p>
      <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl">
        Help healthcare providers request trusted visibility.
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-primary-foreground/85">
        Doctors, facilities, pharmacies, and diagnostic providers can prepare
        for listing or verification without adding live forms or backend review
        logic yet.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-card px-5 text-sm font-semibold text-[#0F4C81]"
          href="/register"
          style={{ color: "#0F172A" }}
        >
          Request listing preview
        </Link>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-md border border-primary-foreground/40 px-5 text-sm font-semibold text-primary-foreground"
          href="/register"
        >
          Request verification preview
        </Link>
      </div>
    </div>
  );
}
