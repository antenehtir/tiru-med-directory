import type { Doctor } from "@/types/doctor";

type DoctorActionPanelProps = {
  doctor: Doctor;
};

export function DoctorActionPanel({ doctor }: DoctorActionPanelProps) {
  return (
    <aside className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-normal text-primary">
        Action panel
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Patient action previews
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        These controls preview future booking and contact actions only. Booking,
        phone contact, schedules, and telemedicine are not active.
      </p>

      <div className="mt-5 grid gap-3">
        <button
          className="min-h-12 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm"
          type="button"
        >
          {doctor.bookingActionLabel}
        </button>
        <button
          className="min-h-12 rounded-md border border-border bg-background px-5 text-sm font-semibold text-primary shadow-sm"
          type="button"
        >
          Contact preview
        </button>
        <button
          className="min-h-12 rounded-md border border-border bg-background px-5 text-sm font-semibold text-primary shadow-sm"
          type="button"
        >
          Save doctor preview
        </button>
      </div>
    </aside>
  );
}
