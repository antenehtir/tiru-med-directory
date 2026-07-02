"use client";

import { useState, useTransition } from "react";
import { saveStep3, autoSaveStep3 } from "@/app/provider/onboarding/services/actions";
import {
  MAIN_SERVICES,
  SPECIALTIES,
  PAYMENT_METHODS,
  EMERGENCY_TYPES,
  WALKIN_APPOINTMENT_OPTIONS,
  IMAGING_SERVICES,
  BASIC_LAB_SERVICES,
  PHARMACY_CATEGORIES,
  DELIVERY_OPTIONS,
  COVERAGE_SUB_CITIES,
  LAB_TESTS,
  SAMPLE_COLLECTION_OPTIONS,
  TURNAROUND_TIME_OPTIONS,
  HOME_CARE_SERVICES,
  MIN_VISIT_DURATION_OPTIONS,
  BOOKING_LEAD_TIME_OPTIONS,
  AMBULANCE_VEHICLE_TYPES,
  RESPONSE_TIME_OPTIONS,
  DEFAULT_STEP3_FACILITY_TYPES,
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

type CategoryData = {
  delivery_options?: string;
  coverage_areas?: string[];
  sample_collection?: string;
  turnaround_time?: string;
  accreditation?: string;
  min_visit_duration?: string;
  booking_lead_time?: string;
  fleet_size?: number | string;
  response_time?: string;
  dispatch_phone?: string;
  emergency_available_24_7?: boolean;
};

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
  {
    type: "phone",
    label: "Phone call",
    placeholder: "+251 91 234 5678",
    inputType: "tel",
    icon: "📞",
  },
  {
    type: "telegram",
    label: "Telegram",
    placeholder: "@username or t.me/username",
    inputType: "text",
    icon: "✈️",
  },
  {
    type: "whatsapp",
    label: "WhatsApp",
    placeholder: "+251 91 234 5678",
    inputType: "tel",
    icon: "💬",
  },
  {
    type: "online",
    label: "Online booking",
    placeholder: "https://booking.example.com",
    inputType: "url",
    icon: "🌐",
  },
  {
    type: "in_person",
    label: "In-person at reception",
    placeholder: "e.g. Visit reception desk, Mon–Fri 8AM–5PM",
    inputType: "text",
    icon: "🏥",
  },
];

// Shared pill-selector UI — header with Select all/Deselect all, pill grid,
// and the "Add service not listed" custom free-fill input. Used for every
// category's services pills (general/specialty/imaging in the default view,
// plus every category-specific list) so the pattern stays identical
// everywhere it appears.
function PillSelector({
  title,
  options,
  services,
  onToggle,
  onSelectAll,
  customValue,
  onCustomChange,
  onCustomAdd,
}: {
  title: string;
  options: readonly string[];
  services: string[];
  onToggle: (item: string) => void;
  onSelectAll: () => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  onCustomAdd: () => void;
}) {
  const allSelected = options.every((o) => services.includes(o));

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <button
          className="text-xs text-primary hover:underline"
          onClick={onSelectAll}
          type="button"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              services.includes(opt)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40"
            }`}
            onClick={() => onToggle(opt)}
            type="button"
          >
            {services.includes(opt) ? "✓ " : ""}{opt}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCustomAdd();
            }
          }}
          placeholder="Add a service not listed..."
          type="text"
          value={customValue}
        />
        <button
          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
          disabled={!customValue.trim() || services.includes(customValue.trim())}
          onClick={onCustomAdd}
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// Fixed sub-city multi-select — used by coverage-area fields, which are
// explicitly exempt from the custom-add pattern (geography is a closed list).
function SubCitySelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COVERAGE_SUB_CITIES.map((city) => (
        <label
          key={city}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        >
          <input
            checked={selected.includes(city)}
            onChange={() => {
              const next = selected.includes(city)
                ? selected.filter((c) => c !== city)
                : [...selected, city];
              onChange(next);
            }}
            type="checkbox"
          />
          {city}
        </label>
      ))}
    </div>
  );
}

// Single-select radio toggle for category-specific 2-3 option fields
// (delivery options, sample collection, etc.)
function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        >
          <input checked={value === opt} onChange={() => onChange(opt)} type="radio" />
          {opt}
        </label>
      ))}
    </div>
  );
}

export function Step3ServicesForm({ claim }: { claim: Claim }) {
  const [, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Facility category, read from the claim (copied from provider_accounts
  // at signup / claim creation — see src/lib/provider/get-claim.ts).
  // Drives which sections of Step 3 render below.
  const facilityType = (claim.facility_type as string | null) ?? null;
  const diagnosticSubtype = (claim.diagnostic_subtype as string | null) ?? null;

  const isDefault =
    !facilityType || (DEFAULT_STEP3_FACILITY_TYPES as readonly string[]).includes(facilityType);
  const isOther = facilityType === "Other";
  const isPharmacy = facilityType === "Pharmacy";
  const isDiagnostic = facilityType === "Laboratory / Diagnostics";
  const isHomeCare = facilityType === "Home Care";
  const isAmbulance = facilityType === "Ambulance Service";

  const isDiagLabOnly = isDiagnostic && diagnosticSubtype === "lab";
  const isDiagImagingOnly = isDiagnostic && diagnosticSubtype === "imaging";
  // "both" is also the fallback when a Laboratory/Diagnostics claim has no
  // subtype recorded yet (e.g. pre-dates this feature).
  const isDiagBoth = isDiagnostic && (diagnosticSubtype === "both" || !diagnosticSubtype);

  const showLabPills = isDiagLabOnly || isDiagBoth;
  const showDiagImagingPills = isDiagImagingOnly || isDiagBoth;

  const showSchedule = !isAmbulance;
  const showEmergencyType = isDefault;
  const showWalkin = isDefault;
  const showCheckup = isDefault;

  const [services, setServices] = useState<string[]>(
    (claim.proposed_services as string[]) ?? [],
  );
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const [categoryData, setCategoryData] = useState<CategoryData>(
    (claim.proposed_category_data as CategoryData) ?? {},
  );

  const existingSchedule = claim.proposed_schedule as ScheduleRow[] | null;
  const [schedule, setSchedule] = useState<ScheduleRow[]>(
    existingSchedule && existingSchedule.length > 0
      ? existingSchedule
      : [{ days: [], open: "", close: "", closed: false }],
  );

  const [checkupOffered, setCheckupOffered] = useState(
    (claim.proposed_checkup_offered as boolean) ?? false,
  );
  const [paymentMethods, setPaymentMethods] = useState<string[]>(
    (claim.proposed_payment_methods as string[]) ?? [],
  );
  const [insuranceNote, setInsuranceNote] = useState(
    (claim.proposed_insurance_note as string) ?? "",
  );
  const [customPayment, setCustomPayment] = useState("");

  const [checkupPackages, setCheckupPackages] = useState<CheckupPackage[]>(
    (claim.proposed_checkup_packages as CheckupPackage[]) ?? [],
  );

  const [walkinPolicy, setWalkinPolicy] = useState(
    (claim.proposed_walkin_appointment as string) ?? "",
  );
  const [appointmentModalities, setAppointmentModalities] = useState<
    AppointmentModality[]
  >((claim.proposed_appointment_modalities as AppointmentModality[]) ?? []);

  function autoSave(partial: Record<string, unknown>) {
    startTransition(async () => {
      await autoSaveStep3(partial);
      setLastSaved(new Date());
    });
  }

  function autoSaveCategory(partial: Partial<CategoryData>) {
    const next = { ...categoryData, ...partial };
    setCategoryData(next);
    autoSave({ proposed_category_data: next });
  }

  function toggleService(svc: string) {
    const next = services.includes(svc)
      ? services.filter((s) => s !== svc)
      : [...services, svc];
    setServices(next);
    autoSave({ proposed_services: next });
  }

  function selectAllIn(list: readonly string[]) {
    const hasAll = list.every((s) => services.includes(s));
    const next = hasAll
      ? services.filter((s) => !list.includes(s as never))
      : [...new Set([...services, ...list])];
    setServices(next);
    autoSave({ proposed_services: next });
  }

  function setCustomInput(key: string, value: string) {
    setCustomInputs((prev) => ({ ...prev, [key]: value }));
  }

  function addCustomService(key: string) {
    const value = (customInputs[key] ?? "").trim();
    if (!value || services.includes(value)) return;
    const next = [...services, value];
    setServices(next);
    autoSave({ proposed_services: next });
    setCustomInput(key, "");
  }

  function togglePayment(method: string) {
    const next = paymentMethods.includes(method)
      ? paymentMethods.filter((m) => m !== method)
      : [...paymentMethods, method];
    setPaymentMethods(next);
    if (method === "Insurance" && !next.includes("Insurance")) {
      setInsuranceNote("");
      autoSave({ proposed_payment_methods: next, proposed_insurance_note: null });
    } else {
      autoSave({ proposed_payment_methods: next });
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setValidationError(null);
    const form = e.currentTarget;

    if (services.length === 0) {
      e.preventDefault();
      setValidationError("Please select at least one service.");
      return;
    }

    if (showSchedule) {
      const workingHours = (
        form.elements.namedItem("working_hours") as HTMLInputElement
      )?.value?.trim();
      if (!workingHours) {
        e.preventDefault();
        setValidationError("Working hours are required.");
        return;
      }
    }

    if (showWalkin) {
      const walkinAppointment = (
        form.elements.namedItem("walkin_appointment") as HTMLSelectElement
      )?.value;
      if (!walkinAppointment) {
        e.preventDefault();
        setValidationError("Please select your walk-in / appointment policy.");
        return;
      }
    }
  }

  // Known option lists for whichever branch is active — anything in
  // `services` that isn't in one of these is a custom (free-typed) entry.
  const knownLists: readonly (readonly string[])[] = isDefault
    ? [MAIN_SERVICES, SPECIALTIES, IMAGING_SERVICES, BASIC_LAB_SERVICES]
    : isPharmacy
      ? [PHARMACY_CATEGORIES]
      : isDiagLabOnly
        ? [LAB_TESTS]
        : isDiagImagingOnly
          ? [IMAGING_SERVICES]
          : isDiagBoth
            ? [LAB_TESTS, IMAGING_SERVICES]
            : isHomeCare
              ? [HOME_CARE_SERVICES, BASIC_LAB_SERVICES]
              : isAmbulance
                ? [AMBULANCE_VEHICLE_TYPES]
                : [MAIN_SERVICES, SPECIALTIES, IMAGING_SERVICES];
  const allKnown = knownLists.flat();
  const customEntries = services.filter((s) => !allKnown.includes(s));

  const servicesHeading = isPharmacy
    ? "Pharmacy Services *"
    : isDiagnostic
      ? "Diagnostic Services *"
      : isHomeCare
        ? "Home Care Services *"
        : isAmbulance
          ? "Ambulance Services *"
          : "Services & Specialties *";

  return (
    <form action={saveStep3} className="space-y-6" onSubmit={handleSubmit}>
      {/* Hidden fields for checkboxes/toggles */}
      <input name="checkup_offered" type="hidden" value={checkupOffered ? "yes" : "no"} />
      <input
        name="checkup_packages_json"
        type="hidden"
        value={JSON.stringify(checkupPackages)}
      />
      <input name="working_hours" type="hidden" value={scheduleToText(schedule)} />
      <input name="schedule_json" type="hidden" value={JSON.stringify(schedule)} />
      <input
        name="appointment_modalities_json"
        type="hidden"
        value={JSON.stringify(appointmentModalities)}
      />
      <input name="category_data_json" type="hidden" value={JSON.stringify(categoryData)} />
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
            <h2 className="mb-1 text-lg font-bold text-foreground">{servicesHeading}</h2>
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

        {isDefault && (
          <>
            <PillSelector
              customValue={customInputs.general ?? ""}
              onCustomAdd={() => addCustomService("general")}
              onCustomChange={(v) => setCustomInput("general", v)}
              onSelectAll={() => selectAllIn(MAIN_SERVICES)}
              onToggle={toggleService}
              options={MAIN_SERVICES}
              services={services}
              title="General services"
            />
            <PillSelector
              customValue={customInputs.specialty ?? ""}
              onCustomAdd={() => addCustomService("specialty")}
              onCustomChange={(v) => setCustomInput("specialty", v)}
              onSelectAll={() => selectAllIn(SPECIALTIES)}
              onToggle={toggleService}
              options={SPECIALTIES}
              services={services}
              title="Medical specialties"
            />
            <PillSelector
              customValue={customInputs.imaging ?? ""}
              onCustomAdd={() => addCustomService("imaging")}
              onCustomChange={(v) => setCustomInput("imaging", v)}
              onSelectAll={() => selectAllIn(IMAGING_SERVICES)}
              onToggle={toggleService}
              options={IMAGING_SERVICES}
              services={services}
              title="Imaging & Diagnostics"
            />
            <PillSelector
              customValue={customInputs.basiclab ?? ""}
              onCustomAdd={() => addCustomService("basiclab")}
              onCustomChange={(v) => setCustomInput("basiclab", v)}
              onSelectAll={() => selectAllIn(BASIC_LAB_SERVICES)}
              onToggle={toggleService}
              options={BASIC_LAB_SERVICES}
              services={services}
              title="Basic Lab / Point-of-care Testing"
            />
          </>
        )}

        {isPharmacy && (
          <>
            <PillSelector
              customValue={customInputs.pharmacy ?? ""}
              onCustomAdd={() => addCustomService("pharmacy")}
              onCustomChange={(v) => setCustomInput("pharmacy", v)}
              onSelectAll={() => selectAllIn(PHARMACY_CATEGORIES)}
              onToggle={toggleService}
              options={PHARMACY_CATEGORIES}
              services={services}
              title="Medication categories"
            />

            <div className="mb-5 flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Delivery options</label>
              <ToggleGroup
                onChange={(v) => autoSaveCategory({ delivery_options: v })}
                options={DELIVERY_OPTIONS}
                value={categoryData.delivery_options ?? ""}
              />
            </div>

            {(categoryData.delivery_options === "Delivery only" ||
              categoryData.delivery_options === "Both") && (
              <div className="mb-5 flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Delivery coverage areas
                </label>
                <SubCitySelect
                  onChange={(next) => autoSaveCategory({ coverage_areas: next })}
                  selected={categoryData.coverage_areas ?? []}
                />
              </div>
            )}
          </>
        )}

        {isDiagnostic && (
          <>
            {showLabPills && (
              <PillSelector
                customValue={customInputs.lab ?? ""}
                onCustomAdd={() => addCustomService("lab")}
                onCustomChange={(v) => setCustomInput("lab", v)}
                onSelectAll={() => selectAllIn(LAB_TESTS)}
                onToggle={toggleService}
                options={LAB_TESTS}
                services={services}
                title="Tests & Procedures"
              />
            )}
            {showDiagImagingPills && (
              <PillSelector
                customValue={customInputs.imaging ?? ""}
                onCustomAdd={() => addCustomService("imaging")}
                onCustomChange={(v) => setCustomInput("imaging", v)}
                onSelectAll={() => selectAllIn(IMAGING_SERVICES)}
                onToggle={toggleService}
                options={IMAGING_SERVICES}
                services={services}
                title="Imaging & Diagnostics"
              />
            )}

            {showLabPills && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Sample collection
                  </label>
                  <ToggleGroup
                    onChange={(v) => autoSaveCategory({ sample_collection: v })}
                    options={SAMPLE_COLLECTION_OPTIONS}
                    value={categoryData.sample_collection ?? ""}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="turnaround_time">
                    Typical turnaround time
                  </label>
                  <select
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={categoryData.turnaround_time ?? ""}
                    id="turnaround_time"
                    onChange={(e) => autoSaveCategory({ turnaround_time: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {TURNAROUND_TIME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="accreditation">
                    Accreditation (optional)
                  </label>
                  <input
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={categoryData.accreditation ?? ""}
                    id="accreditation"
                    onBlur={(e) => autoSaveCategory({ accreditation: e.target.value })}
                    placeholder="e.g. ISO 15189, EHNRI certified"
                    type="text"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {isHomeCare && (
          <>
            <PillSelector
              customValue={customInputs.homecare ?? ""}
              onCustomAdd={() => addCustomService("homecare")}
              onCustomChange={(v) => setCustomInput("homecare", v)}
              onSelectAll={() => selectAllIn(HOME_CARE_SERVICES)}
              onToggle={toggleService}
              options={HOME_CARE_SERVICES}
              services={services}
              title="Services offered"
            />
            <PillSelector
              customValue={customInputs.basiclab ?? ""}
              onCustomAdd={() => addCustomService("basiclab")}
              onCustomChange={(v) => setCustomInput("basiclab", v)}
              onSelectAll={() => selectAllIn(BASIC_LAB_SERVICES)}
              onToggle={toggleService}
              options={BASIC_LAB_SERVICES}
              services={services}
              title="Basic Lab / Point-of-care Testing"
            />

            <div className="mb-5 flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Coverage areas</label>
              <SubCitySelect
                onChange={(next) => autoSaveCategory({ coverage_areas: next })}
                selected={categoryData.coverage_areas ?? []}
              />
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="min_visit_duration">
                Minimum visit duration
              </label>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={categoryData.min_visit_duration ?? ""}
                id="min_visit_duration"
                onChange={(e) => autoSaveCategory({ min_visit_duration: e.target.value })}
              >
                <option value="">Select…</option>
                {MIN_VISIT_DURATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="booking_lead_time">
                Booking lead time
              </label>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={categoryData.booking_lead_time ?? ""}
                id="booking_lead_time"
                onChange={(e) => autoSaveCategory({ booking_lead_time: e.target.value })}
              >
                <option value="">Select…</option>
                {BOOKING_LEAD_TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {isAmbulance && (
          <>
            <PillSelector
              customValue={customInputs.ambulance ?? ""}
              onCustomAdd={() => addCustomService("ambulance")}
              onCustomChange={(v) => setCustomInput("ambulance", v)}
              onSelectAll={() => selectAllIn(AMBULANCE_VEHICLE_TYPES)}
              onToggle={toggleService}
              options={AMBULANCE_VEHICLE_TYPES}
              services={services}
              title="Vehicle types"
            />

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="fleet_size">
                Number of vehicles in fleet
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={categoryData.fleet_size ?? ""}
                id="fleet_size"
                min={1}
                onBlur={(e) =>
                  autoSaveCategory({
                    fleet_size: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                type="number"
              />
            </div>

            <div className="mb-5 flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Coverage areas</label>
              <SubCitySelect
                onChange={(next) => autoSaveCategory({ coverage_areas: next })}
                selected={categoryData.coverage_areas ?? []}
              />
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="response_time">
                Response time
              </label>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={categoryData.response_time ?? ""}
                id="response_time"
                onChange={(e) => autoSaveCategory({ response_time: e.target.value })}
              >
                <option value="">Select…</option>
                {RESPONSE_TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="mb-5 flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">24/7 availability</label>
              <div className="flex gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    checked={!categoryData.emergency_available_24_7}
                    onChange={() => autoSaveCategory({ emergency_available_24_7: false })}
                    type="radio"
                  />
                  No
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    checked={!!categoryData.emergency_available_24_7}
                    onChange={() => autoSaveCategory({ emergency_available_24_7: true })}
                    type="radio"
                  />
                  Yes
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="dispatch_phone">
                Emergency dispatch number (if different from main phone)
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={categoryData.dispatch_phone ?? ""}
                id="dispatch_phone"
                onBlur={(e) => autoSaveCategory({ dispatch_phone: e.target.value })}
                placeholder="+251 91 234 5678"
                type="tel"
              />
            </div>
          </>
        )}

        {/* "Other" facility type — freeform tag section for any services not in predefined lists */}
        {isOther && (
          <div className="mb-5">
            <div className="mb-2">
              <p className="text-sm font-semibold text-foreground">Other services</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add any additional services your facility offers that aren&apos;t listed above.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setCustomInput("other", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomService("other");
                  }
                }}
                placeholder="Type a service and press Add…"
                type="text"
                value={customInputs.other ?? ""}
              />
              <button
                className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                disabled={
                  !(customInputs.other ?? "").trim() ||
                  services.includes((customInputs.other ?? "").trim())
                }
                onClick={() => addCustomService("other")}
                type="button"
              >
                Add
              </button>
            </div>
            {customEntries.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customEntries.map((custom) => (
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
            )}
          </div>
        )}

        {/* Custom entries — leftover free-typed items not in any known list above.
            Suppressed for "Other" facility type — handled in the section above. */}
        {customEntries.length > 0 && !isOther && (
          <div className="mt-4 flex flex-wrap gap-2">
            {customEntries.map((custom) => (
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
        )}

        {services.length > 0 && (
          <div className="mt-4 rounded-lg bg-primary/5 px-3 py-2">
            <p className="text-xs text-primary">{services.length} selected</p>
          </div>
        )}
      </div>

      {/* Schedule card */}
      {showSchedule && (
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

            {showEmergencyType && (
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
            )}

            {showWalkin && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="walkin_appointment">
                  Walk-in / appointment policy *
                </label>
                <select
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={walkinPolicy}
                  id="walkin_appointment"
                  name="walkin_appointment"
                  onChange={(e) => {
                    setWalkinPolicy(e.target.value);
                    autoSave({ proposed_walkin_appointment: e.target.value });
                    if (e.target.value === "Walk-in only") {
                      setAppointmentModalities([]);
                      autoSave({ proposed_appointment_modalities: [] });
                    }
                  }}
                >
                  <option value="">Select…</option>
                  {WALKIN_APPOINTMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {/* Appointment modalities — shown when appointment is part of policy */}
                {walkinPolicy !== "" && walkinPolicy !== "Walk-in only" && (
                  <div className="mt-2 rounded-xl border border-border bg-background p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">
                      How can patients book an appointment?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Select all that apply and provide the contact details for each.
                    </p>

                    <div className="space-y-3">
                      {APPOINTMENT_MODALITY_OPTIONS.map((option) => {
                        const existing = appointmentModalities.find(
                          (m) => m.type === option.type,
                        );
                        const isSelected = !!existing;

                        return (
                          <div key={option.type} className="space-y-2">
                            <label className="flex cursor-pointer items-center gap-3">
                              <input
                                checked={isSelected}
                                onChange={(e) => {
                                  let next: AppointmentModality[];
                                  if (e.target.checked) {
                                    next = [
                                      ...appointmentModalities,
                                      { type: option.type, label: option.label, value: "" },
                                    ];
                                  } else {
                                    next = appointmentModalities.filter(
                                      (m) => m.type !== option.type,
                                    );
                                  }
                                  setAppointmentModalities(next);
                                  autoSave({ proposed_appointment_modalities: next });
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
                                  const next = appointmentModalities.map((m) =>
                                    m.type === option.type
                                      ? { ...m, value: e.target.value }
                                      : m,
                                  );
                                  setAppointmentModalities(next);
                                  autoSave({ proposed_appointment_modalities: next });
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
            )}
          </div>
        </div>
      )}

      {/* Check-up packages card */}
      {showCheckup && (
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
      )}

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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Payment methods accepted
              </label>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => {
                  const allMethods = [...PAYMENT_METHODS];
                  const hasAll = allMethods.every((m) => paymentMethods.includes(m));
                  const next = hasAll
                    ? paymentMethods.filter((m) => !allMethods.includes(m as never))
                    : [...new Set([...paymentMethods, ...allMethods])];
                  setPaymentMethods(next);
                  autoSave({ proposed_payment_methods: next });
                }}
                type="button"
              >
                {PAYMENT_METHODS.every((m) => paymentMethods.includes(m))
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
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

            {/* Add custom payment method */}
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setCustomPayment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (customPayment.trim() && !paymentMethods.includes(customPayment.trim())) {
                      const next = [...paymentMethods, customPayment.trim()];
                      setPaymentMethods(next);
                      autoSave({ proposed_payment_methods: next });
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
                    const next = [...paymentMethods, customPayment.trim()];
                    setPaymentMethods(next);
                    autoSave({ proposed_payment_methods: next });
                    setCustomPayment("");
                  }
                }}
                type="button"
              >
                Add
              </button>
            </div>

            {/* Custom payment entries — removable tags */}
            {paymentMethods.some(
              (m) => !(PAYMENT_METHODS as readonly string[]).includes(m),
            ) && (
              <div className="flex flex-wrap gap-2">
                {paymentMethods
                  .filter((m) => !(PAYMENT_METHODS as readonly string[]).includes(m))
                  .map((custom) => (
                    <span
                      key={custom}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {custom}
                      <button
                        className="hover:text-red-500"
                        onClick={() => {
                          const next = paymentMethods.filter((m) => m !== custom);
                          setPaymentMethods(next);
                          autoSave({ proposed_payment_methods: next });
                        }}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Insurance — signalled by ticking "Insurance" above; insurer names are optional */}
          {paymentMethods.includes("Insurance") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="insurance_note">
                Which insurers do you accept? (optional)
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="insurance_note"
                name="insurance_note"
                onBlur={(e) => autoSave({ proposed_insurance_note: e.target.value || null })}
                onChange={(e) => setInsuranceNote(e.target.value)}
                placeholder="e.g. Cigna, Nyala Insurance, CBHI"
                type="text"
                value={insuranceNote}
              />
            </div>
          )}
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
