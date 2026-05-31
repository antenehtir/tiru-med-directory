import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "./SectionHeading";

const specialties = [
  "Cardiology",
  "Pediatrics",
  "Dermatology",
  "Gynecology",
  "Dentistry",
  "Orthopedics",
  "Internal medicine",
  "Ophthalmology",
];

export function PopularSpecialtiesSection() {
  return (
    <section className="bg-background">
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <SectionHeading
          eyebrow="Specialties"
          title="Popular specialties prepared for future search filters."
          description="These sample specialty links help users scan care options quickly while keeping the page simple."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          {specialties.map((specialty) => (
            <Link
              key={specialty}
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:border-primary"
              href="/doctors"
            >
              {specialty}
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
