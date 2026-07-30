"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveStep1, autoSaveStep1 } from "@/app/provider/(console)/onboarding/identity/actions";
import { AutoSaveIndicator } from "@/components/provider/AutoSaveIndicator";
import { PillOption } from "@/components/provider/PillOption";
import { SubmitButton } from "@/components/provider/SubmitButton";
import {
  OWNERSHIP_TYPES,
  LANGUAGES,
  PATIENT_GROUPS,
} from "@/lib/provider/onboarding-config";

type Claim = Record<string, unknown>;

export function Step1IdentityForm({
  claim,
  facilityName,
  facilityType,
  facilityTypeOther,
}: {
  claim: Claim;
  facilityName: string;
  facilityType?: string | null;
  facilityTypeOther?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // These are for auto-save and toggle logic only — NOT used as
  // controlled input values for the text/select fields below.
  const [languages, setLanguages] = useState<string[]>(
    (claim.proposed_languages as string[]) ?? [],
  );
  const [patientGroups, setPatientGroups] = useState<string[]>(
    (claim.proposed_patient_groups as string[]) ?? [],
  );
  const initialPatientGroups = (claim.proposed_patient_groups as string[]) ?? [];
  const initialOtherGroup = initialPatientGroups.find(
    (g) => !PATIENT_GROUPS.includes(g as (typeof PATIENT_GROUPS)[number]),
  );
  const [otherGroupSelected, setOtherGroupSelected] = useState<boolean>(
    Boolean(initialOtherGroup),
  );
  const [otherGroupText, setOtherGroupText] = useState<string>(
    initialOtherGroup ?? "",
  );
  const [hasBranches, setHasBranches] = useState<boolean>(
    ((claim.proposed_branch_count as number) ?? 1) > 1,
  );
  const [branchCount, setBranchCount] = useState<number>(
    (claim.proposed_branch_count as number) ?? 1,
  );

  function autoSave(partial: Parameters<typeof autoSaveStep1>[0]) {
    startTransition(async () => {
      await autoSaveStep1(partial);
      setLastSaved(new Date());
    });
  }

  function toggleLanguage(lang: string) {
    const next = languages.includes(lang)
      ? languages.filter((l) => l !== lang)
      : [...languages, lang];
    setLanguages(next);
    autoSave({ languages: next });
  }

  function togglePatientGroup(group: string) {
    const next = patientGroups.includes(group)
      ? patientGroups.filter((g) => g !== group)
      : [...patientGroups, group];
    setPatientGroups(next);
    autoSave({ patient_groups: next });
  }

  function toggleOtherGroup() {
    if (otherGroupSelected) {
      const next = otherGroupText.trim()
        ? patientGroups.filter((g) => g !== otherGroupText.trim())
        : patientGroups;
      setOtherGroupSelected(false);
      setPatientGroups(next);
      autoSave({ patient_groups: next });
    } else {
      setOtherGroupSelected(true);
    }
  }

  function saveOtherGroupText(text: string) {
    const trimmed = text.trim();
    const withoutOld = otherGroupText.trim()
      ? patientGroups.filter((g) => g !== otherGroupText.trim())
      : patientGroups;
    const next = trimmed ? [...withoutOld, trimmed] : withoutOld;
    setOtherGroupText(trimmed);
    setPatientGroups(next);
    autoSave({ patient_groups: next });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    setValidationError(null);
    const form = e.currentTarget;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    if (!nameInput?.value?.trim()) {
      e.preventDefault();
      setValidationError("Official facility name is required.");
      nameInput?.focus();
      return;
    }
  }

  const defaultName = (claim.proposed_name as string) ?? facilityName ?? "";
  const defaultAltName = (claim.proposed_alt_name as string) ?? "";
  const defaultOwnership = (claim.proposed_ownership_type as string) ?? "";
  const defaultDescription = (claim.proposed_description as string) ?? "";

  return (
    <form action={saveStep1} className="space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold text-foreground">
              Basic Identity
            </h2>
            <p className="text-sm text-muted-foreground">
              Tell patients who you are. Fields marked * are required.
            </p>
          </div>
          <AutoSaveIndicator isPending={isPending} lastSaved={lastSaved} />
        </div>

        <div className="space-y-4">
          {/* Facility type — read-only, set at signup. Not editable here. */}
          {facilityType && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
              <p className="text-sm text-foreground">
                Facility type:{" "}
                <span className="font-medium">
                  {facilityType === "Other" && facilityTypeOther
                    ? `Other — ${facilityTypeOther}`
                    : facilityType}
                </span>
              </p>
              <a
                className="shrink-0 text-xs text-primary hover:underline"
                href="/provider/signup"
              >
                Change
              </a>
            </div>
          )}

          {/* Official name — UNCONTROLLED, uses defaultValue */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Official facility name *
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={defaultName}
              id="name"
              name="name"
              onBlur={(e) => autoSave({ name: e.target.value })}
              required
              type="text"
            />
          </div>

          {/* Alt name — UNCONTROLLED */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="alt_name">
              Common or alternative name
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={defaultAltName}
              id="alt_name"
              name="alt_name"
              onBlur={(e) => autoSave({ alt_name: e.target.value })}
              type="text"
            />
          </div>

          {/* Ownership type — UNCONTROLLED */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ownership_type">
              Ownership type
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={defaultOwnership}
              id="ownership_type"
              name="ownership_type"
              onBlur={(e) => autoSave({ ownership_type: e.target.value })}
            >
              <option value="">Select…</option>
              {OWNERSHIP_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Branches — Yes/No then count */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">
              Does your facility have multiple branches?
            </label>
            <div className="flex gap-3">
              <PillOption
                checked={!hasBranches}
                name="_has_branches"
                onChange={() => {
                  setHasBranches(false);
                  setBranchCount(1);
                  autoSave({ branch_count: 1 });
                }}
                size="lg"
                type="radio"
                value="no"
              >
                No, single location
              </PillOption>
              <PillOption
                checked={hasBranches}
                name="_has_branches"
                onChange={() => {
                  setHasBranches(true);
                  if (branchCount <= 1) {
                    setBranchCount(2);
                    autoSave({ branch_count: 2 });
                  }
                }}
                size="lg"
                type="radio"
                value="yes"
              >
                Yes, multiple branches
              </PillOption>
            </div>

            {hasBranches && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="branch_count">
                  How many total locations?
                </label>
                <select
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={String(branchCount >= 2 ? Math.min(branchCount, 99) : 2)}
                  id="branch_count"
                  name="branch_count"
                  onChange={(e) => {
                    const total = parseInt(e.target.value, 10);
                    setBranchCount(total);
                    autoSave({ branch_count: total });
                  }}
                >
                  {[2, 3, 4, 5, 6].map((total) => (
                    <option key={total} value={String(total)}>
                      {total} total locations
                    </option>
                  ))}
                  <option value="99">More than 6 branches</option>
                </select>
              </div>
            )}

            {/* Hidden field — sends branch_count=1 when single location */}
            {!hasBranches && (
              <input name="branch_count" type="hidden" value="1" />
            )}
          </div>

          {/* Description — UNCONTROLLED */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="description">
              Short public description
            </label>
            <textarea
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={defaultDescription}
              id="description"
              name="description"
              onBlur={(e) => autoSave({ description: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              1-2 sentences patients read first. E.g. &quot;A family clinic offering
              pediatric and maternal care with same-day appointments.&quot;
            </p>
          </div>

          {/* Languages — checkboxes stay controlled (needed for toggle logic) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Languages supported
              </label>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => {
                  const allSelected = languages.length === LANGUAGES.length;
                  const next = allSelected ? [] : [...LANGUAGES];
                  setLanguages(next);
                  autoSave({ languages: next });
                }}
                type="button"
              >
                {languages.length === LANGUAGES.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <PillOption
                  checked={languages.includes(lang)}
                  key={lang}
                  name="languages"
                  onChange={() => toggleLanguage(lang)}
                  size="lg"
                  value={lang}
                >
                  {lang}
                </PillOption>
              ))}
            </div>
          </div>

          {/* Patient groups — same pattern */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Main patient groups served
              </label>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => {
                  const allSelected = patientGroups.length === PATIENT_GROUPS.length;
                  const next = allSelected ? [] : [...PATIENT_GROUPS];
                  setPatientGroups(next);
                  autoSave({ patient_groups: next });
                }}
                type="button"
              >
                {patientGroups.length === PATIENT_GROUPS.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PATIENT_GROUPS.map((group) => (
                <PillOption
                  checked={patientGroups.includes(group)}
                  key={group}
                  name="patient_groups"
                  onChange={() => togglePatientGroup(group)}
                  size="lg"
                  value={group}
                >
                  {group}
                </PillOption>
              ))}
              <PillOption
                checked={otherGroupSelected}
                name="patient_groups_other"
                onChange={toggleOtherGroup}
                size="lg"
              >
                Other
              </PillOption>
            </div>
            {otherGroupSelected && (
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={otherGroupText}
                onBlur={(e) => saveOtherGroupText(e.target.value)}
                placeholder="Please specify"
                type="text"
              />
            )}
          </div>
        </div>
      </div>

      {validationError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {validationError}
        </p>
      )}

      <div className="flex items-center justify-end">
        <SubmitButton className="px-6" loadingText="Saving…">
          Save &amp; continue →
        </SubmitButton>
      </div>
    </form>
  );
}
