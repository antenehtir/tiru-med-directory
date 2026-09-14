"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  saveStep1,
  autoSaveStep1,
  requestFacilityNameChange,
  requestFacilityTypeChange,
} from "@/app/provider/(console)/onboarding/identity/actions";
import { AutoSaveIndicator } from "@/components/provider/AutoSaveIndicator";
import { PillOption } from "@/components/provider/PillOption";
import { SubmitButton } from "@/components/provider/SubmitButton";
import {
  OWNERSHIP_TYPES,
  LANGUAGES,
  PATIENT_GROUPS,
} from "@/lib/provider/onboarding-config";
import { FACILITY_CATEGORY_CHOICES } from "@/lib/frontend-search-filters";
import { FieldGrid } from "@/components/ui/FieldGrid";

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
  // Once a claim is approved and pointed at a live facility, its name and
  // type stop being direct edits on this page — see requestFacilityNameChange
  // / requestFacilityTypeChange for why. Before that, this is still a draft
  // nobody but the provider has seen, so both fields behave exactly as every
  // other field on this page does.
  const isLive = claim.status === "approved" && Boolean(claim.facility_id);
  const [nameChangeRequest, setNameChangeRequest] = useState("");
  const [nameChangeReason, setNameChangeReason] = useState("");
  const [nameChangeState, setNameChangeState] = useState<
    { phase: "idle" } | { phase: "sending" } | { phase: "sent" } | { phase: "error"; message: string }
  >({ phase: "idle" });
  // A reason is required once the listing is live (requestFacilityTypeChange
  // enforces this server-side too) — so picking a new type does not submit
  // it immediately the way it used to; it stages the choice and asks why
  // before the "Submit request" button becomes usable.
  const [facilityTypeReason, setFacilityTypeReason] = useState("");
  const [facilityTypeState, setFacilityTypeState] = useState<
    | { phase: "idle" }
    | { phase: "sending" }
    | { phase: "saved" }
    | { phase: "sent" }
    | { phase: "error"; message: string }
  >({ phase: "idle" });
  // Not one of proposed_*'s fields — facility_type lives on provider_accounts,
  // so it is saved through its own action (requestFacilityTypeChange) rather
  // than the autoSave() wrapper every other field on this page uses.
  //
  // What's stored (facilityType) is the CANONICAL value ("Specialty Center"),
  // which is not enough on its own to know which select option to show —
  // "Medical Complex" and "Multi-specialty Center" both store as "Specialty
  // Center" too. facilityTypeOther disambiguates: when it matches a choice's
  // describesAs, that choice's own label is the one actually picked.
  function currentFacilityTypeLabel(): string {
    if (!facilityType) return "";
    if (facilityTypeOther) {
      const describedChoice = FACILITY_CATEGORY_CHOICES.find((c) => c.describesAs === facilityTypeOther);
      if (describedChoice) return describedChoice.label;
    }
    const plainChoice = FACILITY_CATEGORY_CHOICES.find((c) => c.stores === facilityType && !c.describesAs);
    return plainChoice?.label ?? facilityType;
  }
  const [selectedFacilityType, setSelectedFacilityType] = useState(currentFacilityTypeLabel());

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

        <FieldGrid>
          {/* Facility type. Before the first approval this is still the
              same free choice signup itself offers — nothing public exists
              yet to protect. Once live, selecting a new value no longer
              applies it directly: it submits a review request (the same
              correction_requests queue an anonymous "Suggest a correction"
              lands in) and only a super admin's own edit actually moves the
              category. Scoped to the same fixed choices signup itself
              offers — switching to a free-text "Other" type is left for
              support to handle by hand either way. */}
          {facilityType && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-3 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-foreground" htmlFor="facility_type_select">
                  Facility type
                </label>
                {facilityTypeState.phase === "saved" ? (
                  <span className="text-xs text-muted-foreground">Saved</span>
                ) : facilityTypeState.phase === "sent" ? (
                  <span className="text-xs font-medium text-primary">Change requested</span>
                ) : null}
              </div>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="facility_type_select"
                onChange={(e) => {
                  const label = e.target.value;
                  setSelectedFacilityType(label);
                  setFacilityTypeState({ phase: "idle" });
                  // Before approval there is nothing to review yet — this is
                  // still the same free choice signup itself offers, so it
                  // still applies the moment it's picked. Once live, picking
                  // a value only stages it; a reason is required below
                  // before "Submit request" does anything.
                  if (!isLive) {
                    startTransition(async () => {
                      const result = await requestFacilityTypeChange(label, "");
                      setFacilityTypeState(
                        result.status === "error" ? { phase: "error", message: result.message } : { phase: "saved" },
                      );
                    });
                  }
                }}
                value={selectedFacilityType}
              >
                {!FACILITY_CATEGORY_CHOICES.some((c) => c.label === selectedFacilityType) && selectedFacilityType ? (
                  <option value={selectedFacilityType}>{selectedFacilityType}</option>
                ) : null}
                {FACILITY_CATEGORY_CHOICES.map((choice) => (
                  <option key={choice.label} value={choice.label}>
                    {choice.label}
                  </option>
                ))}
              </select>

              {isLive && selectedFacilityType !== currentFacilityTypeLabel() ? (
                <div className="mt-1 flex flex-col gap-1.5 rounded-lg border border-dashed border-primary/30 bg-card p-3">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="facility_type_reason">
                    Reason for this change *
                  </label>
                  <textarea
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    id="facility_type_reason"
                    onChange={(e) => setFacilityTypeReason(e.target.value)}
                    placeholder="Why does this listing need to change type — e.g. we added inpatient beds and now operate as a hospital"
                    rows={2}
                    value={facilityTypeReason}
                  />
                  <button
                    className="self-start rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!facilityTypeReason.trim() || facilityTypeState.phase === "sending"}
                    onClick={() => {
                      setFacilityTypeState({ phase: "sending" });
                      startTransition(async () => {
                        const result = await requestFacilityTypeChange(selectedFacilityType, facilityTypeReason);
                        if (result.status === "error") {
                          setFacilityTypeState({ phase: "error", message: result.message });
                        } else {
                          setFacilityTypeState({ phase: "sent" });
                          setFacilityTypeReason("");
                        }
                      });
                    }}
                    type="button"
                  >
                    {facilityTypeState.phase === "sending" ? "Sending…" : "Submit request"}
                  </button>
                </div>
              ) : null}

              {facilityTypeState.phase === "error" ? (
                <p className="text-xs font-medium text-error">{facilityTypeState.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {isLive
                    ? "Your listing is live, so this doesn't change immediately — it sends the new type to Tiru for review, with your reason, and an admin applies it once they've confirmed it."
                    : "Changing this moves your listing to a different section of the directory once it's approved. It does not change the services you have already listed — worth a check afterward if the new type expects a different checklist."}
                </p>
              )}
            </div>
          )}

          {/* Official name. Same isLive split as facility type above: still
              a plain editable field before the first approval (defaultName,
              uncontrolled, autosaved to the draft like every other field
              here), but once the listing is public a name change goes
              through the same review queue rather than applying the moment
              someone stops typing — a wrong or malicious rename is a bigger
              risk unreviewed than a wrong opening-hours edit would be. */}
          {isLive ? (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Official facility name</label>
              <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                {facilityName}
              </p>
              <div className="mt-1 flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="name_change_request">
                  Request a different name
                </label>
                <input
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  id="name_change_request"
                  onChange={(e) => setNameChangeRequest(e.target.value)}
                  placeholder="New name for this listing"
                  type="text"
                  value={nameChangeRequest}
                />
                {nameChangeRequest.trim() ? (
                  <div className="flex flex-col gap-1.5 rounded-lg border border-dashed border-primary/30 bg-card p-3">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="name_change_reason">
                      Reason for this change *
                    </label>
                    <textarea
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      id="name_change_reason"
                      onChange={(e) => setNameChangeReason(e.target.value)}
                      placeholder="Why does this listing need a different name — e.g. rebrand, or a typo from when it was first added"
                      rows={2}
                      value={nameChangeReason}
                    />
                    <button
                      className="self-start rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!nameChangeReason.trim() || nameChangeState.phase === "sending"}
                      onClick={() => {
                        const requested = nameChangeRequest.trim();
                        setNameChangeState({ phase: "sending" });
                        startTransition(async () => {
                          const result = await requestFacilityNameChange(requested, nameChangeReason);
                          if (result.status === "error") {
                            setNameChangeState({ phase: "error", message: result.message });
                          } else {
                            setNameChangeState({ phase: "sent" });
                            setNameChangeRequest("");
                            setNameChangeReason("");
                          }
                        });
                      }}
                      type="button"
                    >
                      {nameChangeState.phase === "sending" ? "Sending…" : "Submit request"}
                    </button>
                  </div>
                ) : null}
                <p className={`text-xs ${nameChangeState.phase === "error" ? "font-medium text-error" : "text-muted-foreground"}`}>
                  {nameChangeState.phase === "error"
                    ? nameChangeState.message
                    : nameChangeState.phase === "sent"
                      ? "Sent to Tiru for review. Your listing keeps its current name until an admin applies the change."
                      : "Sends the new name to Tiru for review — it does not change immediately."}
                </p>
              </div>
            </div>
          ) : (
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
          )}

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
          <div className="flex flex-col gap-3 sm:col-span-2">
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
          <div className="flex flex-col gap-1.5 sm:col-span-2">
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
          <div className="flex flex-col gap-2 sm:col-span-2">
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
          <div className="flex flex-col gap-2 sm:col-span-2">
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
        </FieldGrid>
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
