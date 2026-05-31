import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "./SectionHeading";

const pharmacyItems = [
  "Open pharmacy previews",
  "Location-based sample listings",
  "Clear contact-ready cards",
];

export function PharmacyDiscoverySection() {
  return (
    <section className="bg-card">
      <PageContainer className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-14">
        <SectionHeading
          eyebrow="Pharmacies"
          title="Make pharmacy discovery easy to reach."
          description="A focused pharmacy section gives medicine access its own place in the homepage structure."
        />
        <div className="rounded-lg border border-border bg-background p-4 shadow-sm sm:p-5">
          <h3 className="text-lg font-semibold text-foreground sm:text-xl">
            Pharmacy discovery preview
          </h3>
          <div className="mt-5 grid gap-3">
            {pharmacyItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-md bg-card p-3"
              >
                <span className="size-2 rounded-full bg-secondary" />
                <p className="text-sm font-medium text-card-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>
          <Link
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            href="/pharmacies"
          >
            Explore pharmacies
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
