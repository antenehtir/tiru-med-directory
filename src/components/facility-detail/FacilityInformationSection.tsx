import { Pill } from "@/components/ui/Pill";
import { getFacilityMedicalSpecialties } from "@/lib/facility/specialty-display";
import type { Facility } from "@/types/facility";

type FacilityInformationSectionProps = {
  facility: Facility;
};

const informationRows = [
  { label: "Address", key: "address" },
] as const;

export function FacilityInformationSection({
  facility,
}: FacilityInformationSectionProps) {
  const visibleRows = informationRows.filter((row) => {
    const val = facility[row.key];
    return val && String(val).trim().length > 0;
  });
  const medicalSpecialties = getFacilityMedicalSpecialties(facility.services);
  const hasSpecialties = medicalSpecialties.length > 0;
  const paymentMethods = facility.paymentMethods ?? [];
  const hasPayment = paymentMethods.length > 0;
  const patientGroups = facility.patientGroups ?? [];
  const hasPatientGroups = patientGroups.length > 0;

  // If the only thing we could show is the category (already the header
  // subtitle), there's nothing non-redundant here — hide the whole section.
  if (!hasSpecialties && visibleRows.length === 0 && !hasPatientGroups && !hasPayment) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Overview
      </p>
      <h2 className="mt-1 text-xl font-semibold leading-tight text-foreground">
        Facility information
      </h2>

      {(hasSpecialties || visibleRows.length > 0) && (
        <div className="mt-4 grid gap-3">
          {hasSpecialties ? (
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">
                {medicalSpecialties.join(", ")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Care focus</p>
            </div>
          ) : null}
          {visibleRows.map((row) => (
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
      )}

      {hasPatientGroups && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">
            Patient groups served
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {patientGroups.map((group) => (
              <Pill key={group} variant="default">
                {group}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {hasPayment && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-4">
          <p className="text-sm font-semibold text-foreground">
            Payment &amp; Insurance
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <Pill key={method} variant="default">
                {method}
              </Pill>
            ))}
          </div>
          {paymentMethods.includes("Insurance") && facility.insuranceNote && (
            <p className="mt-2 text-sm text-muted-foreground">
              Insurance accepted: {facility.insuranceNote}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
