import { DoctorCardGrid } from "@/components/cards/DoctorCardGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Doctor } from "@/types/doctor";
import { DoctorSearchPreview } from "./DoctorSearchPreview";
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
  doctors = [],
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
                : "Reviewed doctor information."}
            </p>
          </div>
          {doctors.length > 0 ? (
            <DoctorCardGrid doctors={doctors} />
          ) : (
            <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-border bg-muted text-sm font-bold text-muted-foreground">
                0
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Doctor profiles will be added soon.
              </h3>
            </section>
          )}
        </section>
        <RequestDoctorProfileCta />
      </div>
    </PageContainer>
  );
}
