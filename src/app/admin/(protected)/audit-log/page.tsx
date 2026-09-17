import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { fieldLabel, isItemDelta, isListDelta } from "@/lib/audit/change-summary";
import { formatAddisDateTime } from "@/lib/addis-time";
import type { AuditSeverity } from "@/lib/audit/severity";
import {
  auditSeverity,
  SEVERITY_BORDER_CLASS,
  SEVERITY_DOT_CLASS,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  SEVERITY_ROW_CLASS,
} from "@/lib/audit/severity";

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
  facility_created: "Facility published",
  facility_draft_created: "Facility draft started",
  facility_draft_discarded: "Facility draft discarded",
  provider_edit_synced: "Provider edit saved",
  provider_live_sync_blocked: "Provider edit did NOT go live",
  provider_live_sync_failed: "Provider edit failed to save",
  // These seven were written by actions elsewhere in the app but never
  // listed here, so they fell through to the raw column value and the log
  // showed "claim_approved_new_listing" in a table every other row of which
  // read as a sentence.
  facility_identity_edited: "Identity edited",
  facility_about_edited: "About edited",
  facility_checkups_edited: "Check-ups edited",
  facility_doctors_edited: "Doctors edited",
  facility_media_edited: "Photos edited",
  // Edits a verified provider made to their own listing from the live
  // editor. Named apart from the admin ones so the log says at a glance
  // whether Tiru or the facility changed something.
  provider_about_edited: "Provider edited About",
  provider_services_edited: "Provider edited services",
  provider_checkups_edited: "Provider edited check-ups",
  provider_contact_edited: "Provider edited contact",
  provider_location_edited: "Provider edited location",
  provider_doctors_edited: "Provider edited doctors",
  provider_media_edited: "Provider edited photos",
  claim_approved_new_listing: "New listing approved",
  claim_approved_merged: "Claim merged into listing",
  facility_deactivated: "Facility deactivated",
  facility_reactivated: "Facility reactivated",
  update_admin_role: "Admin role changed",
  remove_admin_user: "Admin user removed",
  change_password: "Password changed",
};

// Colour needs a key, or it is decoration. Shown above the table rather
// than tucked underneath it, because the point of the flagging is to be
// understood before the rows are read.
function SeverityLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      {SEVERITY_ORDER.map((severity) => (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground" key={severity}>
          <span className={`size-2 shrink-0 rounded-full ${SEVERITY_DOT_CLASS[severity]}`} />
          {SEVERITY_LABELS[severity]}
        </span>
      ))}
    </div>
  );
}

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

  // Written as sentences rather than diff notation. "services −Dental" is
  // readable once you have been told what the minus means; "Removed Dental"
  // needs no key, and this log is read by whoever is on duty, not only by
  // whoever built it.
  return (
    <div className="space-y-2">
      {fields.map((field) => {
        const next = newValue?.[field];
        const label = fieldLabel(field);

        if (isListDelta(next) || isItemDelta(next)) {
          const modified = isItemDelta(next) ? next.modified : [];
          return (
            <div key={field}>
              <span className="font-medium capitalize text-foreground">{label}</span>
              {next.added.length > 0 && (
                <span className="block">
                  <span className="text-[var(--success-text)]">
                    Added {next.added.length === 1 ? "" : `${next.added.length}: `}
                    {itemSummary(next.added)}
                  </span>
                </span>
              )}
              {next.removed.length > 0 && (
                <span className="block">
                  <span className="text-[var(--error)]">
                    Removed {next.removed.length === 1 ? "" : `${next.removed.length}: `}
                    {itemSummary(next.removed)}
                  </span>
                </span>
              )}
              {/* An entry that stayed but changed inside — a doctor gaining a
                  language. Neither added nor removed, and invisible if the
                  cell only ever showed those two. */}
              {modified.map((item) => (
                <span className="block text-foreground" key={item.label}>
                  {item.label} — {itemSummary(item.fields)} changed
                </span>
              ))}
            </div>
          );
        }

        const before = asText(oldValue?.[field]);
        const after = asText(next);
        return (
          <div key={field}>
            <span className="font-medium capitalize text-foreground">{label}</span>
            <span className="block">
              {before === "—" ? (
                <span className="text-[var(--success-text)]">Set to {after}</span>
              ) : after === "—" ? (
                <span className="text-[var(--error)]">Cleared (was {before})</span>
              ) : (
                <>
                  <span className="text-[var(--error)] line-through">{before}</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="text-[var(--success-text)]">{after}</span>
                </>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}


// Everything a row needs, derived once so the table and the card list below
// cannot drift into describing the same entry two different ways.
type AuditRow = {
  id: number;
  when: string;
  actor: string;
  action: string;
  note: string;
  severity: AuditSeverity;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
};

function toRow(entry: Record<string, unknown>): AuditRow {
  const admin = entry.admin_users as Record<string, string> | null;
  const provider = entry.provider_accounts as Record<string, string> | null;
  const newValue = entry.new_value as Record<string, unknown> | null;

  return {
    id: entry.id as number,
    when: formatAddisDateTime(entry.created_at as string | null),
    // Every row has exactly one actor — admin_id and provider_id are set by
    // different writers and never both at once.
    actor: admin
      ? (admin.display_name ?? admin.email ?? "Admin")
      : provider
        ? `${provider.display_name ?? provider.facility_name ?? "Provider"} (provider)`
        : "—",
    action: ACTION_LABELS[entry.action as string] ?? (entry.action as string),
    note: (entry.note as string | null) ?? "—",
    // Graded on the action AND the fields it touched: "Contact edited" is
    // routine for a new Instagram handle and patient-facing for a new phone
    // number.
    severity: auditSeverity(entry.action as string, Object.keys(newValue ?? {})),
    oldValue: entry.old_value as Record<string, unknown> | null,
    newValue,
  };
}

function SeverityDot({ severity }: { severity: AuditSeverity }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`mt-1.5 size-2 shrink-0 rounded-full ${SEVERITY_DOT_CLASS[severity]}`}
      />
      <span className="sr-only">{SEVERITY_LABELS[severity]}: </span>
    </>
  );
}

// Phone layout. A five-column table on a 375px screen can only scroll
// sideways, which puts What Changed — the reason to open this page at all —
// off the edge behind two columns of metadata. Stacked, the same entry reads
// top to bottom with nothing hidden.
function AuditCard({ row }: { row: AuditRow }) {
  const isProblem = row.severity === "attention";

  return (
    <div
      className={`border-b border-l-4 border-border p-4 last:border-b-0 ${SEVERITY_BORDER_CLASS[row.severity]} ${SEVERITY_ROW_CLASS[row.severity]}`}
    >
      <div className="flex items-start gap-2">
        <SeverityDot severity={row.severity} />
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${isProblem ? "text-[var(--error)]" : "text-foreground"}`}>
            {row.action}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {row.when} · {row.actor}
          </p>
        </div>
      </div>

      {row.note !== "—" && (
        <p className="mt-2 break-words text-sm text-muted-foreground">{row.note}</p>
      )}

      {row.newValue && Object.keys(row.newValue).length > 0 && (
        <div className="mt-2 break-words rounded-lg bg-muted/40 p-2 text-xs">
          <ChangeCell newValue={row.newValue} oldValue={row.oldValue} />
        </div>
      )}
    </div>
  );
}

export default async function AdminAuditLogPage() {
  const entries = await getAuditLog();
  const rows = entries.map((entry: Record<string, unknown>) => toRow(entry));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Full history of admin actions and provider edits — last 200 entries
        </p>
        <SeverityLegend />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold text-foreground">No actions recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin actions like badge changes, and provider edits to their own listing, will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card lg:hidden">
            {rows.map((row) => (
              <AuditCard key={row.id} row={row} />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card lg:block">
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
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-l-4 border-border last:border-b-0 hover:bg-muted/20 ${SEVERITY_BORDER_CLASS[row.severity]} ${SEVERITY_ROW_CLASS[row.severity]}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {row.when}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.actor}</td>
                    <td
                      className={`px-4 py-3 font-medium ${row.severity === "attention" ? "text-[var(--error)]" : "text-foreground"}`}
                    >
                      <span className="flex items-start gap-2">
                        <SeverityDot severity={row.severity} />
                        <span>{row.action}</span>
                      </span>
                    </td>
                    {/* Both capped and wrapping. A table-auto column grows to
                        fit its longest cell, so one legacy row carrying a
                        seventy-item service list stretched the table to
                        1198px and pushed the Change column off the right
                        edge — the column you most need to read. max-width on
                        a <td> is unreliable in table layout, so the cap goes
                        on a block inside it. */}
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="max-w-[16rem] break-words">{row.note}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="max-w-[20rem] break-words">
                        <ChangeCell newValue={row.newValue} oldValue={row.oldValue} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
