import type { Doctor } from "@/types/doctor";

type DoctorAvailabilitySectionProps = {
  doctor: Doctor;
};

export function DoctorAvailabilitySection({
  doctor,
}: DoctorAvailabilitySectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-normal text-primary">
        Availability
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Schedule preview
      </h2>
      <div className="mt-5 rounded-md border border-border bg-background p-4">
        <p className="text-sm font-semibold text-success">
          {doctor.availability}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Real appointment slots, calendars, and schedule updates are not
          connected yet.
        </p>
      </div>
    </section>
  );
}
