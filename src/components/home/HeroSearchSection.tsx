import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HealthcareSearchBox } from "@/components/search/HealthcareSearchBox";

export function HeroSearchSection() {
  return (
    <section className="bg-background">
      <PageContainer className="grid gap-6 py-8 sm:gap-8 sm:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-16">
        <div>
          <p className="mb-4 inline-flex max-w-full rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-primary shadow-sm sm:px-4">
            Healthcare discovery for Ethiopia
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
            Find trusted doctors, facilities, pharmacies, and services faster.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
            Search verified healthcare providers and clear sample listings from
            one calm, mobile-first starting point.
          </p>

          <HealthcareSearchBox />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col items-start gap-3 border-b border-border pb-5 min-[420px]:flex-row min-[420px]:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sample verified result
              </p>
              <h2 className="mt-2 text-xl font-semibold leading-tight text-card-foreground sm:text-2xl">
                Addis Health Center
              </h2>
            </div>
            <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
              Verified
            </span>
          </div>
          <div className="grid gap-4 py-4 sm:grid-cols-2 sm:py-5">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="mt-1 font-semibold text-card-foreground">
                Clinic and diagnostics
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="mt-1 font-semibold text-card-foreground">
                Addis Ababa
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="mt-1 font-semibold text-success">Open today</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trust signal</p>
              <p className="mt-1 font-semibold text-card-foreground">
                Contact reviewed
              </p>
            </div>
          </div>
          <Link
            className="flex min-h-12 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-primary"
            href="/facilities"
          >
            View sample facilities
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
