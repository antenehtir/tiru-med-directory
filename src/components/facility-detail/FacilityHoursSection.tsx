import type { Facility } from "@/types/facility";

type FacilityHoursSectionProps = {
  facility: Facility;
};

export function FacilityHoursSection({ facility }: FacilityHoursSectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <p className="text-sm font-semibold text-primary">
        Hours
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Working hours
      </h2>
      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">
          {facility.workingHours}
        </p>
        <p
          className={`mt-2 text-sm font-semibold ${
            facility.isOpen ? "text-success" : "text-warning"
          }`}
        >
          {facility.availabilityNote}
        </p>
      </div>
    </section>
  );
}
