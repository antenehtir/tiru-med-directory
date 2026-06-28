"use client";

import { useState, useTransition } from "react";
import { saveStep1, autoSaveStep1 } from "@/app/provider/onboarding/identity/actions";
import {
  OWNERSHIP_TYPES,
  LANGUAGES,
  PATIENT_GROUPS,
} from "@/lib/provider/onboarding-config";

type Claim = Record<string, unknown>;

export function Step1IdentityForm({
  claim,
  facilityName,
}: {
  claim: Claim;
  facilityName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [name, setName] = useState((claim.proposed_name as string) ?? facilityName ?? "");
  const [altName, setAltName] = useState((claim.proposed_alt_name as string) ?? "");
  const [ownershipType, setOwnershipType] = useState(
    (claim.proposed_ownership_type as string) ?? "",
  );
  const [branchCount, setBranchCount] = useState(
    claim.proposed_branch_count != null ? String(claim.proposed_branch_count) : "",
  );
  const [description, setDescription] = useState((claim.proposed_description as string) ?? "");
  const [languages, setLanguages] = useState<string[]>(
    (claim.proposed_languages as string[]) ?? [],
  );
  const [patientGroups, setPatientGroups] = useState<string[]>(
    (claim.proposed_patient_groups as string[]) ?? [],
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

  return (
    <form action={saveStep1} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold text-foreground">Basic Identity</h2>
            <p className="text-sm text-muted-foreground">
              Tell patients who you are. Fields marked * are required.
            </p>
          </div>
          {lastSaved && (
            <p className="shrink-0 text-xs text-muted-foreground">
              Draft saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Official name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Official facility name *
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="name"
              name="name"
              onBlur={() => autoSave({ name })}
              onChange={(e) => setName(e.target.value)}
              required
              type="text"
              value={name}
            />
          </div>

          {/* Alt name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="alt_name">
              Common or alternative name
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="alt_name"
              name="alt_name"
              onBlur={() => autoSave({ alt_name: altName })}
              onChange={(e) => setAltName(e.target.value)}
              type="text"
              value={altName}
            />
          </div>

          {/* Ownership type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ownership_type">
              Ownership type
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="ownership_type"
              name="ownership_type"
              onChange={(e) => {
                setOwnershipType(e.target.value);
                autoSave({ ownership_type: e.target.value });
              }}
              value={ownershipType}
            >
              <option value="">Select…</option>
              {OWNERSHIP_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Branch count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="branch_count">
              Number of branches
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="branch_count"
              min="1"
              name="branch_count"
              onBlur={() =>
                autoSave({ branch_count: branchCount ? parseInt(branchCount, 10) : null })
              }
              onChange={(e) => setBranchCount(e.target.value)}
              type="number"
              value={branchCount}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="description">
              Short public description
            </label>
            <textarea
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="description"
              name="description"
              onBlur={() => autoSave({ description })}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              value={description}
            />
          </div>

          {/* Languages */}
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
                <label
                  key={lang}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    checked={languages.includes(lang)}
                    name="languages"
                    onChange={() => toggleLanguage(lang)}
                    type="checkbox"
                    value={lang}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>

          {/* Patient groups */}
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
                <label
                  key={group}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    checked={patientGroups.includes(group)}
                    name="patient_groups"
                    onChange={() => togglePatientGroup(group)}
                    type="checkbox"
                    value={group}
                  />
                  {group}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {isPending && (
          <span className="text-xs text-muted-foreground">Saving…</span>
        )}
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
