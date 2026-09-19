"use client";

import { useState, useTransition } from "react";
import { decideAccountChange } from "@/app/admin/(protected)/claims/actions";
import { formatAddisDateTime } from "@/lib/addis-time";
import { showToast } from "@/components/ui/Toaster";

export type AccountChange = {
  id: string;
  field: string;
  current_value: string | null;
  requested_value: string;
  reason: string;
  created_at: string;
  provider: { display_name: string | null; email: string | null; facility_name: string | null } | null;
};

const FIELD_LABELS: Record<string, string> = {
  display_name: "Display name",
  claimant_role: "Role",
  phone: "Mobile number",
  facility_phone: "Facility phone",
};

// Requests from submitted or verified providers to change their name, role
// or a phone number. Approving writes the new value to their account.
export function AdminAccountChangeList({ changes }: { changes: AccountChange[] }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<Record<string, string>>({});

  function decide(change: AccountChange, approve: boolean) {
    const label = FIELD_LABELS[change.field] ?? change.field;
    const question = approve
      ? `Change ${label.toLowerCase()} to "${change.requested_value}"?`
      : `Decline this ${label.toLowerCase()} change?`;
    if (!confirm(question)) return;
    startTransition(async () => {
      const result = await decideAccountChange(change.id, approve, notes[change.id] ?? "");
      if (result?.error) showToast(result.error, "error");
      else showToast(approve ? "Change approved and applied" : "Request declined");
    });
  }

  if (changes.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-lg font-semibold text-foreground">No account changes waiting</p>
        <p className="mt-1 text-sm text-muted-foreground">
          When a provider asks to change their name, role or phone number, the request appears here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {changes.map((change) => {
        const label = FIELD_LABELS[change.field] ?? change.field;
        const isPhone = change.field === "phone" || change.field === "facility_phone";
        return (
          <div className="rounded-2xl border border-border bg-card p-5" key={change.id}>
            <p className="font-bold text-foreground">{change.provider?.facility_name?.trim() || "Provider account"}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {change.provider?.display_name ?? "—"} · {change.provider?.email ?? "—"} ·{" "}
              {formatAddisDateTime(change.created_at)}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">{label.toUpperCase()} NOW</p>
                <p className="mt-1 break-words text-sm text-foreground">{change.current_value || "—"}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">REQUESTED</p>
                {isPhone ? (
                  <a
                    className="mt-1 block break-words text-sm font-semibold text-foreground hover:underline"
                    href={`tel:${change.requested_value.replace(/\s/g, "")}`}
                  >
                    {change.requested_value}
                  </a>
                ) : (
                  <p className="mt-1 break-words text-sm font-semibold text-foreground">{change.requested_value}</p>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-border bg-background p-3">
              <p className="text-xs font-semibold text-muted-foreground">REASON GIVEN</p>
              <p className="mt-1 text-sm text-foreground">{change.reason}</p>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor={`change-note-${change.id}`}>
                NOTE (OPTIONAL — THE PROVIDER SEES IT)
              </label>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                id={`change-note-${change.id}`}
                onChange={(e) => setNotes((n) => ({ ...n, [change.id]: e.target.value }))}
                value={notes[change.id] ?? ""}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                disabled={isPending}
                onClick={() => decide(change, true)}
                type="button"
              >
                ✓ Approve change
              </button>
              <button
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                disabled={isPending}
                onClick={() => decide(change, false)}
                type="button"
              >
                Decline
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
