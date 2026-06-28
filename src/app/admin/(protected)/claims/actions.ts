"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

export async function approveClaim(
  providerId: string,
  facilityId: string | null,
  callNotes: string,
) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createAdminSupabaseClient();

  // Mark provider verified
  await supabase
    .from("provider_accounts")
    .update({
      verification_status_internal: "verified",
      verification_call_notes: callNotes,
      status: "approved",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", providerId);

  // If claiming an existing facility, flip it to Official
  if (facilityId) {
    const { data: facility } = await supabase
      .from("facilities")
      .select("name, verification_status")
      .eq("id", facilityId)
      .single();

    // Ownership is tracked via provider_accounts.facility_id (set when the
    // provider selected this facility) — facilities.claimed_by is a separate
    // FK to admin_users and isn't used for provider self-service claims.
    await supabase
      .from("facilities")
      .update({ verification_status: "facility-owned" })
      .eq("id", facilityId);

    await supabase.from("audit_log").insert({
      admin_id: admin.id,
      action: "approve_claim",
      entity_type: "facility",
      entity_id: facilityId,
      new_value: { verification_status: "facility-owned" },
      note: `Claim approved for ${facility?.name}. ${callNotes}`,
    });
  }

  revalidatePath("/admin/claims");
  revalidatePath("/admin");
}

export async function rejectClaim(providerId: string, reason: string) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createAdminSupabaseClient();

  await supabase
    .from("provider_accounts")
    .update({
      verification_status_internal: "rejected",
      status: "rejected",
      admin_note: reason,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", providerId);

  await supabase.from("audit_log").insert({
    admin_id: admin.id,
    action: "reject_claim",
    entity_type: "provider_account",
    entity_id: providerId,
    note: `Claim rejected: ${reason}`,
  });

  revalidatePath("/admin/claims");
}

export async function saveCallNotes(providerId: string, notes: string) {
  const admin = await getAdminUser();
  if (!admin) return;

  const supabase = await createAdminSupabaseClient();
  await supabase
    .from("provider_accounts")
    .update({ verification_call_notes: notes })
    .eq("id", providerId);

  revalidatePath("/admin/claims");
}
