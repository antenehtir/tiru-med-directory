import type { Facility } from "@/types/facility";

type FacilityInformationSectionProps = {
  facility: Facility;
};

const informationRows = [
  { label: "Facility category", key: "category" },
  { label: "Care focus", key: "subcategory" },
  { label: "Area", key: "location" },
  { label: "Address", key: "address" },
] as const;

export function FacilityInformationSection({
  facility,
}: FacilityInformationSectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <p className="text-sm font-semibold text-primary">
        Facility information
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
        Details patients can scan quickly.
      </h2>

      <div className="mt-5 grid gap-3">
        {informationRows.map((row) => (
          <div
            className="rounded-2xl border border-border bg-background p-4"
            key={row.label}
          >
            <p className="text-sm font-semibold text-foreground">
              {facility[row.key]}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{row.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
