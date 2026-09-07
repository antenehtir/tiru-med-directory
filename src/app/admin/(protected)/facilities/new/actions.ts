"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";
import {
  FACILITY_CATEGORY_OTHER_LABEL,
  isMappedFacilityCategory,
  resolveCategoryChoice,
} from "@/lib/frontend-search-filters";
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
  const categoryLabel = String(formData.get("category") ?? "").trim();
  const chosenSubCity = String(formData.get("sub_city") ?? "").trim();
  const tickedSubCities = String(formData.get("sub_cities") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const phonesRaw = String(formData.get("phones") ?? "");
  const rawSubtype = String(formData.get("diagnostic_subtype") ?? "").trim();
  const categoryOther = String(formData.get("category_other") ?? "").trim();
  const behavesAs = String(formData.get("category_behaves_as") ?? "").trim();
  const specialtiesRaw = String(formData.get("specialties") ?? "").trim();
  const specialtyOther = String(formData.get("specialty_other") ?? "").trim();

  if (!name) return { error: "Enter the facility name." };

  // The label a person picked and the category actually stored are different
  // things. "Medical Complex" is a true description and not a filter bucket,
  // so it is stored as Specialty Center and kept as the listing's own wording.
  const choice = resolveCategoryChoice(categoryLabel);
  let category: string;
  let describesAs: string | null = null;

  if (categoryLabel === FACILITY_CATEGORY_OTHER_LABEL) {
    if (!categoryOther) return { error: "Describe the facility." };
    if (!behavesAs) return { error: "Choose which category it works most like." };
    category = behavesAs;
    describesAs = categoryOther;
  } else if (choice) {
    category = choice.stores;
    describesAs = choice.describesAs ?? null;
  } else {
    category = categoryLabel;
  }

  // The same guard the claim-approval path uses, for the same reason: a
  // category outside FACILITY_CATEGORY_DB_MAP resolves to "default", so the
  // facility publishes and then appears under no category filter at all —
  // invisible to browse and to the homepage chips, with nothing reporting it.
  // It is checked on the resolved value, so no label can slip past by being
  // offered in the dropdown.
  if (!isMappedFacilityCategory(category)) {
    return { error: `"${categoryLabel || "(none)"}" is not one of the listed categories.` };
  }

  const isDiagnostic = category === "Diagnostic Center";
  if (isDiagnostic && !["lab", "imaging", "both"].includes(rawSubtype)) {
    return { error: "Choose what this diagnostic facility offers." };
  }

  // Specialties double as the facility's first services — they are values from
  // the same SPECIALTIES catalogue the services editor renders, so ticking one
  // here means the editor opens with it already selected rather than asking
  // the same question twice.
  const specialties = [
    ...specialtiesRaw.split("|").map((s) => s.trim()).filter(Boolean),
    ...(specialtyOther ? [specialtyOther] : []),
  ];

  const isSpecialty = category === "Specialty Center" || category === "Medical Plaza";
  if (isSpecialty && specialties.length === 0) {
    return { error: "Tick at least one specialty." };
  }

  // "Multiple" on its own tells a patient nothing. When the sub-cities were
  // ticked, store them in the slash-separated form the live rows already use
  // and mapDBRowToFacility already splits on.
  const subCity =
    chosenSubCity === "Multiple" && tickedSubCities ? tickedSubCities : chosenSubCity;

  const phones = phonesRaw
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

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
    // Specialties are real catalogue services, so they seed this rather than
    // it starting empty. The editor's snapshot-diff guard then opens on
    // exactly what was created, with nothing for the first save to undo.
    services: specialties,
    updated_at: new Date().toISOString(),
  };
  if (subCity) row.sub_city = subCity;
  if (area) row.area = area;
  if (describesAs) row.subcategory = describesAs;
  // phone and phone_2 stay populated whatever else happens: every reader in
  // the app — cards, the detail panel, contact channels — still reads those
  // two columns, and a number that exists only in the new array would be
  // invisible everywhere until each of them is taught otherwise.
  if (phones[0]) row.phone = phones[0];
  if (phones[1]) row.phone_2 = phones[1];
  // Both of these name columns a migration adds, so each is sent only once
  // this database is known to have it. Naming a missing column fails the whole
  // insert, which would block creating any facility rather than losing one
  // field — the probe costs one cheap query and keeps the form usable either
  // way. Same pattern as diagnostic_subtype before 045 ran.
  if (isDiagnostic) {
    const { error: probeError } = await supabase
      .from("facilities")
      .select("diagnostic_subtype")
      .limit(1);
    if (!probeError) row.diagnostic_subtype = rawSubtype;
  }
  if (phones.length > 2) {
    const { error: probeError } = await supabase.from("facilities").select("phones").limit(1);
    if (probeError) {
      // Refused rather than silently truncated. Three numbers typed and two
      // stored is a wrong listing that looks like a right one.
      return {
        error:
          `This database holds two phone numbers per facility until migration 046 is run. ` +
          `Remove ${phones.length - 2} number${phones.length - 2 === 1 ? "" : "s"}, or run 046 first.`,
      };
    }
    row.phones = phones;
  } else if (phones.length > 0) {
    const { error: probeError } = await supabase.from("facilities").select("phones").limit(1);
    if (!probeError) row.phones = phones;
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
