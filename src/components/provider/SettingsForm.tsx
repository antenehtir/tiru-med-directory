"use client";

import { useState, useTransition } from "react";
import { CLAIMANT_ROLES } from "@/lib/provider/onboarding-config";
import { updateAccountDetails, updatePassword } from "@/app/provider/(console)/settings/actions";
import { AutoSaveIndicator } from "@/components/provider/AutoSaveIndicator";
import { Spinner } from "@/components/provider/Spinner";

type ProviderAccountFields = {
  display_name: string | null;
  claimant_role: string | null;
  phone: string | null;
  facility_phone: string | null;
  email: string | null;
};

function isKnownRole(role: string | null): boolean {
  return !!role && (CLAIMANT_ROLES as readonly string[]).includes(role);
}

function AccountDetailsCard({ provider }: { provider: ProviderAccountFields }) {
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(provider.display_name ?? "");
  const [role, setRole] = useState(isKnownRole(provider.claimant_role) ? provider.claimant_role! : "Other");
  const [roleOther, setRoleOther] = useState(isKnownRole(provider.claimant_role) ? "" : provider.claimant_role ?? "");
  const [phone, setPhone] = useState(provider.phone ?? "");
  const [facilityPhone, setFacilityPhone] = useState(provider.facility_phone ?? "");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save(partial: Parameters<typeof updateAccountDetails>[0]) {
    setError(null);
    startTransition(async () => {
      const result = await updateAccountDetails(partial);
      if (result?.error) {
        setError(result.error);
      } else {
        setLastSaved(new Date());
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">Account details</h2>
        <AutoSaveIndicator isPending={isPending} lastSaved={lastSaved} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Display name
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onBlur={() => save({ display_name: displayName })}
            onChange={(e) => setDisplayName(e.target.value)}
            type="text"
            value={displayName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your role at this facility
          </label>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => {
              const next = e.target.value;
              setRole(next);
              if (next !== "Other") save({ claimant_role: next });
            }}
            value={role}
          >
            {CLAIMANT_ROLES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {role === "Other" && (
            <input
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              onBlur={() => save({ claimant_role: roleOther })}
              onChange={(e) => setRoleOther(e.target.value)}
              placeholder="Describe your role"
              type="text"
              value={roleOther}
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mobile number
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onBlur={() => save({ phone })}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            value={phone}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Facility phone
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onBlur={() => save({ facility_phone: facilityPhone })}
            onChange={(e) => setFacilityPhone(e.target.value)}
            type="tel"
            value={facilityPhone}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Work email
          </label>
          <input
            className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
            disabled
            readOnly
            type="email"
            value={provider.email ?? ""}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Contact support to change your login email.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ ok: false, text: "All fields are required." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ ok: false, text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ ok: false, text: "New password and confirmation do not match." });
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(currentPassword, newPassword);
      if (result?.error) {
        setMessage({ ok: false, text: result.error });
      } else {
        setMessage({ ok: true, text: "Password updated ✓" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-bold text-foreground">Change password</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current password
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setCurrentPassword(e.target.value)}
            type="password"
            value={currentPassword}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            New password
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            value={newPassword}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Confirm new password
          </label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            value={confirmPassword}
          />
        </div>

        {message && (
          <p
            className={
              message.ok
                ? "rounded-lg border border-success-border bg-success-bg px-3 py-2 text-sm text-success-text"
                : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
            }
          >
            {message.text}
          </p>
        )}

        <button
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <>
              <Spinner tone="on-primary" />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </div>
  );
}

export function SettingsForm({ provider }: { provider: ProviderAccountFields }) {
  return (
    <div className="space-y-6">
      <AccountDetailsCard provider={provider} />
      <ChangePasswordCard />
    </div>
  );
}
