import { DoctorCardGrid } from "@/components/cards/DoctorCardGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import { sampleDoctors } from "@/data/sampleDoctors";
import type { Doctor } from "@/types/doctor";
import { DoctorAvailabilityPreview } from "./DoctorAvailabilityPreview";
import { DoctorSearchPreview } from "./DoctorSearchPreview";
import { DoctorTrustBlock } from "./DoctorTrustBlock";
import { DoctorsHero } from "./DoctorsHero";
import { RequestDoctorProfileCta } from "./RequestDoctorProfileCta";
import { SpecialtyFilterChips } from "./SpecialtyFilterChips";

type DoctorsPageProps = {
  activeQuery?: string;
  activeSpecialty?: string;
  doctors?: Doctor[];
};

export function DoctorsPage({
  activeQuery = "",
  activeSpecialty = "",
  doctors = sampleDoctors,
}: DoctorsPageProps) {
  const isFiltered = Boolean(activeQuery || activeSpecialty);

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <DoctorsHero />
        <DoctorSearchPreview query={activeQuery} />
        <SpecialtyFilterChips activeSpecialty={activeSpecialty} />

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Doctor results
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isFiltered
                ? `Showing doctor matches${activeSpecialty ? ` for ${activeSpecialty}` : ""}${activeQuery ? ` matching "${activeQuery}"` : ""}.`
                : "Sample doctor cards using the reusable doctor card system."}
            </p>
          </div>
          {doctors.length > 0 ? (
            <DoctorCardGrid doctors={doctors} />
          ) : (
            <section className="rounded-lg border border-dashed border-border bg-card p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary">
                0
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No doctor matches yet
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Try a broader specialty, doctor name, facility, or location
                while doctor filtering remains frontend-only.
              </p>
            </section>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <DoctorAvailabilityPreview />
          <DoctorTrustBlock />
        </div>

        <RequestDoctorProfileCta />
      </div>
    </PageContainer>
  );
}
