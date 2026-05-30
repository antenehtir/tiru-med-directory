import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";

const trustSignals = [
  "Verified facilities",
  "Doctor profiles",
  "Nearby care",
];

const categories = ["Doctors", "Hospitals", "Pharmacies", "Labs"];

const tokens = [
  { name: "Primary", value: "#0F4C81", className: "bg-primary" },
  { name: "Secondary", value: "#0E9F9A", className: "bg-secondary" },
  { name: "Success", value: "#16A34A", className: "bg-success" },
  { name: "Warning", value: "#F59E0B", className: "bg-warning" },
];

export default function Home() {
  return (
    <PageShell>
      <PageContainer className="py-10 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-sm">
              Design system foundation
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Trusted healthcare discovery, prepared for a search-first product.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              A calm starter interface for patients and doctors to find verified
              healthcare services quickly on mobile and desktop.
            </p>

            <div className="mt-8 rounded-lg border border-border bg-card p-3 shadow-sm">
              <div className="flex min-h-14 items-center gap-3 rounded-md border border-border bg-input px-4">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-secondary"
                />
                <span className="text-sm text-muted-foreground sm:text-base">
                  Search doctors, facilities, pharmacies, or services
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {trustSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <div className="mb-3 size-2 rounded-full bg-success" />
                  <p className="text-sm font-semibold text-card-foreground">
                    {signal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Starter card pattern
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-card-foreground">
                  Verified Facility
                </h2>
              </div>
              <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
                Verified
              </span>
            </div>

            <div className="space-y-4 py-5">
              <div>
                <p className="text-sm text-muted-foreground">Facility</p>
                <p className="mt-1 font-semibold text-card-foreground">
                  Addis Health Center
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="mt-1 font-semibold text-card-foreground">
                  Clinic and diagnostics
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="mt-1 font-semibold text-card-foreground">
                  Addis Ababa, Ethiopia
                </p>
              </div>
            </div>

            <div className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
              <button className="min-h-12 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm">
                Primary action
              </button>
              <button className="min-h-12 rounded-md border border-border bg-card px-4 text-sm font-semibold text-primary">
                Secondary action
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {tokens.map((token) => (
                <div key={token.name}>
                  <div className={`h-12 rounded-md ${token.className}`} />
                  <p className="mt-2 text-xs font-semibold text-card-foreground">
                    {token.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{token.value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </PageContainer>
    </PageShell>
  );
}
