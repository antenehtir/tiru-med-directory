import { DoctorCardGrid } from "@/components/cards/DoctorCardGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import { sampleDoctors } from "@/data/sampleDoctors";
import { DoctorActionPanel } from "./DoctorActionPanel";
import { DoctorAvailabilitySection } from "./DoctorAvailabilitySection";
import { DoctorCorrectionCta } from "./DoctorCorrectionCta";
import { DoctorDetailHeader } from "./DoctorDetailHeader";
import { DoctorInformationSection } from "./DoctorInformationSection";
import { DoctorTelemedicinePreview } from "./DoctorTelemedicinePreview";
import { DoctorTrustSection } from "./DoctorTrustSection";

const doctor = sampleDoctors.find(
  (sampleDoctor) => sampleDoctor.id === "doctor-hana-bekele",
);

const similarDoctors = sampleDoctors.filter(
  (sampleDoctor) => sampleDoctor.id !== "doctor-hana-bekele",
);

export function DoctorDetailPage() {
  if (!doctor) {
    return null;
  }

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <DoctorDetailHeader doctor={doctor} />
          <DoctorActionPanel doctor={doctor} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-6">
            <DoctorInformationSection doctor={doctor} />
            <DoctorAvailabilitySection doctor={doctor} />
            <DoctorTelemedicinePreview doctor={doctor} />
          </div>

          <div className="grid gap-6">
            <DoctorTrustSection doctor={doctor} />
            <DoctorCorrectionCta doctor={doctor} />
          </div>
        </div>

        <section>
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              Similar doctors
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
              Other doctors to compare
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sample doctors use the existing reusable doctor card system.
            </p>
          </div>
          <DoctorCardGrid doctors={similarDoctors} />
        </section>
      </div>
    </PageContainer>
  );
}
