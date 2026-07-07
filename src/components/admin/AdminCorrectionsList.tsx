"use client";

import { useState, useTransition } from "react";
import { updateCorrectionStatus } from "@/app/admin/(protected)/corrections/actions";

export type CorrectionRequest = {
  id: string;
  created_at: string;
  provider_name: string | null;
  correction_type: string | null;
  description: string | null;
  submitter_name: string | null;
  submitter_contact: string | null;
  status: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_note: string | null;
};

type Tab = "all" | "pending" | "reviewed" | "resolved" | "dismissed";

const STATUS_BADGE: Record<string, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
  reviewed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300",
  resolved:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300",
  dismissed:
    "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
};

// The submit form folds "what it currently says" + "what it should say" into
// a single `description` field (see CorrectionsPage.tsx) — there are no
// separate current_value/suggested_value columns. Split it back apart for
// display when it matches that template; otherwise treat the whole string
// as the suggested value.
function parseDescription(description: string | null): {
  current: string | null;
  suggested: string;
} {
  if (!description) return { current: null, suggested: "—" };
  const match = description.match(/^Currently says: ([\s\S]*?)\n\nShould say: ([\s\S]*)$/);
  if (match) return { current: match[1], suggested: match[2] };
  return { current: null, suggested: description };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminCorrectionsList({ corrections }: { corrections: CorrectionRequest[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = {
    all: corrections.length,
    pending: corrections.filter((c) => (c.status ?? "pending") === "pending").length,
    reviewed: corrections.filter((c) => c.status === "reviewed").length,
    resolved: corrections.filter((c) => c.status === "resolved").length,
    dismissed: corrections.filter((c) => c.status === "dismissed").length,
  };

  const visible =
    activeTab === "all"
      ? corrections
      : corrections.filter((c) => (c.status ?? "pending") === activeTab);

  function handleStatusChange(id: string, newStatus: "reviewed" | "resolved" | "dismissed") {
    startTransition(async () => {
      const result = await updateCorrectionStatus(id, newStatus, notes[id]);
      if (result?.error) alert(`Update failed: ${result.error}`);
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "reviewed", label: "Reviewed" },
    { key: "resolved", label: "Resolved" },
    { key: "dismissed", label: "Dismissed" },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 border-b border-border">
        <div className="flex flex-wrap">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={`mr-1 border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setActiveTab(key);
                setExpandedId(null);
              }}
              type="button"
            >
              {label}{" "}
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  activeTab === key
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold text-foreground">No corrections here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "all"
              ? "Corrections submitted via the public site will appear here."
              : `No corrections with status "${activeTab}".`}
          </p>
        </div>
      )}

      {/* Card list */}
      {visible.length > 0 && (
        <div className="space-y-4">
          {visible.map((correction) => {
            const status = correction.status ?? "pending";
            const { current, suggested } = parseDescription(correction.description);
            const isExpanded = expandedId === correction.id;

            return (
              <div key={correction.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">
                        {correction.provider_name ?? "General feedback"}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold capitalize ${
                          STATUS_BADGE[status] ?? STATUS_BADGE.pending
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {correction.correction_type ?? "—"} · {formatDate(correction.created_at)}
                    </p>
                  </div>
                  <button
                    className="shrink-0 text-sm text-primary hover:underline"
                    onClick={() => setExpandedId(isExpanded ? null : correction.id)}
                    type="button"
                  >
                    {isExpanded ? "Hide" : "Review"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t border-border pt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {current && (
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-xs font-semibold text-muted-foreground">
                            CURRENTLY SAYS
                          </p>
                          <p className="mt-1 text-sm text-foreground">{current}</p>
                        </div>
                      )}
                      <div className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">
                          SHOULD SAY
                        </p>
                        <p className="mt-1 text-sm text-foreground">{suggested}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs font-semibold text-muted-foreground">SUBMITTER</p>
                      <p className="mt-1 text-sm text-foreground">
                        {correction.submitter_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {correction.submitter_contact || "No contact provided"}
                      </p>
                    </div>

                    {correction.admin_note && (
                      <div className="rounded-xl border border-border bg-background p-3">
                        <p className="text-xs font-semibold text-muted-foreground">
                          PREVIOUS ADMIN NOTE
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {correction.admin_note}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        ADMIN NOTE
                      </label>
                      <textarea
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        defaultValue={correction.admin_note ?? ""}
                        onChange={(e) =>
                          setNotes((n) => ({ ...n, [correction.id]: e.target.value }))
                        }
                        placeholder="Optional note about how this was handled..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      {status === "pending" && (
                        <button
                          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                          disabled={isPending}
                          onClick={() => handleStatusChange(correction.id, "reviewed")}
                          type="button"
                        >
                          Mark reviewed
                        </button>
                      )}
                      {(status === "pending" || status === "reviewed") && (
                        <>
                          <button
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                            disabled={isPending}
                            onClick={() => handleStatusChange(correction.id, "resolved")}
                            type="button"
                          >
                            Mark resolved
                          </button>
                          <button
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            disabled={isPending}
                            onClick={() => handleStatusChange(correction.id, "dismissed")}
                            type="button"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
