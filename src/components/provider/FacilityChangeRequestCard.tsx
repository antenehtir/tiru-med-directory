"use client";

import { useState, useTransition } from "react";
import {
  requestFacilityNameChange,
  requestFacilityTypeChange,
} from "@/app/provider/(console)/onboarding/identity/actions";
import {
  FACILITY_CATEGORY_CHOICES,
  resolveFacilityCategoryLabel,
} from "@/lib/frontend-search-filters";

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

type RequestState =
  | { phase: "idle" }
  | { phase: "sent" }
  | { phase: "unchanged" }
  | { phase: "error"; message: string };

// A verified provider's route to changing their facility's name or type.
//
// Every other part of the listing a provider edits directly. These two are
// different: the name is what a search result is trusted by, and the type
// decides which filter the facility appears under, so a change goes to a
// Tiru admin first (the correction_requests queue) and only an admin applies
// it. Migration 062 enforces the same thing at the database.
//
// The review itself is the existing requestFacilityNameChange /
// requestFacilityTypeChange path; this card is only the form in front of it.
export function FacilityChangeRequestCard({ facility }: { facility: Record<string, unknown> }) {
  const currentName = typeof facility.name === "string" ? facility.name : "";
  const currentType = resolveFacilityCategoryLabel(
    typeof facility.category === "string" ? facility.category : "",
    typeof facility.subcategory === "string" ? facility.subcategory : "",
  );

  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [reason, setReason] = useState("");
  const [state, setState] = useState<RequestState>({ phase: "idle" });

  const wantsName = newName.trim() !== "" && newName.trim() !== currentName;
  const wantsType = newType !== "" && newType !== currentType;
  const canSubmit = (wantsName || wantsType) && reason.trim() !== "" && !isPending;

  function submit() {
    setState({ phase: "idle" });
    startTransition(async () => {
      const results = [];
      if (wantsName) results.push(await requestFacilityNameChange(newName.trim(), reason.trim()));
      if (wantsType) results.push(await requestFacilityTypeChange(newType, reason.trim()));

      const failed = results.find((r) => r.status === "error");
      if (failed && failed.status === "error") {
        setState({ phase: "error", message: failed.message });
        return;
      }
      if (results.every((r) => r.status === "unchanged")) {
        setState({ phase: "unchanged" });
        return;
      }
      setState({ phase: "sent" });
      setNewName("");
      setNewType("");
      setReason("");
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-1 text-lg font-bold text-foreground">Name &amp; facility type</h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Listed as <span className="font-semibold text-foreground">{currentName || "—"}</span>
        {currentType ? ` · ${currentType}` : ""}. Changes to these are checked by the Tiru team
        before they appear on your listing.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="request_name">
            New name (if changing)
          </label>
          <input
            className={inputClass}
            id="request_name"
            onChange={(e) => setNewName(e.target.value)}
            placeholder={currentName}
            type="text"
            value={newName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="request_type">
            New facility type (if changing)
          </label>
          <select
            className={inputClass}
            id="request_type"
            onChange={(e) => setNewType(e.target.value)}
            value={newType}
          >
            <option value="">No change</option>
            {FACILITY_CATEGORY_CHOICES.filter((choice) => choice.label !== currentType).map((choice) => (
              <option key={choice.label} value={choice.label}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-foreground" htmlFor="request_reason">
            Reason *
          </label>
          <textarea
            className={inputClass}
            id="request_reason"
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. We rebranded in March, or the listing has a typo"
            rows={2}
            value={reason}
          />
        </div>
      </div>

      {state.phase === "error" && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {state.message}
        </p>
      )}
      {state.phase === "sent" && (
        <p className="mt-4 rounded-lg border border-success-border bg-success-bg px-4 py-2 text-sm text-success-text">
          Request sent. Your listing keeps its current name and type until the Tiru team applies the change.
        </p>
      )}
      {state.phase === "unchanged" && (
        <p className="mt-4 text-sm text-muted-foreground">That already matches your listing — nothing to request.</p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          disabled={!canSubmit}
          onClick={submit}
          type="button"
        >
          {isPending ? "Sending…" : "Send for review"}
        </button>
      </div>
    </div>
  );
}
