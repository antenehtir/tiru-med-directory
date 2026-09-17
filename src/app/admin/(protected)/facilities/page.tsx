import Link from "next/link";
import { Suspense } from "react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminFacilityList } from "@/components/admin/AdminFacilityList";
import { formatAddisDate } from "@/lib/addis-time";

const LIST_COLUMNS =
  "id, slug, name, category, subcategory, sub_city, area, verification_status, record_number, phone, working_hours, emergency_service, is_active, deactivation_category, deactivated_at, branch_count";

async function getFacilities() {
  const supabase = await createAdminSupabaseClient();
  // is_draft arrives with migration 063. Until it runs, naming it fails the
  // whole query, so fall back to the list without it rather than showing an
  // empty directory.
  const withDraft = await supabase
    .from("facilities")
    .select(`${LIST_COLUMNS}, is_draft, updated_at`)
    .order("record_number", { ascending: true });
  const { data, error } = withDraft.error
    ? await supabase.from("facilities").select(LIST_COLUMNS).order("record_number", { ascending: true })
    : withDraft;

  if (error) return { listed: [], drafts: [] };

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const drafts = rows
    .filter((row) => row.is_draft === true)
    .map((row) => ({
      id: row.id as string,
      name: row.name as string,
      category: (row.category as string | null) ?? "",
      updatedAt: (row.updated_at as string | null) ?? null,
    }));
  // Drafts are not part of the directory yet, so they stay out of the list,
  // its filters and its count.
  const listed = rows.filter((row) => row.is_draft !== true) as unknown as Parameters<
    typeof AdminFacilityList
  >[0]["facilities"];

  return { listed, drafts };
}

export default async function AdminFacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ discarded?: string }>;
}) {
  const [{ listed: facilities, drafts }, { discarded }] = await Promise.all([
    getFacilities(),
    searchParams,
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facility Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {facilities.length} facilities · manage badges and records
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          href="/admin/facilities/new"
        >
          <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          </svg>
          New facility
        </Link>
      </div>

      {discarded === "1" && (
        <p className="mb-4 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground" role="status">
          Draft discarded. Nothing was listed.
        </p>
      )}

      {drafts.length > 0 && (
        <section
          id="drafts"
          aria-labelledby="drafts-title"
          className="mb-6 scroll-mt-20 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40 sm:p-5"
        >
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-100" id="drafts-title">
            Unfinished drafts ({drafts.length}) — not listed
          </h2>
          <p className="mt-0.5 text-xs text-amber-900/80 dark:text-amber-300">
            Open one to finish and publish it, or to discard it.
          </p>
          <ul className="mt-3 divide-y divide-amber-200 dark:divide-amber-800">
            {drafts.map((draft) => (
              <li key={draft.id}>
                <Link
                  className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm hover:underline"
                  href={`/admin/facilities/${draft.id}/edit`}
                >
                  <span className="min-w-0">
                    <span className="font-semibold text-amber-950 dark:text-amber-50">{draft.name}</span>
                    <span className="text-amber-900/70 dark:text-amber-300/80">
                      {" "}· {draft.category}
                      {draft.updatedAt ? ` · last saved ${formatAddisDate(draft.updatedAt)}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-primary">Continue →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Suspense fallback={null}>
        <AdminFacilityList facilities={facilities} />
      </Suspense>
    </div>
  );
}
