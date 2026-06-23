import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

async function getListingRequests() {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("listing_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export default async function AdminListingsPage() {
  const requests = await getListingRequests();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Listing Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New provider submissions from the public registration form
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold text-foreground">No listing requests yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When providers submit via the registration form, they will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Facility</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Contact</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Submitted</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: Record<string, unknown>) => (
                <tr
                  key={req.id as string}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {(req.facility_name ?? req.name ?? "—") as string}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(req.area ?? req.location ?? "") as string}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(req.facility_type ?? req.provider_type ?? "—") as string}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{(req.phone ?? req.contact_phone ?? "—") as string}</div>
                    <div className="text-xs">{(req.email ?? req.contact_email ?? "") as string}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {req.created_at
                      ? new Date(req.created_at as string).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                      {(req.status ?? "pending") as string}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
