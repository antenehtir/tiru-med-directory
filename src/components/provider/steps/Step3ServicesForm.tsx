"use client";

import { useState, useTransition } from "react";
import { saveStep3, autoSaveStep3 } from "@/app/provider/onboarding/services/actions";
import {
  MAIN_SERVICES,
  SPECIALTIES,
  PAYMENT_METHODS,
  EMERGENCY_TYPES,
  WALKIN_APPOINTMENT_OPTIONS,
} from "@/lib/provider/onboarding-config";
import {
  ScheduleBuilder,
  scheduleToText,
  type ScheduleRow,
} from "@/components/provider/ScheduleBuilder";
import {
  CheckupPackageUploader,
  type CheckupPackage,
} from "@/components/provider/CheckupPackageUploader";

type Claim = Record<string, unknown>;

export function Step3ServicesForm({ claim }: { claim: Claim }) {
  const [, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [services, setServices] = useState<string[]>(
    (claim.proposed_services as string[]) ?? [],
  );
  const [customService, setCustomService] = useState("");

  const existingSchedule = claim.proposed_schedule as ScheduleRow[] | null;
  const [schedule, setSchedule] = useState<ScheduleRow[]>(
    existingSchedule && existingSchedule.length > 0
      ? existingSchedule
      : [{ days: [], open: "", close: "", closed: false }],
  );

  const [checkupOffered, setCheckupOffered] = useState(
    (claim.proposed_checkup_offered as boolean) ?? false,
  );
  const [insuranceAccepted, setInsuranceAccepted] = useState(
    (claim.proposed_insurance_accepted as boolean) ?? false,
  );
  const [paymentMethods, setPaymentMethods] = useState<string[]>(
    (claim.proposed_payment_methods as string[]) ?? [],
  );

  const [checkupPackages, setCheckupPackages] = useState<CheckupPackage[]>(
    (claim.proposed_checkup_packages as CheckupPackage[]) ?? [],
  );

  function autoSave(partial: Record<string, unknown>) {
    startTransition(async () => {
      await autoSaveStep3(partial);
      setLastSaved(new Date());
    });
  }

  function toggleService(svc: string) {
    const next = services.includes(svc)
      ? services.filter((s) => s !== svc)
      : [...services, svc];
    setServices(next);
    autoSave({ proposed_services: next });
  }

  function togglePayment(method: string) {
    const next = paymentMethods.includes(method)
      ? paymentMethods.filter((m) => m !== method)
      : [...paymentMethods, method];
    setPaymentMethods(next);
    autoSave({ proposed_payment_methods: next });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setValidationError(null);
    const form = e.currentTarget;
    const workingHours = (
      form.elements.namedItem("working_hours") as HTMLInputElement
    )?.value?.trim();
    const walkinAppointment = (
      form.elements.namedItem("walkin_appointment") as HTMLSelectElement
    )?.value;

    if (services.length === 0) {
      e.preventDefault();
      setValidationError("Please select at least one service or specialty.");
      return;
    }
    if (!workingHours) {
      e.preventDefault();
      setValidationError("Working hours are required.");
      return;
    }
    if (!walkinAppointment) {
      e.preventDefault();
      setValidationError("Please select your walk-in / appointment policy.");
      return;
    }
  }

  const mainServicesList = MAIN_SERVICES as readonly string[];
  const specialtiesList = SPECIALTIES as readonly string[];
  const selectedMainServices = services.filter((s) => mainServicesList.includes(s));
  const selectedSpecialties = services.filter((s) => specialtiesList.includes(s));

  return (
    <form action={saveStep3} className="space-y-6" onSubmit={handleSubmit}>
      {/* Hidden fields for checkboxes/toggles */}
      <input name="checkup_offered" type="hidden" value={checkupOffered ? "yes" : "no"} />
      <input name="insurance_accepted" type="hidden" value={insuranceAccepted ? "yes" : "no"} />
      <input
        name="checkup_packages_json"
        type="hidden"
        value={JSON.stringify(checkupPackages)}
      />
      <input name="working_hours" type="hidden" value={scheduleToText(schedule)} />
      <input name="schedule_json" type="hidden" value={JSON.stringify(schedule)} />
      {services.map((svc) => (
        <input key={svc} name="services" type="hidden" value={svc} />
      ))}
      {paymentMethods.map((pm) => (
        <input key={pm} name="payment_methods" type="hidden" value={pm} />
      ))}

      {/* Services card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold text-foreground">
              Services & Specialties *
            </h2>
            <p className="text-sm text-muted-foreground">
              Select everything your facility offers. Patients search by these.
            </p>
          </div>
          {lastSaved && (
            <p className="shrink-0 text-xs text-muted-foreground">
              Draft saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Main services */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">General services</p>
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => {
                const allMain = [...MAIN_SERVICES];
                const hasAll = allMain.every((s) => services.includes(s));
                const next = hasAll
                  ? services.filter((s) => !allMain.includes(s as never))
                  : [...new Set([...services, ...allMain])];
                setServices(next);
                autoSave({ proposed_services: next });
              }}
              type="button"
            >
              {MAIN_SERVICES.every((s) => services.includes(s))
                ? "Deselect all"
                : "Select all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {MAIN_SERVICES.map((svc) => (
              <button
                key={svc}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  services.includes(svc)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
                onClick={() => toggleService(svc)}
                type="button"
              >
                {services.includes(svc) ? "✓ " : ""}{svc}
              </button>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Medical specialties</p>
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => {
                const allSpecs = [...SPECIALTIES];
                const hasAll = allSpecs.every((s) => services.includes(s));
                const next = hasAll
                  ? services.filter((s) => !allSpecs.includes(s as never))
                  : [...new Set([...services, ...allSpecs])];
                setServices(next);
                autoSave({ proposed_services: next });
              }}
              type="button"
            >
              {SPECIALTIES.every((s) => services.includes(s))
                ? "Deselect all"
                : "Select all"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  services.includes(spec)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
                onClick={() => toggleService(spec)}
                type="button"
              >
                {services.includes(spec) ? "✓ " : ""}{spec}
              </button>
            ))}
          </div>
        </div>

        {/* Custom service */}
        <div className="mt-4 flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">
            Add a service not listed above
          </p>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setCustomService(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = customService.trim();
                  if (trimmed && !services.includes(trimmed)) {
                    const next = [...services, trimmed];
                    setServices(next);
                    autoSave({ proposed_services: next });
                    setCustomService("");
                  }
                }
              }}
              placeholder="e.g. Hyperbaric oxygen therapy"
              type="text"
              value={customService}
            />
            <button
              className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
              disabled={!customService.trim() || services.includes(customService.trim())}
              onClick={() => {
                const trimmed = customService.trim();
                if (trimmed && !services.includes(trimmed)) {
                  const next = [...services, trimmed];
                  setServices(next);
                  autoSave({ proposed_services: next });
                  setCustomService("");
                }
              }}
              type="button"
            >
              Add
            </button>
          </div>
          {services
            .filter(
              (s) =>
                !(MAIN_SERVICES as readonly string[]).includes(s) &&
                !(SPECIALTIES as readonly string[]).includes(s),
            )
            .map((custom) => (
              <span
                key={custom}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {custom}
                <button
                  className="hover:text-red-500"
                  onClick={() => {
                    const next = services.filter((s) => s !== custom);
                    setServices(next);
                    autoSave({ proposed_services: next });
                  }}
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
        </div>

        {/* Selection summary */}
        {services.length > 0 && (
          <div className="mt-4 rounded-lg bg-primary/5 px-3 py-2">
            <p className="text-xs text-primary">
              {services.length} selected:{" "}
              {selectedMainServices.length > 0 &&
                `${selectedMainServices.length} services`}
              {selectedMainServices.length > 0 && selectedSpecialties.length > 0 && ", "}
              {selectedSpecialties.length > 0 &&
                `${selectedSpecialties.length} specialties`}
            </p>
          </div>
        )}
      </div>

      {/* Schedule card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-foreground">
          Working Hours & Access
        </h2>

        <div className="space-y-4">
          {/* Schedule builder */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Working schedule *
            </label>
            <p className="text-xs text-muted-foreground">
              Add one row per schedule pattern. Use shortcuts to quickly
              select weekdays, weekends, or all days.
            </p>
            <ScheduleBuilder
              onChange={(rows) => {
                setSchedule(rows);
                autoSave({
                  proposed_schedule: rows,
                  proposed_working_hours: scheduleToText(rows),
                });
              }}
              value={schedule}
            />
          </div>

          {/* Weekend hours */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="weekend_hours">
              Weekend hours (if different)
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={(claim.proposed_weekend_hours as string) ?? ""}
              id="weekend_hours"
              name="weekend_hours"
              onBlur={(e) => autoSave({ proposed_weekend_hours: e.target.value })}
              placeholder="e.g. 9:00 AM – 2:00 PM or Closed"
              type="text"
            />
          </div>

          {/* Holiday availability */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="holiday_hours">
              Holiday availability
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={(claim.proposed_holiday_hours as string) ?? ""}
              id="holiday_hours"
              name="holiday_hours"
              onBlur={(e) => autoSave({ proposed_holiday_hours: e.target.value })}
              placeholder="e.g. Open on Ethiopian holidays, Closed on international holidays"
              type="text"
            />
          </div>

          {/* Emergency type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="emergency_type">
              Emergency service availability
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={(claim.proposed_emergency_type as string) ?? ""}
              id="emergency_type"
              name="emergency_type"
              onBlur={(e) => autoSave({ proposed_emergency_type: e.target.value })}
            >
              <option value="">Select…</option>
              {EMERGENCY_TYPES.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Walk-in / appointment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="walkin_appointment">
              Walk-in / appointment policy *
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={(claim.proposed_walkin_appointment as string) ?? ""}
              id="walkin_appointment"
              name="walkin_appointment"
              onBlur={(e) => autoSave({ proposed_walkin_appointment: e.target.value })}
            >
              <option value="">Select…</option>
              {WALKIN_APPOINTMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Check-up packages card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">
          General Check-up Packages
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          If your facility offers health screening packages, upload your
          price list. Patients can view and download it directly.
        </p>

        <div className="space-y-4">
          {/* Yes/No toggle */}
          <div className="flex gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                checked={!checkupOffered}
                onChange={() => {
                  setCheckupOffered(false);
                  autoSave({ proposed_checkup_offered: false });
                }}
                type="radio"
                value="no"
              />
              We don&apos;t offer check-up packages
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                checked={checkupOffered}
                onChange={() => {
                  setCheckupOffered(true);
                  autoSave({ proposed_checkup_offered: true });
                }}
                type="radio"
                value="yes"
              />
              Yes, we offer check-up packages
            </label>
          </div>

          {checkupOffered && (
            <div className="space-y-3">
              <CheckupPackageUploader
                onChange={(pkgs) => {
                  setCheckupPackages(pkgs);
                  autoSave({ proposed_checkup_packages: pkgs });
                }}
                value={checkupPackages}
              />

              {/* Optional note */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="checkup_note"
                >
                  Short note about your packages (optional)
                </label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={(claim.proposed_checkup_note as string) ?? ""}
                  id="checkup_note"
                  name="checkup_note"
                  onBlur={(e) => autoSave({ proposed_checkup_note: e.target.value })}
                  placeholder="e.g. Packages include lab tests, ECG, and doctor consultation"
                  type="text"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">
          Payment & Insurance
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Help patients know how to pay before they arrive.
        </p>

        <div className="space-y-4">
          {/* Payment methods */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Payment methods accepted
            </label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    checked={paymentMethods.includes(method)}
                    onChange={() => togglePayment(method)}
                    type="checkbox"
                    value={method}
                  />
                  {method}
                </label>
              ))}
            </div>
          </div>

          {/* Insurance */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Insurance accepted?
            </label>
            <div className="flex gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  checked={!insuranceAccepted}
                  onChange={() => {
                    setInsuranceAccepted(false);
                    autoSave({ proposed_insurance_accepted: false });
                  }}
                  type="radio"
                  value="no"
                />
                No
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  checked={insuranceAccepted}
                  onChange={() => {
                    setInsuranceAccepted(true);
                    autoSave({ proposed_insurance_accepted: true });
                  }}
                  type="radio"
                  value="yes"
                />
                Yes
              </label>
            </div>

            {insuranceAccepted && (
              <div className="flex flex-col gap-1.5">
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={(claim.proposed_insurance_note as string) ?? ""}
                  name="insurance_note"
                  onBlur={(e) => autoSave({ proposed_insurance_note: e.target.value })}
                  placeholder="e.g. CBE Life, NYT, Awash Insurance accepted"
                  type="text"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {validationError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {validationError}
        </p>
      )}

      <div className="flex items-center justify-between">
        <a
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/provider/onboarding/location"
        >
          ← Back
        </a>
        <button
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          type="submit"
        >
          Save & continue →
        </button>
      </div>
    </form>
  );
}
