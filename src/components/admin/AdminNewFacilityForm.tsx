"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createFacility, type CreateFacilityResult } from "@/app/admin/(protected)/facilities/new/actions";
import { FACILITY_CATEGORY_OPTIONS } from "@/lib/frontend-search-filters";
import {
  ADDIS_SUB_CITIES,
  DIAGNOSTIC_SUBTYPE_OPTIONS,
} from "@/lib/provider/onboarding-config";

const inputClass =
  "min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

export function AdminNewFacilityForm() {
  const [state, formAction, isPending] = useActionState<CreateFacilityResult, FormData>(
    createFacility,
    undefined,
  );
  // Category drives whether the diagnostic question is asked at all, so it is
  // the one field this component tracks rather than leaving to the form.
  const [category, setCategory] = useState("");
  const isDiagnostic = category === "Diagnostic Center";

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">Identity</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Only what a listing cannot exist without. Services, contact details and
          the map pin come next, in the editor.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Facility name *
            </label>
            <input
              autoComplete="off"
              className={inputClass}
              id="name"
              name="name"
              placeholder="e.g. Bethel Medical Center"
              required
              type="text"
            />
            <p className="text-xs text-muted-foreground">
              Used for the public URL. Check it is not already listed first.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="category">
              Category *
            </label>
            {/* Straight from FACILITY_CATEGORY_OPTIONS, which is derived from
                FACILITY_CATEGORY_DB_MAP. A value outside that map publishes a
                facility that appears under no filter — the exact way the live
                "Hospital" and "Telemedicine" rows became invisible. */}
            <select
              className={inputClass}
              id="category"
              name="category"
              onChange={(e) => setCategory(e.target.value)}
              required
              value={category}
            >
              <option value="">Select a category…</option>
              {FACILITY_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {isDiagnostic && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">
                What does this facility offer? *
              </p>
              <p className="mt-0.5 mb-3 text-xs text-muted-foreground">
                Decides which service lists the editor shows. An imaging centre
                is not asked about blood panels.
              </p>
              <div className="flex flex-col gap-2">
                {DIAGNOSTIC_SUBTYPE_OPTIONS.map((opt) => (
                  <label
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                    key={opt.value}
                  >
                    <input name="diagnostic_subtype" required type="radio" value={opt.value} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">Where it is</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Enough to place it in the directory. The map pin is set in the
          Location tab, where the picker can resolve a Google Maps link.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="sub_city">
              Sub-city
            </label>
            <select className={inputClass} defaultValue="" id="sub_city" name="sub_city">
              <option value="">Not known yet</option>
              {ADDIS_SUB_CITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="area">
              Area / neighbourhood
            </label>
            <input
              className={inputClass}
              id="area"
              name="area"
              placeholder="e.g. Bole Medhanialem"
              type="text"
            />
            <p className="text-xs text-muted-foreground">
              The neighbourhood a patient would recognise.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="phone">
              Phone
            </label>
            <input
              className={inputClass}
              id="phone"
              name="phone"
              placeholder="+251 ..."
              type="tel"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        This creates a <strong>community-sourced</strong> listing — the badge for
        information gathered without the facility confirming it. There is no
        licence upload here, which is the one step a provider does that this
        does not. If the facility later claims and completes onboarding, the
        badge moves up on its own; it can never be moved back down.
      </div>

      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Creating…" : "Create and continue"}
        </button>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          href="/admin/facilities"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
