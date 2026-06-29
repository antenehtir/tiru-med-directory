"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

// facility_claims.proposed_* fields with no matching column on the live
// facilities table (checked against src/lib/supabase/get-facilities.ts,
// scripts/seed-facilities.ts, and the admin facility list select — there is
// no canonical schema file since 001_create_facilities_table.sql is a
// stale, never-applied draft for a different table shape). These are
// captured during onboarding but currently have nowhere to land on the
// public facility record, so the merge below intentionally skips them.
// - proposed_landmark, proposed_building_desc, proposed_access_notes
// - proposed_whatsapp, proposed_tiktok, proposed_linkedin
// - proposed_schedule, proposed_emergency_type, proposed_walkin_appointment
// - proposed_appointment_modalities, proposed_payment_methods
// - proposed_checkup_offered, proposed_checkup_packages
// - proposed_doctors (doctors live in their own public.doctors table, not a facilities column)
// - proposed_branch_count, proposed_branches
// - proposed_description, proposed_languages, proposed_patient_groups, proposed_ownership_type
async function mergeProposedDataIntoFacility(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  adminId: string,
  providerId: string,
  facilityId: string,
): Promise<string | undefined> {
  const { data: claim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!claim) return undefined;

  // Flip the claim itself to approved regardless of merge outcome below —
  // the claim lifecycle shouldn't get stuck on a facilities write failure.
  await supabase.from("facility_claims").update({ status: "approved" }).eq("id", claim.id);

  const mergeObj: Record<string, unknown> = {
    name: claim.proposed_name,
    sub_city: claim.proposed_sub_city,
    area: claim.proposed_area,
    latitude: claim.proposed_latitude,
    longitude: claim.proposed_longitude,
    maps_link: claim.proposed_maps_link,
    phone: claim.proposed_phone,
    phone_2: claim.proposed_phone_2,
    telegram: claim.proposed_telegram,
    email: claim.proposed_email,
    website: claim.proposed_website,
    instagram: claim.proposed_instagram,
    facebook: claim.proposed_facebook,
    services: claim.proposed_services,
    working_hours: claim.proposed_working_hours,
    logo_url: claim.proposed_logo_url,
    // No dedicated entrance_photo_url column — maps onto the existing
    // photo_url column, which is the facility's main public photo.
    photo_url: claim.proposed_entrance_photo_url,
    verification_status: "facility-owned",
    updated_at: new Date().toISOString(),
  };

  const updateData = Object.fromEntries(
    Object.entries(mergeObj).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  );

  const { error } = await supabase.from("facilities").update(updateData).eq("id", facilityId);

  if (error) {
    console.error("Claim merge into facilities failed:", error.message);
    return "Approved but merge failed — please update the facility manually.";
  }

  await supabase.from("audit_log").insert({
    admin_id: adminId,
    action: "claim_approved_merged",
    entity_type: "facility",
    entity_id: facilityId,
    note: `Claim ${claim.id} approved and merged into facility record`,
  });

  return undefined;
}

export async function approveClaim(
  providerId: string,
  facilityId: string | null,
  callNotes: string,
): Promise<{ warning?: string } | void> {
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
      onboarding_phase: 8,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", providerId);

  let warning: string | undefined;

  // If claiming an existing facility, flip it to Official and merge the
  // provider's onboarding submission into the live facility record.
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

    // Never block the approval above on this — log/surface a warning instead.
    warning = await mergeProposedDataIntoFacility(supabase, admin.id, providerId, facilityId);
  }

  revalidatePath("/admin/claims");
  revalidatePath("/admin");

  return warning ? { warning } : undefined;
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

  // Keep the provider's facility_claims row in sync — the Provider
  // Dashboard drives its "rejected" state off facility_claims.status, not
  // provider_accounts.status.
  const { data: claim } = await supabase
    .from("facility_claims")
    .select("id")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (claim) {
    await supabase.from("facility_claims").update({ status: "rejected" }).eq("id", claim.id);
  }

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
