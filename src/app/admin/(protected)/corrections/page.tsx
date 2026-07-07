import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminCorrectionsList, type CorrectionRequest } from "@/components/admin/AdminCorrectionsList";

const STATUS_SORT_PRIORITY: Record<string, number> = {
  pending: 0,
  reviewed: 1,
  resolved: 2,
  dismissed: 3,
};

async function getCorrections(): Promise<CorrectionRequest[]> {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("correction_requests")
    .select(
      "id, created_at, provider_name, correction_type, description, submitter_name, submitter_contact, status, reviewed_by, reviewed_at, admin_note",
    )
    .order("created_at", { ascending: false });

  if (error) return [];

  const rows = (data ?? []) as CorrectionRequest[];

  // Pending-first ordering isn't expressible via a plain PostgREST .order()
  // call, so sort client-side: status priority, then most recent first.
  return rows.sort((a, b) => {
    const priorityDiff =
      (STATUS_SORT_PRIORITY[a.status ?? "pending"] ?? 0) -
      (STATUS_SORT_PRIORITY[b.status ?? "pending"] ?? 0);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default async function AdminCorrectionsPage() {
  const corrections = await getCorrections();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Corrections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review facility and specialist corrections submitted by the public
        </p>
      </div>
      <AdminCorrectionsList corrections={corrections} />
    </div>
  );
}
