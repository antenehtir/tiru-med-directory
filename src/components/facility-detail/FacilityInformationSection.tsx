import { Pill } from "@/components/ui/Pill";
import { CORPORATE_CREDIT_COMPANY_PREFIX } from "@/lib/provider/onboarding-config";
import type { Facility } from "@/types/facility";

type FacilityInformationSectionProps = {
  facility: Facility;
};

export function FacilityInformationSection({ facility }: FacilityInformationSectionProps) {
  // Corporate company names ride inside payment_methods as their own
  // prefixed entries (see CORPORATE_CREDIT_COMPANY_PREFIX) rather than a raw
  // pill each — shown as one readable line under the pills instead, the same
  // way the insurance note already sits under the Insurance pill.
  const allPaymentMethods = facility.paymentMethods ?? [];
  const corporateCompanies = allPaymentMethods
    .filter((m) => m.startsWith(CORPORATE_CREDIT_COMPANY_PREFIX))
    .map((m) => m.slice(CORPORATE_CREDIT_COMPANY_PREFIX.length));
  const paymentMethods = allPaymentMethods.filter((m) => !m.startsWith(CORPORATE_CREDIT_COMPANY_PREFIX));
  const patientGroups = facility.patientGroups ?? [];
  const languages = facility.languages ?? [];
  const accessNotes = facility.accessNotes?.trim();
  const hasPayment = paymentMethods.length > 0;
  const hasPatientGroups = patientGroups.length > 0;
  const hasLanguages = languages.length > 0;
  const hasAccessNotes = Boolean(accessNotes);

  // Address and area used to render here too, duplicating what
  // FacilityDetailHeader already shows. With those gone this section only
  // exists when it has something of its own to say, so it disappears
  // entirely on the listings that carry neither field.
  //
  // Languages and access notes were being collected in onboarding (Step 1
  // and Step 2) and stored on every facility that answered them, with no
  // reader anywhere in the app turning that data into something a visitor
  // could see — this section is the natural home, next to the other "what
  // you need to know before you go" facts it already carries.
  if (!hasPatientGroups && !hasPayment && !hasLanguages && !hasAccessNotes) return null;

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

        {hasLanguages ? (
          <div className="rounded-card border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Languages spoken</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {languages.map((lang) => <Pill key={lang} size="sm" variant="default">{lang}</Pill>)}
            </div>
          </div>
        ) : null}

        {hasAccessNotes ? (
          <div className="rounded-card border border-border bg-background p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parking & access</p>
            <p className="mt-2 text-sm leading-5 text-foreground">{accessNotes}</p>
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
            {paymentMethods.includes("Corporate credit agreement") && corporateCompanies.length > 0 ? (
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                Corporate accounts: {corporateCompanies.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
