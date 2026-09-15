import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { fieldLabel, isItemDelta, isListDelta } from "@/lib/audit/change-summary";

async function getAuditLog() {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*, admin_users(display_name, email), provider_accounts(display_name, facility_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return [];
  return data ?? [];
}

// This page is a server component, so a bare toLocaleString formats in the
// SERVER's timezone — UTC on the host — while the provider console's
// "Draft saved 3:22:29 PM" is a client component formatting in the
// browser's. The same save therefore appeared three hours apart in two
// places, and the audit log was the one that was wrong.
//
// Pinned to Addis rather than handed to the browser: every admin and
// provider on this directory is in one timezone, and an audit trail wants a
// single fixed reference frame anyway — "when did this happen" should not
// depend on where the person asking is sitting.
const DISPLAY_TIME_ZONE = "Africa/Addis_Ababa";

function formatAuditTimestamp(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DISPLAY_TIME_ZONE,
  });
}

// Long lists get a head and a count rather than the whole thing — the point
// of the column is "what moved", and twelve service names in a table cell
// stop being readable well before the hundred that prompted this.
const MAX_ITEMS_SHOWN = 6;

function itemSummary(items: string[]): string {
  if (items.length <= MAX_ITEMS_SHOWN) return items.join(", ");
  return `${items.slice(0, MAX_ITEMS_SHOWN).join(", ")} +${items.length - MAX_ITEMS_SHOWN} more`;
}

// Values are written by several different actions across several years of
// this table, so nothing here assumes a shape: a list delta renders as
// +added / −removed, a scalar renders before → after, and anything else
// (including rows written before either convention) falls back to text.
// A raw object reaching JSX is what once crashed this page with "Objects
// are not valid as a React child".
function asText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const ACTION_LABELS: Record<string, string> = {
  update_badge: "Badge updated",
  approve_listing: "Listing approved",
  reject_listing: "Listing rejected",
  approve_claim: "Claim approved",
  reject_claim: "Claim rejected",
  correction_reviewed: "Correction reviewed",
  facility_services_edited: "Services edited",
  facility_contact_edited: "Contact edited",
  facility_location_edited: "Location edited",
  facility_created: "Facility created",
  provider_edit_synced: "Provider edit saved",
  provider_live_sync_blocked: "Provider edit did NOT go live",
  provider_live_sync_failed: "Provider edit failed to save",
};

// Entries where something went wrong reaching the public page — surfaced
// with their own colour so they don't read as routine activity next to
// everything that saved cleanly.
const PROBLEM_ACTIONS = new Set(["provider_live_sync_blocked", "provider_live_sync_failed"]);

// One row per field that changed. A list field shows only what moved; a
// scalar shows what it was and what it became.
function ChangeCell({
  oldValue,
  newValue,
}: {
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}) {
  const fields = Object.keys(newValue ?? {});
  if (fields.length === 0) return <>—</>;

  return (
    <div className="space-y-1.5">
      {fields.map((field) => {
        const next = newValue?.[field];
        const label = fieldLabel(field);

        if (isListDelta(next) || isItemDelta(next)) {
          // An item that stayed but changed inside (a doctor gaining a
          // language) is neither added nor removed, and showing only +/−
          // would report that edit as nothing at all.
          const modified = isItemDelta(next) ? next.modified : [];
          return (
            <div key={field}>
              <span className="font-medium text-foreground">{label}</span>{" "}
              {next.removed.length > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  −{itemSummary(next.removed)}
                </span>
              )}
              {next.removed.length > 0 && next.added.length > 0 && " "}
              {next.added.length > 0 && (
                <span className="text-teal-600 dark:text-teal-400">
                  +{itemSummary(next.added)}
                </span>
              )}
              {modified.map((item) => (
                <span className="block" key={item.label}>
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">: {itemSummary(item.fields)}</span>
                </span>
              ))}
            </div>
          );
        }

        return (
          <div key={field}>
            <span className="font-medium text-foreground">{label}</span>{" "}
            <span className="text-red-600 dark:text-red-400">{asText(oldValue?.[field])}</span>
            {" → "}
            <span className="text-teal-600 dark:text-teal-400">{asText(next)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function AdminAuditLogPage() {
  const entries = await getAuditLog();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Full history of admin actions and provider edits — last 200 entries
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold text-foreground">No actions recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin actions like badge changes, and provider edits to their own listing, will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-foreground">When</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Actor</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Action</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Detail</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: Record<string, unknown>) => {
                const admin = entry.admin_users as Record<string, string> | null;
                const provider = entry.provider_accounts as Record<string, string> | null;
                const oldVal = entry.old_value as Record<string, unknown> | null;
                const newVal = entry.new_value as Record<string, unknown> | null;
                const isProblem = PROBLEM_ACTIONS.has(entry.action as string);
                // Every row has exactly one actor — admin_id and provider_id
                // are set by different writers and never both at once.
                const actorText = admin
                  ? (admin.display_name ?? admin.email ?? "Admin")
                  : provider
                    ? `${provider.display_name ?? provider.facility_name ?? "Provider"} (provider)`
                    : "—";

                return (
                  <tr
                    key={entry.id as number}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 ${isProblem ? "bg-red-50 dark:bg-red-950/20" : ""}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatAuditTimestamp(entry.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{actorText}</td>
                    <td className={`px-4 py-3 font-medium ${isProblem ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                      {ACTION_LABELS[entry.action as string] ?? (entry.action as string)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(entry.note ?? "—") as string}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <ChangeCell newValue={newVal} oldValue={oldVal} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
