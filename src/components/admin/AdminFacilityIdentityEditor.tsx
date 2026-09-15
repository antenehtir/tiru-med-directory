"use client";

import { formatAddisTime } from "@/lib/addis-time";
import { useState, useTransition } from "react";
import { updateFacilityIdentity } from "@/app/admin/(protected)/facilities/[id]/edit/actions";
import {
  FACILITY_CATEGORY_CHOICES,
  FACILITY_CATEGORY_OTHER_LABEL,
  resolveFacilityCategoryLabel,
} from "@/lib/frontend-search-filters";
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
//
// The category list is the same FACILITY_CATEGORY_CHOICES the provider-side
// identity form and the admin's "new facility" form already use — Medical
// Plaza, Medical Complex and Multi-specialty Center included — plus a real
// free-typed Other, rather than the plainer 7-value stored-category list
// this editor used to offer. An admin correcting a listing's type deserves
// at least the choice a provider's own review request already has.
export function AdminFacilityIdentityEditor({ facility }: { facility: Facility }) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(str(facility.name));
  const storedCategory = str(facility.category);
  const storedSubcategory = str(facility.subcategory);
  const initialLabel = resolveFacilityCategoryLabel(storedCategory, storedSubcategory);

  const [categoryLabel, setCategoryLabel] = useState(initialLabel);
  const isOther = categoryLabel === FACILITY_CATEGORY_OTHER_LABEL;
  // Only pre-filled when the CURRENT state is itself an Other case — a
  // legacy category the taxonomy doesn't recognise, or nothing set at all.
  // A facility that already resolves to a curated label starts with these
  // blank; they only matter once Other is actually chosen.
  const [otherDescription, setOtherDescription] = useState(
    initialLabel === FACILITY_CATEGORY_OTHER_LABEL ? storedSubcategory || storedCategory : "",
  );
  const [otherBehavesAs, setOtherBehavesAs] = useState(
    initialLabel === FACILITY_CATEGORY_OTHER_LABEL &&
      FACILITY_CATEGORY_CHOICES.some((c) => c.stores === storedCategory && !c.describesAs)
      ? storedCategory
      : "",
  );

  // State, not a ref: this baseline is read during render (categoryChanged
  // below, which drives the Save button's disabled state), and
  // react-hooks/refs forbids reading ref.current there — a render triggered
  // by anything else could show a stale baseline. AdminFacilityLocationEditor
  // hit the same thing first and settled on state for the same reason.
  const [initial, setInitial] = useState({
    name: str(facility.name),
    category: storedCategory,
    subcategory: storedSubcategory,
  });

  const nameChanged = name.trim() !== initial.name;

  // What the current selection actually resolves to — category always,
  // subcategory only when this specific choice has something to say about
  // it. undefined means "leave subcategory alone": most facilities use it as
  // their own free-text description, unrelated to the describesAs taxonomy,
  // and switching between two plain categories (Clinic -> Diagnostic Center,
  // say) has no business overwriting that.
  function resolvedFields(): { category: string; subcategory: string | undefined } | null {
    if (isOther) {
      if (!otherDescription.trim() || !otherBehavesAs) return null;
      return { category: otherBehavesAs, subcategory: otherDescription.trim() };
    }
    const choice = FACILITY_CATEGORY_CHOICES.find((c) => c.label === categoryLabel);
    if (!choice) return null;
    return { category: choice.stores, subcategory: choice.describesAs };
  }

  const resolved = resolvedFields();
  const categoryChanged =
    resolved !== null &&
    (resolved.category !== initial.category ||
      (resolved.subcategory !== undefined && resolved.subcategory !== initial.subcategory));
  const isDirty = nameChanged || categoryChanged;

  function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Facility name is required.");
      return;
    }
    if (isOther && (!otherDescription.trim() || !otherBehavesAs)) {
      setError("Describe the facility and choose which category it works most like.");
      return;
    }

    const fields: Record<string, unknown> = {};
    if (nameChanged) fields.name = name.trim();
    if (categoryChanged && resolved) {
      fields.category = resolved.category;
      if (resolved.subcategory !== undefined) fields.subcategory = resolved.subcategory;
    }

    if (Object.keys(fields).length === 0) {
      setError("Nothing to save — no changes were made in this section.");
      return;
    }

    startTransition(async () => {
      try {
        await updateFacilityIdentity(facility.id as string, fields);
        setInitial({
          name: name.trim(),
          category: resolved?.category ?? initial.category,
          subcategory: resolved?.subcategory ?? initial.subcategory,
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
          <h2 className="mb-1 text-lg font-bold text-foreground">Identity</h2>
          <p className="text-sm text-muted-foreground">
            The facility&apos;s name and category — change these when a listing
            rebrands, or its scope genuinely changes (a clinic that adds beds
            and becomes a hospital, for instance).
          </p>
        </div>
        {savedAt && !isPending && (
          <span className="text-xs text-muted-foreground">Saved {formatAddisTime(savedAt)}</span>
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
            onChange={(e) => setCategoryLabel(e.target.value)}
            value={categoryLabel}
          >
            <option value="">Select…</option>
            {FACILITY_CATEGORY_CHOICES.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
            <option value={FACILITY_CATEGORY_OTHER_LABEL}>{FACILITY_CATEGORY_OTHER_LABEL}</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Changing this moves the listing to a different section of the
            directory (browse categories, filters, the badge on its card). It
            does not change the services already on file — review the
            Services & Specialties tab afterward if the new category expects
            a different checklist.
          </p>
        </div>

        {isOther && (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:col-span-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_identity_category_other">
                Describe this facility
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="admin_identity_category_other"
                onChange={(e) => setOtherDescription(e.target.value)}
                placeholder="e.g. Rehabilitation Centre"
                type="text"
                value={otherDescription}
              />
              <p className="text-xs text-muted-foreground">Shown on the listing as its description.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="admin_identity_category_behaves_as">
                Which of these does it work most like?
              </label>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="admin_identity_category_behaves_as"
                onChange={(e) => setOtherBehavesAs(e.target.value)}
                value={otherBehavesAs}
              >
                <option value="">Choose one…</option>
                {FACILITY_CATEGORY_CHOICES.filter((c) => !c.describesAs).map((c) => (
                  <option key={c.stores} value={c.stores}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Browse has a fixed set of buckets — this decides which one the listing files under.
              </p>
            </div>
          </div>
        )}
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
