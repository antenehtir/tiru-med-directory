"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

const DEACTIVATION_CATEGORIES = [
  "Closed permanently",
  "License expired or not renewed",
  "Relocated (new listing pending)",
  "Under investigation",
  "Temporarily closed",
  "Other",
] as const;

export async function updateFacilityBadge(facilityId: string, newStatus: string) {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Unauthorized");

  const validStatuses = ["community-submitted", "facility-owned", "verified"];
  if (!validStatuses.includes(newStatus)) throw new Error("Invalid status");

  const supabase = await createAdminSupabaseClient();

  const { data: current } = await supabase
    .from("facilities")
    .select("verification_status, name")
    .eq("id", facilityId)
    .single();

  // One-way badge gate: once a facility reaches Owned or Verified it can
  // never be demoted back to CS. Enforce server-side so the UI can't be bypassed.
  const locked = ["facility-owned", "verified"];
  if (locked.includes(current?.verification_status ?? "") && newStatus === "community-submitted") {
    throw new Error("Cannot downgrade to CS — once a facility is Owned or Verified the badge is permanent.");
  }

  const { error } = await supabase
    .from("facilities")
    .update({ verification_status: newStatus })
    .eq("id", facilityId);

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    admin_id: adminUser.id,
    action: "update_badge",
    entity_type: "facility",
    entity_id: facilityId,
    old_value: { verification_status: current?.verification_status },
    new_value: { verification_status: newStatus },
    note: `Badge changed for: ${current?.name}`,
  });

  revalidatePath("/admin/facilities");
  revalidatePath("/admin");
}

export async function deactivateFacility(
  facilityId: string,
  category: string,
  reason: string,
) {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Unauthorized");

  if (!DEACTIVATION_CATEGORIES.includes(category as (typeof DEACTIVATION_CATEGORIES)[number])) {
    throw new Error("Invalid deactivation category");
  }
  if (!reason.trim()) throw new Error("Deactivation reason is required");

  const supabase = await createAdminSupabaseClient();

  const { data: facility } = await supabase
    .from("facilities")
    .select("name")
    .eq("id", facilityId)
    .single();

  const { error } = await supabase
    .from("facilities")
    .update({
      is_active: false,
      deactivation_category: category,
      deactivation_reason: reason.trim(),
      deactivated_at: new Date().toISOString(),
      deactivated_by: adminUser.id,
    })
    .eq("id", facilityId);

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    admin_id: adminUser.id,
    action: "facility_deactivated",
    entity_type: "facility",
    entity_id: facilityId,
    note: `Deactivated "${facility?.name}" — category: ${category}. ${reason.trim()}`,
  });

  revalidatePath("/admin/facilities");
  revalidatePath("/admin");
}

export async function reactivateFacility(facilityId: string) {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Unauthorized");

  const supabase = await createAdminSupabaseClient();

  const { data: facility } = await supabase
    .from("facilities")
    .select("name")
    .eq("id", facilityId)
    .single();

  const { error } = await supabase
    .from("facilities")
    .update({
      is_active: true,
      reactivated_at: new Date().toISOString(),
    })
    .eq("id", facilityId);

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    admin_id: adminUser.id,
    action: "facility_reactivated",
    entity_type: "facility",
    entity_id: facilityId,
    note: `Reactivated "${facility?.name}"`,
  });

  revalidatePath("/admin/facilities");
  revalidatePath("/admin");
}
