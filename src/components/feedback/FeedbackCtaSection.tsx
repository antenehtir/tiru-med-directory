import Link from "next/link";

const ctaLinks = [
  { label: "Suggest correction", href: "/corrections" },
  { label: "Contact support", href: "/contact" },
  { label: "Register provider", href: "/register" },
];

export function FeedbackCtaSection() {
  return (
    <section className="rounded-lg bg-primary p-5 text-primary-foreground shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal">
            Related paths
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            Choose the clearest next step.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/85">
            Corrections are best for listing accuracy, Contact is best for
            support, and Register is best for provider visibility.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
          {ctaLinks.map((link, index) => (
            <Link
              className={`inline-flex min-h-12 w-full items-center justify-center rounded-md px-5 text-center text-sm font-semibold sm:w-auto ${
                index === 0
                  ? "bg-card text-foreground"
                  : "border border-primary-foreground/40 text-primary-foreground"
              }`}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
