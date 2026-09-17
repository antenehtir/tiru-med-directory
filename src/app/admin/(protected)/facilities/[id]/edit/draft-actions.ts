"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";
import { FACILITIES_CACHE_TAG } from "@/lib/supabase/get-facilities";
import {
  missingFacilityRequiredFieldKeys,
  REQUIRED_FIELD_LABELS,
} from "@/lib/provider/onboarding-config";

export type DraftActionResult = { error: string } | undefined;

// A draft is an admin-created facility that has not been published yet
// (facilities.is_draft, migration 063). It is hidden from patients and from
// the facility list until one of these two actions settles it.

// Goes live — but only with every required field filled, checked here on the
// server against the saved row, whatever the page showed.
export async function publishFacilityDraft(facilityId: string): Promise<DraftActionResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { error: "Unauthorized." };

  const supabase = await createAdminSupabaseClient();
  const { data: facility } = await supabase
    .from("facilities")
    .select("*")
    .eq("id", facilityId)
    .maybeSingle();

  if (!facility) return { error: "That facility no longer exists." };
  if (facility.is_draft !== true) return { error: "This facility is already published." };

  const missing = missingFacilityRequiredFieldKeys(facility);
  if (missing.length > 0) {
    return {
      error: `Still needed before publishing: ${missing.map((key) => REQUIRED_FIELD_LABELS[key]).join(", ")}.`,
    };
  }

  const { data: updated, error } = await supabase
    .from("facilities")
    .update({ is_draft: false, is_active: true, updated_at: new Date().toISOString() })
    .eq("id", facilityId)
    .eq("is_draft", true)
    .select("id");

  if (error) return { error: error.message };
  if (!updated || updated.length === 0) return { error: "The facility could not be published. Reload and try again." };

  await supabase.from("audit_log").insert({
    admin_id: adminUser.id,
    action: "facility_created",
    entity_type: "facility",
    entity_id: facilityId,
    old_value: null,
    new_value: { name: facility.name as string },
    note: `Admin published "${facility.name}" (${facility.category}) as a community-sourced listing`,
  });

  revalidatePath("/admin/facilities");
  revalidatePath("/admin");
  updateTag(FACILITIES_CACHE_TAG);
  revalidatePath("/facilities");
  revalidatePath("/facilities/[slug]", "page");
  revalidatePath("/search");
  revalidatePath("/nearby");
  revalidatePath("/");
  redirect(`/admin/facilities/${facilityId}/edit?published=1`);
}

// Throws the draft away. The delete is limited to rows still marked as drafts,
// so this can never remove a facility that has been published.
export async function discardFacilityDraft(facilityId: string): Promise<DraftActionResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { error: "Unauthorized." };

  const supabase = await createAdminSupabaseClient();
  const { data: deleted, error } = await supabase
    .from("facilities")
    .delete()
    .eq("id", facilityId)
    .eq("is_draft", true)
    .select("id, name");

  if (error) return { error: error.message };
  if (!deleted || deleted.length === 0) {
    return { error: "Only an unpublished draft can be discarded." };
  }

  await supabase.from("audit_log").insert({
    admin_id: adminUser.id,
    action: "facility_draft_discarded",
    entity_type: "facility",
    entity_id: facilityId,
    old_value: { name: deleted[0].name as string },
    new_value: null,
    note: `Admin discarded the unpublished draft "${deleted[0].name}" — it was never listed`,
  });

  revalidatePath("/admin/facilities");
  redirect("/admin/facilities?discarded=1");
}
