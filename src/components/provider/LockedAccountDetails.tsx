"use client";

import { useState, useTransition } from "react";
import { requestAccountChange, type AccountChangeField } from "@/app/provider/(console)/settings/actions";
import { CLAIMANT_ROLES } from "@/lib/provider/onboarding-config";
import { formatAddisDate } from "@/lib/addis-time";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { phoneError } from "@/lib/phone";
import { showToast } from "@/components/ui/Toaster";

export type AccountChangeRequest = {
  id: string;
  field: AccountChangeField;
  requested_value: string;
  status: "pending" | "approved" | "declined";
  created_at: string;
  admin_note: string | null;
};

type Details = {
  display_name: string | null;
  claimant_role: string | null;
  phone: string | null;
  facility_phone: string | null;
  email: string | null;
};

const FIELDS: Array<{ key: AccountChangeField; label: string }> = [
  { key: "display_name", label: "Display name" },
  { key: "claimant_role", label: "Your role at this facility" },
  { key: "phone", label: "Mobile number" },
  { key: "facility_phone", label: "Facility phone" },
];

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const STATUS_LABEL: Record<AccountChangeRequest["status"], string> = {
  pending: "Waiting for Tiru Health",
  approved: "Approved",
  declined: "Declined",
};

// Account details after submission. They are what Tiru checked when it
// verified the listing, so they are shown read-only; a change is sent to the
// Tiru team with a reason and applied once an admin approves it.
export function LockedAccountDetails({ provider, requests }: { provider: Details; requests: AccountChangeRequest[] }) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<AccountChangeField>("phone");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingFields = new Set(requests.filter((r) => r.status === "pending").map((r) => r.field));
  const isPhone = field === "phone" || field === "facility_phone";
  const valueProblem = isPhone ? phoneError(value, field === "phone" ? "personal" : "facility") : null;

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await requestAccountChange(field, value, reason);
      if ("error" in result) {
        setError(result.error);
        showToast(result.error, "error");
        return;
      }
      showToast("Request sent — Tiru Health will review it");
      setOpen(false);
      setValue("");
      setReason("");
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-foreground">Account details</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These were confirmed when your listing was reviewed. To change one, send a request and the Tiru Health team will
        update it.
      </p>

      <dl className="mt-4 divide-y divide-border rounded-xl border border-border">
        {FIELDS.map(({ key, label }) => (
          <div className="flex items-start justify-between gap-3 px-4 py-3" key={key}>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 break-words text-sm text-foreground">{provider[key] || "—"}</dd>
            </div>
            {pendingFields.has(key) && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                Change requested
              </span>
            )}
          </div>
        ))}
        <div className="px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work email</dt>
          <dd className="mt-0.5 break-words text-sm text-foreground">{provider.email || "—"}</dd>
          <p className="mt-1 text-xs text-muted-foreground">Contact support to change your login email.</p>
        </div>
      </dl>

      {!open ? (
        <button
          className="mt-4 flex min-h-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
          onClick={() => setOpen(true)}
          type="button"
        >
          Request a change
        </button>
      ) : (
        <div className="mt-4 space-y-4 rounded-xl border border-border bg-background p-4">
          <div>
            <label className={labelClass} htmlFor="change_field">
              What needs changing?
            </label>
            <select
              className={inputClass}
              id="change_field"
              onChange={(e) => {
                setField(e.target.value as AccountChangeField);
                setValue("");
                setError(null);
              }}
              value={field}
            >
              {FIELDS.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass.replace("mb-1.5 ", "")} htmlFor="change_value">
              New value
            </label>
            {isPhone ? (
              <PhoneInput
                className={inputClass}
                id="change_value"
                key={field}
                kind={field === "phone" ? "personal" : "facility"}
                onChange={(e) => setValue(e.target.value)}
                value={value}
              />
            ) : field === "claimant_role" ? (
              <select className={inputClass} id="change_value" onChange={(e) => setValue(e.target.value)} value={value}>
                <option value="">Select your role</option>
                {CLAIMANT_ROLES.filter((role) => role !== "Other").map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputClass}
                id="change_value"
                onChange={(e) => setValue(e.target.value)}
                type="text"
                value={value}
              />
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="change_reason">
              Why is it changing?
            </label>
            <textarea
              className={inputClass}
              id="change_reason"
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. I changed my phone number"
              rows={2}
              value={reason}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending || !value.trim() || !reason.trim() || Boolean(valueProblem)}
              onClick={submit}
              type="button"
            >
              {isPending ? "Sending…" : "Send request"}
            </button>
            <button
              className="flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {requests.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your requests</p>
          <ul className="mt-2 space-y-2">
            {requests.map((request) => (
              <li className="rounded-xl border border-border px-4 py-3 text-sm" key={request.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 break-words text-foreground">
                    {FIELDS.find((f) => f.key === request.field)?.label ?? request.field} →{" "}
                    <span className="font-semibold">{request.requested_value}</span>
                  </p>
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      request.status === "approved"
                        ? "text-success-text"
                        : request.status === "declined"
                          ? "text-[var(--error)]"
                          : "text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABEL[request.status]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Sent {formatAddisDate(request.created_at)}</p>
                {request.admin_note && <p className="mt-1 text-xs text-muted-foreground">Tiru Health: {request.admin_note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
