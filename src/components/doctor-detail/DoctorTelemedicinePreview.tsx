import type { Doctor, DoctorTelemedicineStatus } from "@/types/doctor";

type DoctorTelemedicinePreviewProps = {
  doctor: Doctor;
};

const telemedicineCopy: Record<
  DoctorTelemedicineStatus,
  { title: string; description: string }
> = {
  available: {
    title: "Telemedicine preview available",
    description:
      "Future versions can show online consultation access after product logic is added.",
  },
  planned: {
    title: "Telemedicine planned",
    description:
      "This profile reserves space for future online care without enabling video, chat, or booking.",
  },
  "not-available": {
    title: "In-person care preview",
    description:
      "This profile currently presents in-person discovery only in the static UI.",
  },
};

export function DoctorTelemedicinePreview({
  doctor,
}: DoctorTelemedicinePreviewProps) {
  const copy = telemedicineCopy[doctor.telemedicineStatus];

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-normal text-secondary">
        Telemedicine preview
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        {copy.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {copy.description}
      </p>
      <div className="mt-5 rounded-md border border-border bg-muted px-4 py-3 text-sm font-semibold text-primary">
        No real telemedicine functionality is active.
      </div>
    </section>
  );
}
