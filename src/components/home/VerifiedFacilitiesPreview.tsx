import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "./SectionHeading";

const facilities = [
  {
    name: "Addis Health Center",
    category: "Clinic and diagnostics",
    location: "Addis Ababa",
  },
  {
    name: "Unity Medical Clinic",
    category: "Family medicine",
    location: "Bole",
  },
  {
    name: "Sunrise Diagnostic Lab",
    category: "Laboratory services",
    location: "Megenagna",
  },
];

export function VerifiedFacilitiesPreview() {
  return (
    <section className="bg-card">
      <PageContainer className="py-10 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Trust"
            title="Verified facilities should stand out clearly."
            description="Sample facility cards show how verified healthcare information can be presented consistently."
          />
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-primary"
            href="/facilities"
          >
            Browse facilities
          </Link>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {facilities.map((facility) => (
            <article
              key={facility.name}
              className="rounded-lg border border-border bg-background p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {facility.name}
                </h3>
                <span className="shrink-0 rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
                  Verified
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {facility.category}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {facility.location}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  className="min-h-11 rounded-md bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
                  href="/facilities"
                >
                  View
                </Link>
                <Link
                  className="min-h-11 rounded-md border border-border px-3 py-3 text-center text-sm font-semibold text-primary"
                  href="/facilities"
                >
                  Contact
                </Link>
              </div>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
