"use client";

import { useState, useTransition } from "react";
import { showToast } from "@/components/ui/Toaster";
import { updateFacilityCheckups } from "@/app/admin/(protected)/facilities/[id]/edit/actions";
import type { FacilityCheckupFields } from "@/lib/facility-edit/save-sections";
import { formatAddisTime } from "@/lib/addis-time";
import { Pill } from "@/components/ui/Pill";
import {
  CheckupPackageUploader,
  type CheckupPackage,
} from "@/components/provider/CheckupPackageUploader";

type Facility = Record<string, unknown>;

// Health-screening packages and their price lists. The same uploader the
// onboarding Services step uses; before this there was no way to change a
// live facility's packages at all, from either side. (The public facility
// page does not display these yet — they are collected and stored only.)
export function AdminFacilityCheckupsEditor({
  facility,
  saveAction = updateFacilityCheckups,
}: {
  facility: Facility;
  saveAction?: (facilityId: string, fields: FacilityCheckupFields) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storedPackages = Array.isArray(facility.checkup_packages)
    ? (facility.checkup_packages as CheckupPackage[])
    : [];
  const [offered, setOffered] = useState(facility.checkup_offered === true);
  const [packages, setPackages] = useState<CheckupPackage[]>(storedPackages);
  const [note, setNote] = useState(typeof facility.checkup_note === "string" ? facility.checkup_note : "");

  const [baseline, setBaseline] = useState({
    offered: facility.checkup_offered === true,
    packages: JSON.stringify(storedPackages),
    note: typeof facility.checkup_note === "string" ? facility.checkup_note : "",
  });

  function handleSave() {
    setError(null);
    const fields: FacilityCheckupFields = {};
    if (offered !== baseline.offered) fields.checkup_offered = offered;
    // Packages and the note are kept when "not offered" is chosen, so
    // switching back does not lose an uploaded price list.
    if (JSON.stringify(packages) !== baseline.packages) fields.checkup_packages = packages;
    if (note.trim() !== baseline.note) fields.checkup_note = note.trim() || null;

    if (Object.keys(fields).length === 0) {
      setError("Nothing to save — no changes were made in this section.");
      showToast("No changes to save", "info");
      return;
    }

    startTransition(async () => {
      try {
        await saveAction(facility.id as string, fields);
        setBaseline({ offered, packages: JSON.stringify(packages), note: note.trim() });
        setSavedAt(new Date());
        showToast("Saved — your changes are live");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to save.";
        setError(message);
        showToast(message, "error");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-lg font-bold text-foreground">General check-up packages</h2>
          <p className="text-sm text-muted-foreground">
            Health screening packages the facility offers, with their price lists.
          </p>
        </div>
        {savedAt && !isPending && (
          <span className="text-xs text-muted-foreground">Saved {formatAddisTime(savedAt)}</span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Pill
            ariaPressed={!offered}
            onClick={() => setOffered(false)}
            size="lg"
            variant={!offered ? "selected" : "default"}
          >
            No check-up packages
          </Pill>
          <Pill
            ariaPressed={offered}
            onClick={() => setOffered(true)}
            size="lg"
            variant={offered ? "selected" : "default"}
          >
            Yes, we offer check-up packages
          </Pill>
        </div>

        {offered && (
          <div className="space-y-3">
            <CheckupPackageUploader onChange={setPackages} value={packages} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="checkups_note">
                Short note about the packages (optional)
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                id="checkups_note"
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Packages include lab tests, ECG, and doctor consultation"
                type="text"
                value={note}
              />
            </div>
          </div>
        )}
      </div>

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
          {isPending ? "Saving…" : "Save Check-ups"}
        </button>
      </div>
    </div>
  );
}
