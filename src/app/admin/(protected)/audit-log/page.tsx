import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

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

// Entries are written by several different admin actions, and not all of
// them store a flat {field: scalar} pair the way updateFacilityBadge does —
// a value that is an array or a nested object would otherwise throw
// "Objects are not valid as a React child" and take the whole page down.
function firstValueText(value: Record<string, unknown>): string {
  const first = Object.values(value)[0];
  if (first === null || first === undefined) return "—";
  if (typeof first === "object") return JSON.stringify(first);
  return String(first);
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
                      {entry.created_at
                        ? new Date(entry.created_at as string).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{actorText}</td>
                    <td className={`px-4 py-3 font-medium ${isProblem ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                      {ACTION_LABELS[entry.action as string] ?? (entry.action as string)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(entry.note ?? "—") as string}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {oldVal && newVal ? (
                        <span>
                          <span className="text-red-500">{firstValueText(oldVal)}</span>
                          {" → "}
                          <span className="text-teal-600">{firstValueText(newVal)}</span>
                        </span>
                      ) : "—"}
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
