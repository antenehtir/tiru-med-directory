import { Pill } from "@/components/ui/Pill";
import type { Facility } from "@/types/facility";

type FacilityInformationSectionProps = {
  facility: Facility;
};

export function FacilityInformationSection({ facility }: FacilityInformationSectionProps) {
  const paymentMethods = facility.paymentMethods ?? [];
  const patientGroups = facility.patientGroups ?? [];
  const hasPayment = paymentMethods.length > 0;
  const hasPatientGroups = patientGroups.length > 0;

  // Address and area used to render here too, duplicating what
  // FacilityDetailHeader already shows. With those gone this section only
  // exists when it has something of its own to say, so it disappears
  // entirely on the listings that carry neither field.
  if (!hasPatientGroups && !hasPayment) return null;

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Plan your visit</p>
      <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
        Useful information before you go
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {hasPatientGroups ? (
          <div className="rounded-card border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patients served</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {patientGroups.map((group) => <Pill key={group} size="sm" variant="default">{group}</Pill>)}
            </div>
          </div>
        ) : null}

        {hasPayment ? (
          <div className="rounded-card border border-border bg-background p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment & insurance</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {paymentMethods.map((method) => <Pill key={method} size="sm" variant="default">{method}</Pill>)}
            </div>
            {paymentMethods.includes("Insurance") && facility.insuranceNote ? (
              <p className="mt-2 text-sm leading-5 text-muted-foreground">Insurance note: {facility.insuranceNote}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
