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

type ClaimRow = Record<string, unknown>;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildFacilityFieldsFromClaim(claim: ClaimRow): Record<string, unknown> {
  return {
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
  };
}

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
    ...buildFacilityFieldsFromClaim(claim),
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
): Promise<{ warning?: string; error?: string } | void> {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createAdminSupabaseClient();

  // Mark provider verified — runs for both existing-facility and new-listing paths.
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

  if (facilityId) {
    // Claiming an existing seeded facility — flip it to Official and merge
    // the provider's onboarding submission into the live facility record.
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
  } else {
    // New listing — provider submitted data for a facility not yet in the DB.
    // Find the submitted claim, create a facilities row from it, then wire
    // provider_accounts and facility_claims back to the new row.
    const { data: claim } = await supabase
      .from("facility_claims")
      .select("*")
      .eq("provider_id", providerId)
      .eq("status", "pending_review")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!claim) {
      console.error("approveClaim: no pending_review claim for new listing", { providerId });
      return { error: "No submitted claim found for this provider. Cannot complete approval." };
    }

    const proposedName = (claim.proposed_name as string | null) ?? "";
    if (!proposedName) {
      return { error: "Claim has no facility name — cannot create a facilities record." };
    }

    // Generate a URL-safe slug; append a short suffix if the base slug is taken.
    const rawSlug = toSlug(proposedName);
    const baseSlug = rawSlug || `new-facility-${(claim.id as string).slice(0, 8)}`;
    const { data: slugConflict } = await supabase
      .from("facilities")
      .select("id")
      .eq("slug", baseSlug)
      .maybeSingle();
    const slug = slugConflict
      ? `${baseSlug}-${(claim.id as string).slice(0, 6)}`
      : baseSlug;

    const filteredFields = Object.fromEntries(
      Object.entries(buildFacilityFieldsFromClaim(claim)).filter(
        ([, v]) => v !== null && v !== undefined && v !== "",
      ),
    );

    // Assign the next record_number so the admin Facility Directory shows a #.
    const { data: maxRecord } = await supabase
      .from("facilities")
      .select("record_number")
      .order("record_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextRecordNumber = ((maxRecord?.record_number as number | null) ?? 0) + 1;

    const { data: newFacility, error: insertError } = await supabase
      .from("facilities")
      .insert({
        ...filteredFields,
        name: proposedName,
        slug,
        category: (claim.facility_type as string | null) ?? "Other",
        verification_status: "facility-owned",
        record_number: nextRecordNumber,
        updated_at: new Date().toISOString(),
      })
      .select("id, name")
      .single();

    if (insertError || !newFacility) {
      console.error("approveClaim: failed to insert new facility row", insertError?.message);
      // Flip facility_claims anyway so the provider isn't stuck at pending_review.
      await supabase
        .from("facility_claims")
        .update({ status: "approved" })
        .eq("id", claim.id as string);
      return {
        warning: `Approved but facility record creation failed: ${insertError?.message ?? "unknown error"}. Create the facilities row manually in Supabase.`,
      };
    }

    // Link provider_accounts and facility_claims to the new facilities row.
    await supabase
      .from("provider_accounts")
      .update({ facility_id: newFacility.id })
      .eq("id", providerId);

    await supabase
      .from("facility_claims")
      .update({ status: "approved", facility_id: newFacility.id })
      .eq("id", claim.id as string);

    await supabase.from("audit_log").insert({
      admin_id: admin.id,
      action: "claim_approved_new_listing",
      entity_type: "facility",
      entity_id: newFacility.id,
      note: `New facility "${newFacility.name}" (slug: ${slug}) created and approved from provider claim ${claim.id as string}. ${callNotes}`,
    });
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
