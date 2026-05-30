import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "./SectionHeading";

const doctors = [
  {
    name: "Dr. Hana Bekele",
    specialty: "Pediatrics",
    facility: "Bole Family Clinic",
  },
  {
    name: "Dr. Samuel Tesfaye",
    specialty: "Cardiology",
    facility: "Addis Health Center",
  },
];

export function DoctorDiscoverySection() {
  return (
    <section className="bg-background">
      <PageContainer className="py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="Doctors"
            title="Doctor discovery starts with clear profile previews."
            description="Sample doctor cards prepare the future profile experience while showing verification as a first-class signal."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {doctors.map((doctor) => (
              <article
                key={doctor.name}
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary">
                  DR
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {doctor.name}
                </h3>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {doctor.specialty}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {doctor.facility}
                </p>
                <span className="mt-4 inline-flex rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
                  Verified doctor
                </span>
                <Link
                  className="mt-5 flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-primary"
                  href="/doctors"
                >
                  View profile
                </Link>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
