import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export function ContactPage() {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          Contact
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          For urgent medical needs, contact local emergency services or visit
          the nearest healthcare facility directly &mdash; this page is not an
          emergency channel.
        </p>

        <div className="mt-6 grid gap-3">
          <Link
            className="flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            href="/register"
          >
            List a provider
          </Link>
          <Link
            className="flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
            href="/corrections"
          >
            Suggest a correction
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
