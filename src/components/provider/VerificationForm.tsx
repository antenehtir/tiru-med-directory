"use client";

import { useState } from "react";
import { submitVerification } from "@/app/provider/onboarding/verify/actions";
import { submitClaim } from "@/app/provider/claim/actions";
import { SubmitButton } from "@/components/provider/SubmitButton";
import { CLAIMANT_ROLES } from "@/lib/provider/onboarding-config";

type ProviderData = {
  display_name: string;
  phone: string;
  email: string;
  claimant_role: string;
  claimant_role_other: string;
  claimant_phone: string;
  facility_official_phone_claimed: string;
  work_email: string;
};

// `claim` is the one-step form for claiming a facility already on Tiru: role
// and contact only, then the claim is submitted for verification. Without it
// this is the new-listing verification step exactly as before, which leads
// on into the onboarding wizard.
export function VerificationForm({
  facilityName,
  isNewListing,
  provider,
  mode = "verify",
}: {
  facilityName: string | null;
  isNewListing: boolean;
  provider: ProviderData;
  mode?: "verify" | "claim";
}) {
  const [role, setRole] = useState(provider.claimant_role);
  const isClaim = mode === "claim";

  return (
    <form action={isClaim ? submitClaim : submitVerification} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="space-y-4">
          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="claimant_role">
              Your role at {facilityName ?? "the facility"} *
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={provider.claimant_role}
              id="claimant_role"
              name="claimant_role"
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select your role…</option>
              {CLAIMANT_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Role other — only if "Other" selected */}
          {role === "Other" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="claimant_role_other">
                Please specify your role *
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={provider.claimant_role_other}
                id="claimant_role_other"
                name="claimant_role_other"
                placeholder="e.g. IT Coordinator"
                required
                type="text"
              />
            </div>
          )}

          {/* Claimant phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="claimant_phone">
              Your direct phone number *
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={provider.claimant_phone || provider.phone}
              id="claimant_phone"
              name="claimant_phone"
              placeholder="+251 ..."
              required
              type="tel"
            />
            <p className="text-xs text-muted-foreground">
              We may call this to confirm your identity.
            </p>
          </div>

          {/* Facility official phone — cross-check */}
          {/* Not asked on a claim: Tiru already has the facility's official
              number and calls that one — a number the claimant types in is
              the one thing that cannot be used to verify them. */}
          {!isNewListing && !isClaim && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="facility_official_phone_claimed">
                Facility&apos;s official phone number *
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={provider.facility_official_phone_claimed}
                id="facility_official_phone_claimed"
                name="facility_official_phone_claimed"
                placeholder="+251 ..."
                required
                type="tel"
              />
              <p className="text-xs text-muted-foreground">
                The main public number of the facility. We&apos;ll call this
                to verify your claim.
              </p>
            </div>
          )}

          {/* Work email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="work_email">
              Work email at the facility (if any)
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={provider.work_email}
              id="work_email"
              name="work_email"
              placeholder="you@facility.com"
              type="email"
            />
          </div>

          {/* Referral */}
          {!isClaim && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="referral_source">
              How did you hear your facility is on Tiru?
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="referral_source"
              name="referral_source"
              placeholder="Optional"
              type="text"
            />
          </div>
          )}
        </div>

        {!isClaim && (
          <div className="mt-5 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your listing will remain in review until our team verifies your
              details. You can complete your profile now — it goes live once approved.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {isClaim ? (
          <SubmitButton className="px-6" loadingText="Submitting…">
            Submit claim for verification
          </SubmitButton>
        ) : (
          <button
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            type="submit"
          >
            Submit & continue →
          </button>
        )}
      </div>
    </form>
  );
}
