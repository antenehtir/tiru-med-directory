import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminFacilityEditor } from "@/components/admin/AdminFacilityEditor";
import { FacilityDraftBanner } from "@/components/admin/FacilityDraftBanner";
import { missingFacilityRequiredFieldKeys } from "@/lib/provider/onboarding-config";

async function getFacility(id: string) {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("facilities")
    // Every column, rather than a list that has to be extended by hand each
    // time a section learns about one. That list had already been edited twice
    // for branches and branch_count, and the failure mode is quiet: a section
    // renders its control against `undefined`, shows a default, and writes the
    // default back over real data. It also means naming a column this database
    // does not have yet — diagnostic_subtype before 045 runs — degrades to the
    // field being absent instead of erroring the whole page. One row, on an
    // admin screen: there is nothing to save by narrowing it.
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Record<string, unknown>;
}

export default async function AdminFacilityEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ published?: string }>;
}) {
  const { id } = await params;
  const { published } = await searchParams;
  const facility = await getFacility(id);
  if (!facility) notFound();

  const isDraft = facility.is_draft === true;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isDraft ? "New facility — draft" : "Edit facility"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {String(facility.name)} ·{" "}
          {isDraft
            ? "Saves are kept on this draft. Nothing is listed until you publish."
            : "Saves write directly to the live listing — the CS / Facility Managed badge is unaffected."}
        </p>
      </div>
      {isDraft && (
        <FacilityDraftBanner facilityId={id} missing={missingFacilityRequiredFieldKeys(facility)} />
      )}
      {!isDraft && published === "1" && (
        <p
          className="mb-6 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm font-medium text-[#0F766E]"
          role="status"
        >
          ✓ Published — {String(facility.name)} is now listed in the directory.
        </p>
      )}
      <AdminFacilityEditor facility={facility} />
    </div>
  );
}
