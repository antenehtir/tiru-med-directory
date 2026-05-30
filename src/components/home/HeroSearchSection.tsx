import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

const suggestedSearches = [
  "Cardiologist",
  "Pharmacy near me",
  "Laboratory",
  "Pediatric clinic",
];

export function HeroSearchSection() {
  return (
    <section className="bg-background">
      <PageContainer className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-sm">
            Healthcare discovery for Ethiopia
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Find trusted doctors, facilities, pharmacies, and services faster.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Search verified healthcare providers and clear sample listings from
            one calm, mobile-first starting point.
          </p>

          <form className="mt-8 rounded-lg border border-border bg-card p-3 shadow-sm">
            <label className="sr-only" htmlFor="home-healthcare-search">
              Search healthcare providers
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                id="home-healthcare-search"
                className="min-h-14 rounded-md border border-border bg-input px-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Search doctors, clinics, labs, pharmacies"
                readOnly
              />
              <button
                className="min-h-14 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm"
                type="button"
              >
                Search
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedSearches.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sample verified result
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-card-foreground">
                Addis Health Center
              </h2>
            </div>
            <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
              Verified
            </span>
          </div>
          <div className="grid gap-4 py-5 sm:grid-cols-2">
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
