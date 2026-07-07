"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

const VALID_STATUSES = ["pending", "reviewed", "resolved", "dismissed"] as const;
type CorrectionStatus = (typeof VALID_STATUSES)[number];

export async function updateCorrectionStatus(
  id: string,
  newStatus: CorrectionStatus,
  adminNote?: string,
) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createAdminSupabaseClient();

  const { data: correction } = await supabase
    .from("correction_requests")
    .select("provider_name")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("correction_requests")
    .update({
      status: newStatus,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      ...(adminNote !== undefined ? { admin_note: adminNote || null } : {}),
    })
    .eq("id", id);

  if (error) {
    console.error("updateCorrectionStatus failed:", error.message);
    return { error: error.message };
  }

  await supabase.from("audit_log").insert({
    admin_id: admin.id,
    action: "correction_reviewed",
    entity_type: "correction_request",
    entity_id: id,
    new_value: { status: newStatus },
    note: `Correction for "${correction?.provider_name ?? "unknown"}" marked ${newStatus}`,
  });

  revalidatePath("/admin/corrections");
  revalidatePath("/admin");
}
