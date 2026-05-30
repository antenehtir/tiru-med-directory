import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export function ProviderRegistrationCta() {
  return (
    <section className="bg-card">
      <PageContainer className="py-10 lg:py-14">
        <div className="rounded-lg bg-primary p-6 text-primary-foreground shadow-sm sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-normal">
              Provider registration
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
              Help doctors and facilities prepare for trusted visibility.
            </h2>
            <p className="mt-3 text-base leading-7 text-primary-foreground/85">
              This call-to-action prepares the future registration flow without
              adding authentication, documents, or backend review logic.
            </p>
          </div>
          <Link
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-card px-5 text-sm font-semibold text-primary lg:mt-0"
            href="/register"
          >
            Register provider
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
