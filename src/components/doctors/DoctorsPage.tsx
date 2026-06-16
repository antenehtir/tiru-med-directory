import Link from "next/link";
import { DoctorCardGrid } from "@/components/cards/DoctorCardGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Doctor } from "@/types/doctor";
import { DoctorsHero } from "./DoctorsHero";
import { SpecialtyFilterChips } from "./SpecialtyFilterChips";

type DoctorsPageProps = {
  activeSpecialty?: string;
  doctors?: Doctor[];
};

export function DoctorsPage({
  activeSpecialty = "",
  doctors = [],
}: DoctorsPageProps) {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <DoctorsHero />
        <SpecialtyFilterChips activeSpecialty={activeSpecialty} />

        {doctors.length > 0 ? (
          <DoctorCardGrid doctors={doctors} />
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Specialist profiles coming soon.{" "}
            <Link className="font-semibold text-primary" href="/register">
              Register your practice &rarr;
            </Link>
          </p>
        )}
      </div>
    </PageContainer>
  );
}
