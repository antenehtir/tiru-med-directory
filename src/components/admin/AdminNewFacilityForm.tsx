"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createFacility, type CreateFacilityResult } from "@/app/admin/(protected)/facilities/new/actions";
import {
  FACILITY_CATEGORY_CHOICES,
  FACILITY_CATEGORY_OTHER_LABEL,
  resolveCategoryChoice,
} from "@/lib/frontend-search-filters";
import {
  ADDIS_SUB_CITIES,
  DIAGNOSTIC_SUBTYPE_OPTIONS,
  SPECIALTIES,
} from "@/lib/provider/onboarding-config";
import { PhoneNumberList } from "@/components/admin/PhoneNumberList";

const inputClass =
  "min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

// Sub-cities a facility can span. "Multiple" is the answer for a chain, and
// answering it opens the list below rather than ending the question there —
// the live data already stores these as "lideta / arada", so the tick boxes
// produce the format the rest of the app has always read.
const REAL_SUB_CITIES = ADDIS_SUB_CITIES.filter((s) => s !== "Multiple");

export function AdminNewFacilityForm() {
  const [state, formAction, isPending] = useActionState<CreateFacilityResult, FormData>(
    createFacility,
    undefined,
  );

  // Category drives which follow-up questions appear, so it is tracked here
  // rather than left to the form. The value held is the LABEL; the server
  // resolves it to the category actually stored.
  const [category, setCategory] = useState("");
  const [subCity, setSubCity] = useState("");
  const [subCities, setSubCities] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  const choice = resolveCategoryChoice(category);
  const isOther = category === FACILITY_CATEGORY_OTHER_LABEL;
  const isDiagnostic = choice?.stores === "Diagnostic Center";
  // Every label that files under a specialty bucket asks which specialties —
  // that covers Specialty Center, Multi-specialty, Medical Plaza and Medical
  // Complex without naming them one at a time.
  const isSpecialty =
    choice?.stores === "Specialty Center" || choice?.stores === "Medical Plaza";
  const isMultipleSubCity = subCity === "Multiple";

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

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
            {/* These are labels, not stored values. Each resolves to a category
                the filter map recognises — storing the label verbatim would
                publish a facility no browse filter can reach, which is how the
                live "Hospital" and "Telemedicine" rows became invisible. */}
            <select
              className={inputClass}
              id="category"
              name="category"
              onChange={(e) => setCategory(e.target.value)}
              required
              value={category}
            >
              <option value="">Select a category…</option>
              {FACILITY_CATEGORY_CHOICES.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
              <option value={FACILITY_CATEGORY_OTHER_LABEL}>
                {FACILITY_CATEGORY_OTHER_LABEL}
              </option>
            </select>
            {choice?.describesAs && (
              <p className="text-xs text-muted-foreground">
                Listed as “{choice.describesAs}”, and found under Specialty
                Center when someone browses.
              </p>
            )}
          </div>

          {isOther && (
            <div className="space-y-4 rounded-xl border border-border bg-background p-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="category_other">
                  Describe this facility *
                </label>
                <input
                  className={inputClass}
                  id="category_other"
                  name="category_other"
                  placeholder="e.g. Rehabilitation Centre"
                  required
                  type="text"
                />
                <p className="text-xs text-muted-foreground">
                  Shown on the listing as its description.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="category_behaves_as"
                >
                  Which of these does it work most like? *
                </label>
                {/* Browse has seven buckets and no eighth. Asking which one it
                    belongs in is the difference between a listing people can
                    find and one only search reaches. */}
                <select
                  className={inputClass}
                  defaultValue=""
                  id="category_behaves_as"
                  name="category_behaves_as"
                  required
                >
                  <option disabled value="">
                    Choose one…
                  </option>
                  {FACILITY_CATEGORY_CHOICES.filter((c) => !c.describesAs).map((c) => (
                    <option key={c.stores} value={c.stores}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {isSpecialty && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">Which specialties? *</p>
              <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
                Tick every one this facility offers — several is normal, and is
                what makes it multi-specialty. These become its first services,
                so the editor opens with them already selected.
              </p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((specialty) => {
                  const on = specialties.includes(specialty);
                  return (
                    <button
                      className={[
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:bg-muted",
                      ].join(" ")}
                      key={specialty}
                      onClick={() => setSpecialties((prev) => toggle(prev, specialty))}
                      type="button"
                    >
                      {specialty}
                    </button>
                  );
                })}
              </div>
              <input name="specialties" type="hidden" value={specialties.join("|")} />
              <div className="mt-3 flex flex-col gap-1.5">
                <label
                  className="text-xs font-medium text-muted-foreground"
                  htmlFor="specialty_other"
                >
                  Another specialty not listed
                </label>
                <input
                  className={inputClass}
                  id="specialty_other"
                  name="specialty_other"
                  placeholder="e.g. Sports Medicine"
                  type="text"
                />
              </div>
            </div>
          )}

          {isDiagnostic && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">
                What does this facility offer? *
              </p>
              <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
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
            <select
              className={inputClass}
              id="sub_city"
              name="sub_city"
              onChange={(e) => setSubCity(e.target.value)}
              value={subCity}
            >
              <option value="">Not known yet</option>
              {ADDIS_SUB_CITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {isMultipleSubCity && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">Which sub-cities?</p>
              <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
                Tick each one this facility has a site in. Saying only
                &ldquo;Multiple&rdquo; tells a patient nothing about whether one
                of them is near them.
              </p>
              <div className="flex flex-wrap gap-2">
                {REAL_SUB_CITIES.map((name) => {
                  const on = subCities.includes(name);
                  return (
                    <button
                      className={[
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:bg-muted",
                      ].join(" ")}
                      key={name}
                      onClick={() => setSubCities((prev) => toggle(prev, name))}
                      type="button"
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
              {/* Slash-separated, matching what the live rows already hold
                  ("lideta / arada") and what mapDBRowToFacility splits on. */}
              <input name="sub_cities" type="hidden" value={subCities.join(" / ")} />
              {subCities.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Saved as “{subCities.join(" / ")}”
                </p>
              )}
            </div>
          )}

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

          <PhoneNumberList
            help="The number a patient should call first comes at the top."
            label="Phone numbers"
            name="phones"
          />
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
