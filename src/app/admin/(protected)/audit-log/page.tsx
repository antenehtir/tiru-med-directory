import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

async function getAuditLog() {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*, admin_users(display_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return [];
  return data ?? [];
}

const ACTION_LABELS: Record<string, string> = {
  update_badge: "Badge updated",
  approve_listing: "Listing approved",
  reject_listing: "Listing rejected",
  approve_claim: "Claim approved",
  reject_claim: "Claim rejected",
};

export default async function AdminAuditLogPage() {
  const entries = await getAuditLog();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Full history of admin actions — last 200 entries
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold text-foreground">No actions recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Admin actions like badge changes will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-foreground">When</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Admin</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Action</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Detail</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: Record<string, unknown>) => {
                const admin = entry.admin_users as Record<string, string> | null;
                const oldVal = entry.old_value as Record<string, string> | null;
                const newVal = entry.new_value as Record<string, string> | null;

                return (
                  <tr
                    key={entry.id as number}
                    className="border-b border-border last:border-0 hover:bg-muted/20"
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
                    <td className="px-4 py-3 text-muted-foreground">
                      {admin?.display_name ?? admin?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {ACTION_LABELS[entry.action as string] ?? (entry.action as string)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(entry.note ?? "—") as string}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {oldVal && newVal ? (
                        <span>
                          <span className="text-red-500">{Object.values(oldVal)[0]}</span>
                          {" → "}
                          <span className="text-teal-600">{Object.values(newVal)[0]}</span>
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
