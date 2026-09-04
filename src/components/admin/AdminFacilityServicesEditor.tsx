"use client";

import { useRef, useState, useTransition } from "react";
import { updateFacilityServices } from "@/app/admin/(protected)/facilities/[id]/edit/actions";
import { getPillClassName, Pill } from "@/components/ui/Pill";
import {
  BasicLabSelector,
  PillSelector,
  type CustomServiceCategories,
} from "@/components/provider/steps/service-pill-controls";
import {
  ScheduleBuilder,
  scheduleToText,
  type ScheduleRow,
} from "@/components/provider/ScheduleBuilder";
import {
  MAIN_SERVICES,
  SPECIALTIES,
  IMAGING_SERVICES,
  ALL_BASIC_LAB_TESTS,
  PHARMACY_CATEGORIES,
  LAB_TESTS,
  HOME_CARE_SERVICES,
  AMBULANCE_VEHICLE_TYPES,
  PAYMENT_METHODS,
  EMERGENCY_TYPES,
  WALKIN_APPOINTMENT_OPTIONS,
} from "@/lib/provider/onboarding-config";

type Facility = Record<string, unknown>;

type AppointmentModality = {
  type: "phone" | "telegram" | "whatsapp" | "online" | "in_person";
  label: string;
  value: string;
};

const APPOINTMENT_MODALITY_OPTIONS: {
  type: AppointmentModality["type"];
  label: string;
  placeholder: string;
  inputType: "tel" | "text" | "url";
  icon: string;
}[] = [
  { type: "phone", label: "Phone call", placeholder: "+251 91 234 5678", inputType: "tel", icon: "📞" },
  { type: "telegram", label: "Telegram", placeholder: "@username or t.me/username", inputType: "text", icon: "✈️" },
  { type: "whatsapp", label: "WhatsApp", placeholder: "+251 91 234 5678", inputType: "tel", icon: "💬" },
  { type: "online", label: "Online booking", placeholder: "https://booking.example.com", inputType: "url", icon: "🌐" },
  { type: "in_person", label: "In-person at reception", placeholder: "e.g. Visit reception desk, Mon–Fri 8AM–5PM", inputType: "text", icon: "🏥" },
];

function arr(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

export function AdminFacilityServicesEditor({ facility }: { facility: Facility }) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Category is read from the live facility row, not a claim's facility_type
  // — the two use the same DB category strings (FACILITY_CATEGORY_DB_MAP), so
  // this branches the same way Step3ServicesForm does. Broader than
  // DEFAULT_STEP3_FACILITY_TYPES's exact-match list so legacy category
  // synonyms ("Medical Plaza", "Healthcare Facility") still fall into the
  // general/specialty/imaging view instead of rendering nothing.
  const category = (facility.category as string) ?? "";
  const isPharmacy = category === "Pharmacy";
  const isDiagnostic = category === "Diagnostic Center";
  const isHomeCare = category === "Home Care";
  const isAmbulance = category === "Ambulance Service";
  const isDefault = !isPharmacy && !isDiagnostic && !isHomeCare && !isAmbulance;

  const [services, setServices] = useState<string[]>(arr(facility.services));
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [customServiceCategories, setCustomServiceCategories] = useState<CustomServiceCategories>(
    (facility.custom_service_categories as CustomServiceCategories) ?? {},
  );

  const existingSchedule = facility.schedule as ScheduleRow[] | null;
  const [schedule, setSchedule] = useState<ScheduleRow[]>(
    existingSchedule && existingSchedule.length > 0
      ? existingSchedule
      : [{ days: [], open: "", close: "", closed: false }],
  );

  const existingWorkingHours = (facility.working_hours as string) ?? "";
  const [paymentMethods, setPaymentMethods] = useState<string[]>(arr(facility.payment_methods));
  const [insuranceNote, setInsuranceNote] = useState((facility.insurance_note as string) ?? "");
  const [customPayment, setCustomPayment] = useState("");
  const [walkinPolicy, setWalkinPolicy] = useState((facility.walkin_appointment as string) ?? "");
  const [appointmentModalities, setAppointmentModalities] = useState<AppointmentModality[]>(
    (facility.appointment_modalities as AppointmentModality[]) ?? [],
  );
  const [emergencyType, setEmergencyType] = useState((facility.emergency_type as string) ?? "");

  // Snapshot of what this editor was opened on. Only fields the admin has
  // actually changed get written, so an untouched field is never overwritten
  // with this component's own default state. That is what let a blank
  // schedule row derive "" over a real working_hours of "24/7"; the same
  // shape would apply to any column the UI cannot load faithfully — a
  // comma-separated string sitting in an array column, for instance, which
  // arr() would silently read as [] and then write back as [].
  const initial = useRef({
    services: arr(facility.services),
    customServiceCategories:
      (facility.custom_service_categories as CustomServiceCategories) ?? {},
    paymentMethods: arr(facility.payment_methods),
    insuranceNote: (facility.insurance_note as string | null) ?? null,
    walkinPolicy: (facility.walkin_appointment as string | null) ?? null,
    appointmentModalities: (facility.appointment_modalities as AppointmentModality[]) ?? [],
    emergencyType: (facility.emergency_type as string | null) ?? null,
    schedule: (facility.schedule as ScheduleRow[] | null) ?? null,
  });

  function toggleService(svc: string) {
    setServices((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]));
  }

  function selectAllIn(list: readonly string[]) {
    setServices((prev) => {
      const hasAll = list.every((s) => prev.includes(s));
      return hasAll ? prev.filter((s) => !list.includes(s as never)) : [...new Set([...prev, ...list])];
    });
  }

  function setCustomInput(key: string, value: string) {
    setCustomInputs((prev) => ({ ...prev, [key]: value }));
  }

  function addCustomService(key: string) {
    const value = (customInputs[key] ?? "").trim();
    if (!value || services.includes(value)) return;
    setServices((prev) => [...prev, value]);
    setCustomServiceCategories((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), value] }));
    setCustomInput(key, "");
  }

  function removeCustomService(key: string, value: string) {
    setServices((prev) => prev.filter((s) => s !== value));
    setCustomServiceCategories((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((v) => v !== value),
    }));
  }

  function togglePayment(method: string) {
    setPaymentMethods((prev) => {
      const next = prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method];
      if (method === "Insurance" && !next.includes("Insurance")) setInsuranceNote("");
      return next;
    });
  }

  const knownLists: readonly (readonly string[])[] = isPharmacy
    ? [PHARMACY_CATEGORIES]
    : isDiagnostic
      ? [LAB_TESTS, IMAGING_SERVICES]
      : isHomeCare
        ? [HOME_CARE_SERVICES, ALL_BASIC_LAB_TESTS]
        : isAmbulance
          ? [AMBULANCE_VEHICLE_TYPES]
          : [MAIN_SERVICES, SPECIALTIES, IMAGING_SERVICES, ALL_BASIC_LAB_TESTS];
  const allKnown = knownLists.flat();
  const categorizedCustomValues = new Set(Object.values(customServiceCategories).flat());
  const customEntries = services.filter(
    (s) => !allKnown.includes(s) && !categorizedCustomValues.has(s),
  );

  function handleSave() {
    setError(null);
    if (services.length === 0) {
      setError("Please select at least one service.");
      return;
    }

    const before = initial.current;
    const unchanged = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

    // The schedule builder starts from a single blank row when a facility has
    // no structured schedule yet — most legacy rows only carry the free-text
    // working_hours. Deriving from that blank row yields "", so schedule and
    // working_hours stay out of the payload unless the builder holds a row
    // with actual days.
    const hasRealSchedule = schedule.some((row) => row.days.length > 0);
    const nextInsuranceNote = paymentMethods.includes("Insurance")
      ? insuranceNote || null
      : null;

    const fields: Record<string, unknown> = {};
    if (!unchanged(services, before.services)) fields.services = services;
    if (!unchanged(customServiceCategories, before.customServiceCategories)) {
      fields.custom_service_categories = customServiceCategories;
    }
    if (hasRealSchedule && !unchanged(schedule, before.schedule)) {
      fields.schedule = schedule;
      fields.working_hours = scheduleToText(schedule);
    }
    if (!unchanged(paymentMethods, before.paymentMethods)) {
      fields.payment_methods = paymentMethods;
    }
    if (!unchanged(nextInsuranceNote, before.insuranceNote)) {
      fields.insurance_note = nextInsuranceNote;
    }
    if (!unchanged(walkinPolicy || null, before.walkinPolicy)) {
      fields.walkin_appointment = walkinPolicy || null;
    }
    if (!unchanged(appointmentModalities, before.appointmentModalities)) {
      fields.appointment_modalities = appointmentModalities;
    }
    // Only offered for the categories that render the control, so a Pharmacy
    // with an emergency_type set elsewhere does not get it nulled from here.
    if (isDefault && !unchanged(emergencyType || null, before.emergencyType)) {
      fields.emergency_type = emergencyType || null;
    }

    if (Object.keys(fields).length === 0) {
      setError("Nothing to save — no changes were made in this section.");
      return;
    }

    startTransition(async () => {
      try {
        await updateFacilityServices(facility.id as string, fields);
        initial.current = {
          services,
          customServiceCategories,
          paymentMethods,
          insuranceNote: nextInsuranceNote,
          walkinPolicy: walkinPolicy || null,
          appointmentModalities,
          emergencyType: isDefault ? emergencyType || null : before.emergencyType,
          schedule: hasRealSchedule ? schedule : before.schedule,
        };
        setSavedAt(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Services card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold text-foreground">Services & Specialties *</h2>
            <p className="text-sm text-muted-foreground">
              Select everything this facility offers. Patients search by these.
            </p>
          </div>
          {savedAt && !isPending && (
            <span className="text-xs text-muted-foreground">Saved {savedAt.toLocaleTimeString()}</span>
          )}
        </div>

        {isDefault && (
          <>
            <PillSelector
              customEntries={customServiceCategories.general ?? []}
              customValue={customInputs.general ?? ""}
              onCustomAdd={() => addCustomService("general")}
              onCustomChange={(v) => setCustomInput("general", v)}
              onRemoveCustom={(v) => removeCustomService("general", v)}
              onSelectAll={() => selectAllIn(MAIN_SERVICES)}
              onToggle={toggleService}
              options={MAIN_SERVICES}
              services={services}
              title="General services"
            />
            <PillSelector
              customEntries={customServiceCategories.specialty ?? []}
              customValue={customInputs.specialty ?? ""}
              onCustomAdd={() => addCustomService("specialty")}
              onCustomChange={(v) => setCustomInput("specialty", v)}
              onRemoveCustom={(v) => removeCustomService("specialty", v)}
              onSelectAll={() => selectAllIn(SPECIALTIES)}
              onToggle={toggleService}
              options={SPECIALTIES}
              services={services}
              title="Medical specialties"
            />
            <PillSelector
              customEntries={customServiceCategories.imaging ?? []}
              customValue={customInputs.imaging ?? ""}
              onCustomAdd={() => addCustomService("imaging")}
              onCustomChange={(v) => setCustomInput("imaging", v)}
              onRemoveCustom={(v) => removeCustomService("imaging", v)}
              onSelectAll={() => selectAllIn(IMAGING_SERVICES)}
              onToggle={toggleService}
              options={IMAGING_SERVICES}
              services={services}
              title="Imaging & Diagnostics"
            />
            <BasicLabSelector
              customInputs={customInputs}
              customServiceCategories={customServiceCategories}
              onCustomAdd={addCustomService}
              onCustomChange={setCustomInput}
              onRemoveCustom={removeCustomService}
              onSelectAllIn={selectAllIn}
              onToggleTest={toggleService}
              services={services}
            />
          </>
        )}

        {isPharmacy && (
          <PillSelector
            customEntries={customServiceCategories.pharmacy ?? []}
            customValue={customInputs.pharmacy ?? ""}
            onCustomAdd={() => addCustomService("pharmacy")}
            onCustomChange={(v) => setCustomInput("pharmacy", v)}
            onRemoveCustom={(v) => removeCustomService("pharmacy", v)}
            onSelectAll={() => selectAllIn(PHARMACY_CATEGORIES)}
            onToggle={toggleService}
            options={PHARMACY_CATEGORIES}
            services={services}
            title="Medication categories"
          />
        )}

        {isDiagnostic && (
          <>
            <PillSelector
              customEntries={customServiceCategories.lab ?? []}
              customValue={customInputs.lab ?? ""}
              onCustomAdd={() => addCustomService("lab")}
              onCustomChange={(v) => setCustomInput("lab", v)}
              onRemoveCustom={(v) => removeCustomService("lab", v)}
              onSelectAll={() => selectAllIn(LAB_TESTS)}
              onToggle={toggleService}
              options={LAB_TESTS}
              services={services}
              title="Tests & Procedures"
            />
            <PillSelector
              customEntries={customServiceCategories.imaging ?? []}
              customValue={customInputs.imaging ?? ""}
              onCustomAdd={() => addCustomService("imaging")}
              onCustomChange={(v) => setCustomInput("imaging", v)}
              onRemoveCustom={(v) => removeCustomService("imaging", v)}
              onSelectAll={() => selectAllIn(IMAGING_SERVICES)}
              onToggle={toggleService}
              options={IMAGING_SERVICES}
              services={services}
              title="Imaging & Diagnostics"
            />
          </>
        )}

        {isHomeCare && (
          <>
            <PillSelector
              customEntries={customServiceCategories.homecare ?? []}
              customValue={customInputs.homecare ?? ""}
              onCustomAdd={() => addCustomService("homecare")}
              onCustomChange={(v) => setCustomInput("homecare", v)}
              onRemoveCustom={(v) => removeCustomService("homecare", v)}
              onSelectAll={() => selectAllIn(HOME_CARE_SERVICES)}
              onToggle={toggleService}
              options={HOME_CARE_SERVICES}
              services={services}
              title="Services offered"
            />
            <BasicLabSelector
              customInputs={customInputs}
              customServiceCategories={customServiceCategories}
              onCustomAdd={addCustomService}
              onCustomChange={setCustomInput}
              onRemoveCustom={removeCustomService}
              onSelectAllIn={selectAllIn}
              onToggleTest={toggleService}
              services={services}
            />
          </>
        )}

        {isAmbulance && (
          <PillSelector
            customEntries={customServiceCategories.ambulance ?? []}
            customValue={customInputs.ambulance ?? ""}
            onCustomAdd={() => addCustomService("ambulance")}
            onCustomChange={(v) => setCustomInput("ambulance", v)}
            onRemoveCustom={(v) => removeCustomService("ambulance", v)}
            onSelectAll={() => selectAllIn(AMBULANCE_VEHICLE_TYPES)}
            onToggle={toggleService}
            options={AMBULANCE_VEHICLE_TYPES}
            services={services}
            title="Vehicle types"
          />
        )}

        {/* Leftover free-typed items not tracked under any category above
            (legacy data saved before category-tagging existed). */}
        {customEntries.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {customEntries.map((custom) => (
              <span key={custom} className={getPillClassName("selected", "md")}>
                {custom}
                <button
                  className="hover:text-red-200"
                  onClick={() => setServices((prev) => prev.filter((s) => s !== custom))}
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {services.length > 0 && (
          <div className="mt-4 rounded-lg bg-primary/5 px-3 py-2">
            <p className="text-xs text-primary">{services.length} selected</p>
          </div>
        )}
      </div>

      {/* Working hours & access card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-foreground">Working Hours & Access</h2>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Working schedule</label>
            {!schedule.some((row) => row.days.length > 0) && existingWorkingHours && (
              <p className="text-xs text-muted-foreground">
                Currently listed as <span className="font-medium text-foreground">{existingWorkingHours}</span>.
                That stays as-is unless you build a schedule below.
              </p>
            )}
            <ScheduleBuilder onChange={setSchedule} value={schedule} />
          </div>

          {isDefault && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_emergency_type">
                Emergency service availability
              </label>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="admin_emergency_type"
                onChange={(e) => setEmergencyType(e.target.value)}
                value={emergencyType}
              >
                <option value="">Select…</option>
                {EMERGENCY_TYPES.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="admin_walkin">
              Walk-in / appointment policy
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="admin_walkin"
              onChange={(e) => {
                setWalkinPolicy(e.target.value);
                if (e.target.value === "Walk-in only") setAppointmentModalities([]);
              }}
              value={walkinPolicy}
            >
              <option value="">Select…</option>
              {WALKIN_APPOINTMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {walkinPolicy !== "" && walkinPolicy !== "Walk-in only" && (
              <div className="mt-2 rounded-xl border border-border bg-background p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  How can patients book an appointment?
                </p>
                <div className="space-y-3">
                  {APPOINTMENT_MODALITY_OPTIONS.map((option) => {
                    const existing = appointmentModalities.find((m) => m.type === option.type);
                    const isSelected = !!existing;
                    return (
                      <div key={option.type} className="space-y-2">
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            checked={isSelected}
                            onChange={(e) => {
                              setAppointmentModalities((prev) =>
                                e.target.checked
                                  ? [...prev, { type: option.type, label: option.label, value: "" }]
                                  : prev.filter((m) => m.type !== option.type),
                              );
                            }}
                            type="checkbox"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {option.icon} {option.label}
                          </span>
                        </label>
                        {isSelected && (
                          <input
                            className="ml-6 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            defaultValue={existing?.value ?? ""}
                            onBlur={(e) => {
                              const value = e.target.value;
                              setAppointmentModalities((prev) =>
                                prev.map((m) => (m.type === option.type ? { ...m, value } : m)),
                              );
                            }}
                            placeholder={option.placeholder}
                            type={option.inputType}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">Payment & Insurance</h2>
        <p className="mb-4 text-sm text-muted-foreground">Help patients know how to pay before they arrive.</p>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Payment methods accepted</label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <Pill
                  key={method}
                  onClick={() => togglePayment(method)}
                  variant={paymentMethods.includes(method) ? "selected" : "default"}
                >
                  {method}
                </Pill>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setCustomPayment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (customPayment.trim() && !paymentMethods.includes(customPayment.trim())) {
                      setPaymentMethods((prev) => [...prev, customPayment.trim()]);
                      setCustomPayment("");
                    }
                  }
                }}
                placeholder="Add payment method not listed..."
                type="text"
                value={customPayment}
              />
              <button
                className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                disabled={!customPayment.trim() || paymentMethods.includes(customPayment.trim())}
                onClick={() => {
                  if (customPayment.trim() && !paymentMethods.includes(customPayment.trim())) {
                    setPaymentMethods((prev) => [...prev, customPayment.trim()]);
                    setCustomPayment("");
                  }
                }}
                type="button"
              >
                Add
              </button>
            </div>

            {paymentMethods.some((m) => !(PAYMENT_METHODS as readonly string[]).includes(m)) && (
              <div className="flex flex-wrap gap-2">
                {paymentMethods
                  .filter((m) => !(PAYMENT_METHODS as readonly string[]).includes(m))
                  .map((custom) => (
                    <span key={custom} className={getPillClassName("selected", "md")}>
                      {custom}
                      <button
                        className="hover:text-red-200"
                        onClick={() => setPaymentMethods((prev) => prev.filter((m) => m !== custom))}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {paymentMethods.includes("Insurance") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_insurance_note">
                Which insurers do you accept? (optional)
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="admin_insurance_note"
                onChange={(e) => setInsuranceNote(e.target.value)}
                placeholder="e.g. Cigna, Nyala Insurance, CBHI"
                type="text"
                value={insuranceNote}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
          onClick={handleSave}
          type="button"
        >
          {isPending ? "Saving…" : "Save Services & Specialties"}
        </button>
      </div>
    </div>
  );
}
