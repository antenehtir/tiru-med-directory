"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

export async function updateFacilityBadge(facilityId: string, newStatus: string) {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Unauthorized");

  const validStatuses = ["community-submitted", "facility-owned", "verified"];
  if (!validStatuses.includes(newStatus)) throw new Error("Invalid status");

  const supabase = await createAdminSupabaseClient();

  // Get current status for audit log
  const { data: current } = await supabase
    .from("facilities")
    .select("verification_status, name")
    .eq("id", facilityId)
    .single();

  // Update badge
  const { error } = await supabase
    .from("facilities")
    .update({ verification_status: newStatus })
    .eq("id", facilityId);

  if (error) throw new Error(error.message);

  // Write to audit log
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
