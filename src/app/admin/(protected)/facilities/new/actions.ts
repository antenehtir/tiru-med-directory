"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";
import { isMappedFacilityCategory } from "@/lib/frontend-search-filters";
import { toSlug } from "@/lib/slugify";

export type CreateFacilityResult = { error: string } | undefined;

// Creates a listing an admin has researched themselves, rather than one a
// provider claimed. It is deliberately the smallest row that can exist and be
// found: name, category, and where it is. Everything else is filled in by the
// same Services / Contact & Social / Location editor an existing facility
// uses, because a second copy of those controls is how two editors drift.
//
// No licence upload, no document review, no claim record. That is the whole
// difference from provider onboarding, and it is why the badge below is
// community-submitted: nobody at the facility has asserted any of this.
export async function createFacility(
  _prev: CreateFacilityResult,
  formData: FormData,
): Promise<CreateFacilityResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { error: "Unauthorized." };

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const subCity = String(formData.get("sub_city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const rawSubtype = String(formData.get("diagnostic_subtype") ?? "").trim();

  if (!name) return { error: "Enter the facility name." };

  // The same guard the claim-approval path uses, for the same reason: a
  // category outside FACILITY_CATEGORY_DB_MAP resolves to "default", so the
  // facility publishes and then appears under no category filter at all —
  // invisible to browse and to the homepage chips, with nothing reporting it.
  if (!isMappedFacilityCategory(category)) {
    return { error: `"${category || "(none)"}" is not one of the listed categories.` };
  }

  const isDiagnostic = category === "Diagnostic Center";
  if (isDiagnostic && !["lab", "imaging", "both"].includes(rawSubtype)) {
    return { error: "Choose what this diagnostic facility offers." };
  }

  const supabase = await createAdminSupabaseClient();

  // Same slug strategy as claim approval: derive from the name, and only
  // disambiguate when something already holds it.
  const baseSlug = toSlug(name);
  if (!baseSlug) return { error: "That name produces no usable URL. Use Latin characters." };
  const { data: slugConflict } = await supabase
    .from("facilities")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();
  const slug = slugConflict ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

  const { data: maxRecord } = await supabase
    .from("facilities")
    .select("record_number")
    .order("record_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextRecordNumber = ((maxRecord?.record_number as number | null) ?? 0) + 1;

  const row: Record<string, unknown> = {
    name,
    slug,
    category,
    record_number: nextRecordNumber,
    // Nobody from the facility has confirmed any of this yet. The badge is
    // one-way from here: updateFacilityBadge refuses to come back down to
    // community-submitted once a facility is Owned or Verified.
    verification_status: "community-submitted",
    is_active: true,
    // The editor's snapshot-diff guard compares against what it opened on, so
    // an empty array here is the honest starting point rather than a value the
    // first save would have to undo.
    services: [],
    updated_at: new Date().toISOString(),
  };
  if (subCity) row.sub_city = subCity;
  if (area) row.area = area;
  if (phone) row.phone = phone;
  // Only sent when the column exists — before migration 045 the insert would
  // fail outright on an unknown column, which would block creating any
  // facility rather than just this one field.
  if (isDiagnostic) {
    const { error: probeError } = await supabase
      .from("facilities")
      .select("diagnostic_subtype")
      .limit(1);
    if (!probeError) row.diagnostic_subtype = rawSubtype;
  }

  const { data: created, error } = await supabase
    .from("facilities")
    .insert(row)
    .select("id")
    .single();

  if (error || !created) {
    return { error: error?.message ?? "Could not create the facility." };
  }

  // Flat scalars only. The audit page renders Object.values(v)[0] raw, so a
  // nested object here crashes it with React error #31.
  await supabase.from("audit_log").insert({
    admin_id: adminUser.id,
    action: "facility_created",
    entity_type: "facility",
    entity_id: created.id,
    old_value: null,
    new_value: { name },
    note: `Admin created "${name}" (${category}) as a community-sourced listing`,
  });

  revalidatePath("/admin/facilities");
  redirect(`/admin/facilities/${created.id}/edit?section=services&created=1`);
}
