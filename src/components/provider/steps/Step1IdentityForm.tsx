"use client";

import { saveStep1 } from "@/app/provider/onboarding/identity/actions";
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
  const defaultName = (claim.proposed_name as string) ?? facilityName ?? "";
  const defaultLanguages = (claim.proposed_languages as string[]) ?? [];
  const defaultGroups = (claim.proposed_patient_groups as string[]) ?? [];

  return (
    <form action={saveStep1} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">Basic Identity</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Tell patients who you are. Fields marked * are required.
        </p>

        <div className="space-y-4">
          {/* Official name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Official facility name *
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={defaultName}
              id="name"
              name="name"
              required
              type="text"
            />
          </div>

          {/* Alt name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="alt_name">
              Common or alternative name
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={(claim.proposed_alt_name as string) ?? ""}
              id="alt_name"
              name="alt_name"
              type="text"
            />
          </div>

          {/* Ownership type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="ownership_type">
              Ownership type
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={(claim.proposed_ownership_type as string) ?? ""}
              id="ownership_type"
              name="ownership_type"
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
              defaultValue={(claim.proposed_branch_count as number) ?? ""}
              id="branch_count"
              min="1"
              name="branch_count"
              type="number"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="description">
              Short public description
            </label>
            <textarea
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={(claim.proposed_description as string) ?? ""}
              id="description"
              name="description"
              rows={3}
            />
          </div>

          {/* Languages */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Languages supported
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <label
                  key={lang}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    defaultChecked={defaultLanguages.includes(lang)}
                    name="languages"
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
            <label className="text-sm font-medium text-foreground">
              Main patient groups served
            </label>
            <div className="flex flex-wrap gap-2">
              {PATIENT_GROUPS.map((group) => (
                <label
                  key={group}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    defaultChecked={defaultGroups.includes(group)}
                    name="patient_groups"
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

      <div className="flex justify-end">
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
