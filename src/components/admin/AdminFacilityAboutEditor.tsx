"use client";

import { useState, useTransition } from "react";
import { updateFacilityAbout } from "@/app/admin/(protected)/facilities/[id]/edit/actions";
import type { FacilityAboutFields } from "@/lib/facility-edit/save-sections";
import { formatAddisTime } from "@/lib/addis-time";
import { LANGUAGES, OWNERSHIP_TYPES, PATIENT_GROUPS } from "@/lib/provider/onboarding-config";
import { Pill } from "@/components/ui/Pill";
import { FieldGrid, FIELD_GRID_FULL } from "@/components/ui/FieldGrid";

type Facility = Record<string, unknown>;

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// Pills for a fixed vocabulary, plus any stored value outside it.
//
// Facilities carry languages and patient groups typed before these lists
// existed, or entered under "Other". A pill row built only from the list
// would not show them, and the next save would quietly drop them — so they
// render as selected pills of their own and are removed only when someone
// deselects them.
function PillList({
  options,
  selected,
  onChange,
  allowOther,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  allowOther?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const extras = selected.filter((v) => !options.includes(v));

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  function addDraft() {
    const value = draft.trim();
    if (!value || selected.includes(value)) return;
    onChange([...selected, value]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {[...options, ...extras].map((option) => (
          <Pill
            ariaPressed={selected.includes(option)}
            key={option}
            onClick={() => toggle(option)}
            variant={selected.includes(option) ? "selected" : "default"}
          >
            {option}
          </Pill>
        ))}
      </div>
      {allowOther && (
        <div className="flex gap-2">
          <input
            className={`${inputClass} flex-1`}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDraft();
              }
            }}
            placeholder="Add another…"
            type="text"
            value={draft}
          />
          <button
            className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
            disabled={!draft.trim()}
            onClick={addDraft}
            type="button"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

// The descriptive half of a listing: what the facility calls itself besides
// its official name, who runs it, what it says about itself, which languages
// it serves patients in and who it serves, and how to get in the door.
//
// None of this had an editor outside onboarding, so once a listing was live
// an admin could not correct any of it, and a verified provider editing their
// own listing would have lost it. It sits in the shared editor for both.
export function AdminFacilityAboutEditor({
  facility,
  saveAction = updateFacilityAbout,
}: {
  facility: Facility;
  saveAction?: (facilityId: string, fields: FacilityAboutFields) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [altName, setAltName] = useState(str(facility.alt_name));
  const [ownership, setOwnership] = useState(str(facility.ownership_type));
  const [description, setDescription] = useState(str(facility.description));
  const [languages, setLanguages] = useState(list(facility.languages));
  const [patientGroups, setPatientGroups] = useState(list(facility.patient_groups));
  const [accessNotes, setAccessNotes] = useState(str(facility.access_notes));

  // What the section was opened on. Only fields that differ from it are sent,
  // so an untouched field keeps whatever is live — the same rule every other
  // section in this editor follows.
  const [baseline, setBaseline] = useState({
    alt_name: str(facility.alt_name),
    ownership_type: str(facility.ownership_type),
    description: str(facility.description),
    languages: list(facility.languages),
    patient_groups: list(facility.patient_groups),
    access_notes: str(facility.access_notes),
  });

  // A stored ownership value outside the list stays selectable, so opening
  // the section does not silently switch it to the first option.
  const ownershipOptions =
    ownership && !(OWNERSHIP_TYPES as readonly string[]).includes(ownership)
      ? [ownership, ...OWNERSHIP_TYPES]
      : [...OWNERSHIP_TYPES];

  function handleSave() {
    setError(null);
    const fields: FacilityAboutFields = {};
    if (altName.trim() !== baseline.alt_name) fields.alt_name = altName.trim() || null;
    if (ownership !== baseline.ownership_type) fields.ownership_type = ownership || null;
    if (description.trim() !== baseline.description) fields.description = description.trim() || null;
    if (!sameList(languages, baseline.languages)) fields.languages = languages;
    if (!sameList(patientGroups, baseline.patient_groups)) fields.patient_groups = patientGroups;
    if (accessNotes.trim() !== baseline.access_notes) fields.access_notes = accessNotes.trim() || null;

    if (Object.keys(fields).length === 0) {
      setError("Nothing to save — no changes were made in this section.");
      return;
    }

    startTransition(async () => {
      try {
        await saveAction(facility.id as string, fields);
        setBaseline({
          alt_name: altName.trim(),
          ownership_type: ownership,
          description: description.trim(),
          languages,
          patient_groups: patientGroups,
          access_notes: accessNotes.trim(),
        });
        setSavedAt(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-lg font-bold text-foreground">About this facility</h2>
          <p className="text-sm text-muted-foreground">
            What patients read about the facility before they visit.
          </p>
        </div>
        {savedAt && !isPending && (
          <span className="text-xs text-muted-foreground">Saved {formatAddisTime(savedAt)}</span>
        )}
      </div>

      <FieldGrid>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="about_alt_name">
            Also known as
          </label>
          <input
            className={inputClass}
            id="about_alt_name"
            onChange={(e) => setAltName(e.target.value)}
            placeholder="A name patients also use"
            type="text"
            value={altName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="about_ownership">
            Ownership
          </label>
          <select
            className={inputClass}
            id="about_ownership"
            onChange={(e) => setOwnership(e.target.value)}
            value={ownership}
          >
            <option value="">Not stated</option>
            {ownershipOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={`flex flex-col gap-1.5 ${FIELD_GRID_FULL}`}>
          <label className="text-sm font-medium text-foreground" htmlFor="about_description">
            Short public description
          </label>
          <textarea
            className={inputClass}
            id="about_description"
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What the facility does, in a sentence or two."
            rows={3}
            value={description}
          />
        </div>

        <div className={`flex flex-col gap-1.5 ${FIELD_GRID_FULL}`}>
          <p className="text-sm font-medium text-foreground">Languages spoken with patients</p>
          <PillList onChange={setLanguages} options={LANGUAGES} selected={languages} />
        </div>

        <div className={`flex flex-col gap-1.5 ${FIELD_GRID_FULL}`}>
          <p className="text-sm font-medium text-foreground">Patients served</p>
          <PillList
            allowOther
            onChange={setPatientGroups}
            options={PATIENT_GROUPS}
            selected={patientGroups}
          />
        </div>

        <div className={`flex flex-col gap-1.5 ${FIELD_GRID_FULL}`}>
          <label className="text-sm font-medium text-foreground" htmlFor="about_access_notes">
            Access notes
          </label>
          <textarea
            className={inputClass}
            id="about_access_notes"
            onChange={(e) => setAccessNotes(e.target.value)}
            placeholder="Parking, entrance, accessibility…"
            rows={2}
            value={accessNotes}
          />
        </div>
      </FieldGrid>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
          onClick={handleSave}
          type="button"
        >
          {isPending ? "Saving…" : "Save About"}
        </button>
      </div>
    </div>
  );
}
