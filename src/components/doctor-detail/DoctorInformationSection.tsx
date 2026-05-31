import type { Doctor } from "@/types/doctor";

type DoctorInformationSectionProps = {
  doctor: Doctor;
};

const informationRows = [
  { label: "Doctor name", key: "name" },
  { label: "Specialty", key: "specialty" },
  { label: "Facility affiliation", key: "facility" },
  { label: "Practice area", key: "location" },
] as const;

export function DoctorInformationSection({
  doctor,
}: DoctorInformationSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-normal text-primary">
        Doctor information
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Professional details at a glance.
      </h2>

      <div className="mt-5 grid gap-3">
        {informationRows.map((row) => (
          <div
            className="rounded-md border border-border bg-background p-4"
            key={row.label}
          >
            <p className="text-sm font-semibold text-foreground">
              {doctor[row.key]}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{row.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
