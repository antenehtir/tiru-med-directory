"use client";

import { useState, useTransition } from "react";
import { updateFacilityIdentity } from "@/app/admin/(protected)/facilities/[id]/edit/actions";
import { FACILITY_CATEGORY_OPTIONS } from "@/lib/frontend-search-filters";
import { FieldGrid } from "@/components/ui/FieldGrid";

type Facility = Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// Name and category — the two facts about a listing that used to have
// nowhere to be corrected once the row existed. A facility's name changes
// when it rebrands or a typo from the original import needs fixing; its
// category changes when a clinic adds beds and becomes a hospital, or a
// specialty centre narrows down to one thing and becomes a diagnostic lab.
// Kept as its own tab rather than folded into Location or Services &
// Specialties: those already commit an admin to one existing mental model
// each, and this section governs both of them at once.
export function AdminFacilityIdentityEditor({ facility }: { facility: Facility }) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(str(facility.name));
  const storedCategory = str(facility.category);
  const [category, setCategory] = useState(storedCategory);

  // Same reasoning as AdminFacilityLocationEditor's sub-city select: a
  // stored category value that isn't in the canonical list (an old import
  // synonym like "Healthcare Financing" or "Telemedicine") is kept as its
  // own option rather than silently dropped, so the select shows what is
  // actually live instead of defaulting to the first canonical entry.
  const isCanonicalCategory = (FACILITY_CATEGORY_OPTIONS as readonly string[]).includes(storedCategory);
  const categoryOptions = isCanonicalCategory || !storedCategory
    ? [...FACILITY_CATEGORY_OPTIONS]
    : [storedCategory, ...FACILITY_CATEGORY_OPTIONS];

  // State, not a ref: this baseline is read during render (nameChanged/
  // categoryChanged below, which drive the Save button's disabled state), and
  // react-hooks/refs forbids reading ref.current there — a render triggered
  // by anything else could show a stale baseline. AdminFacilityLocationEditor
  // hit the same thing first and settled on state for the same reason.
  const [initial, setInitial] = useState({ name: str(facility.name), category: storedCategory });

  const nameChanged = name.trim() !== initial.name;
  const categoryChanged = category !== initial.category;
  const isDirty = nameChanged || categoryChanged;

  function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Facility name is required.");
      return;
    }

    const fields: Record<string, unknown> = {};
    if (nameChanged) fields.name = name.trim();
    if (categoryChanged) fields.category = category;

    if (Object.keys(fields).length === 0) {
      setError("Nothing to save — no changes were made in this section.");
      return;
    }

    startTransition(async () => {
      try {
        await updateFacilityIdentity(facility.id as string, fields);
        setInitial({ name: name.trim(), category });
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
          <h2 className="mb-1 text-lg font-bold text-foreground">Identity</h2>
          <p className="text-sm text-muted-foreground">
            The facility&apos;s name and category — change these when a listing
            rebrands, or its scope genuinely changes (a clinic that adds beds
            and becomes a hospital, for instance).
          </p>
        </div>
        {savedAt && !isPending && (
          <span className="text-xs text-muted-foreground">Saved {savedAt.toLocaleTimeString()}</span>
        )}
      </div>

      <FieldGrid>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="admin_identity_name">
            Facility name
          </label>
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="admin_identity_name"
            onChange={(e) => setName(e.target.value)}
            type="text"
            value={name}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="admin_identity_category">
            Facility category
          </label>
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            id="admin_identity_category"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
                {option === storedCategory && !isCanonicalCategory ? "  (current value)" : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Changing this moves the listing to a different section of the
            directory (browse categories, filters, the badge on its card). It
            does not change the services already on file — review the
            Services & Specialties tab afterward if the new category expects
            a different checklist.
          </p>
          {!isCanonicalCategory && storedCategory ? (
            <p className="text-xs text-muted-foreground">
              &ldquo;{storedCategory}&rdquo; is not one of the standard categories. It
              is kept as an option so saving does not overwrite it unless you
              deliberately pick something else.
            </p>
          ) : null}
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
          disabled={isPending || !isDirty}
          onClick={handleSave}
          type="button"
        >
          {isPending ? "Saving…" : "Save Identity"}
        </button>
      </div>
    </div>
  );
}
