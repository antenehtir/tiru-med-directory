// Shared mapping from facility_claims.proposed_* fields to their facilities table equivalents.
// Used by:
//   - Admin claim approval (approveClaim / mergeProposedDataIntoFacility) to populate the
//     facilities row when a claim is first approved.
//   - Approved-provider step saves: every autoSaveStepN below calls syncToFacilityIfApproved,
//     which checks claim.status === 'approved' itself and, if so, pushes the updated proposed
//     values directly to the live facilities row with no re-approval gate.

import type { createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { summarizeFacilityChanges } from "@/lib/audit/change-summary";

type ClaimRow = Record<string, unknown>;
type ProviderSupabaseClient = Awaited<ReturnType<typeof createProviderSupabaseClient>>;

export function buildFacilityFieldsFromClaim(claim: ClaimRow): Record<string, unknown> {
  return {
    name: claim.proposed_name,
    alt_name: claim.proposed_alt_name,
    ownership_type: claim.proposed_ownership_type,
    branch_count: claim.proposed_branch_count,
    description: claim.proposed_description,
    languages: claim.proposed_languages,
    patient_groups: claim.proposed_patient_groups,
    sub_city: claim.proposed_sub_city,
    area: claim.proposed_area,
    landmark: claim.proposed_landmark,
    building_desc: claim.proposed_building_desc,
    access_notes: claim.proposed_access_notes,
    latitude: claim.proposed_latitude,
    longitude: claim.proposed_longitude,
    maps_link: claim.proposed_maps_link,
    phone: claim.proposed_phone,
    phone_2: claim.proposed_phone_2,
    whatsapp: claim.proposed_whatsapp,
    telegram: claim.proposed_telegram,
    email: claim.proposed_email,
    website: claim.proposed_website,
    instagram: claim.proposed_instagram,
    facebook: claim.proposed_facebook,
    tiktok: claim.proposed_tiktok,
    linkedin: claim.proposed_linkedin,
    youtube: claim.proposed_youtube,
    services: claim.proposed_services,
    special_services: claim.proposed_special_services,
    working_hours: claim.proposed_working_hours,
    booking_link: claim.proposed_booking_link,
    logo_url: claim.proposed_logo_url,
    // No separate entrance_photo_url column — maps to the main public photo column.
    photo_url: claim.proposed_entrance_photo_url,
    // Up to 4 gallery images. Requires migration 032 (facilities.photo_urls).
    photo_urls: claim.proposed_entrance_photo_urls,
    // Requires migration 025 columns (schedule, doctors, emergency_type, walkin_appointment).
    schedule: claim.proposed_schedule,
    doctors: claim.proposed_doctors,
    emergency_type: claim.proposed_emergency_type,
    walkin_appointment: claim.proposed_walkin_appointment,
    checkup_offered: claim.proposed_checkup_offered,
    checkup_pdf_url: claim.proposed_checkup_pdf_url,
    checkup_note: claim.proposed_checkup_note,
    checkup_packages: claim.proposed_checkup_packages,
    appointment_modalities: claim.proposed_appointment_modalities,
    // Category-tagged custom "other" service entries. Requires migration 035
    // (facilities.custom_service_categories).
    custom_service_categories: claim.proposed_custom_service_categories,
    payment_methods: claim.proposed_payment_methods,
    insurance_accepted: claim.proposed_insurance_accepted,
    insurance_note: claim.proposed_insurance_note,
    branches: claim.proposed_branches,
  };
}

// Strips null / undefined / empty-string values before writing to facilities,
// so a blank proposed field never silently clears a value the admin set at approval time.
export function filterNonEmpty(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  );
}

// Every provider edit to an already-approved listing is supposed to land on
// the public facilities row immediately. It silently didn't for 2.5 months
// (2026-07-02 to 2026-09-15): facilities had RLS enabled with no UPDATE
// policy for the provider role, so this write matched 0 rows and returned
// success with no error — nothing surfaced it until someone happened to
// compare the claim against the live row by hand. See
// supabase/migrations_draft/028_facilities_provider_update_policy.sql for
// the policy that actually fixes the write, and 056/057/058 for the one
// facility that drifted before it was applied.
//
// Logging every attempt to audit_log (success AND failure) is the other half
// of the fix: the next time a write is blocked for any reason — a new column
// added without matching RLS coverage, say — it shows up on
// /admin/audit-log instead of requiring another by-hand comparison.
//
// That logging caught a second, previously invisible bug within hours of
// shipping: a claim whose proposed_name had never been set (a provider who
// never revisited the identity step after their listing went live) sent
// name: null into this UPDATE, and facilities.name is NOT NULL — so the
// WHOLE write failed, including an unrelated services edit the provider
// actually made. filterNonEmpty (below) is the fix the admin approval path
// already had (mergeProposedDataIntoFacility calls it) and this one never
// did — RLS blocking every write at 0 rows matched meant this had no chance
// to surface until 028 let the write actually reach the table.
//
// name is additionally hard-excluded, always, regardless of caller: once a
// listing is public its name only changes through requestFacilityNameChange
// (src/app/provider/(console)/onboarding/identity/actions.ts, admin-
// reviewed), never through an ordinary autosave on any step.
export async function syncToFacilityIfApproved(
  supabase: ProviderSupabaseClient,
  claim: ClaimRow,
  options?: { excludeFields?: string[]; changeNote?: string },
): Promise<void> {
  if ((claim.status as string) !== "approved" || !claim.facility_id) return;

  const facilityId = claim.facility_id as string;
  const providerId = claim.provider_id as string;
  const changeNote = options?.changeNote ?? "listing details";

  const toSync = filterNonEmpty(buildFacilityFieldsFromClaim(claim));
  delete toSync.name;
  for (const field of options?.excludeFields ?? []) delete toSync[field];

  // What the live row holds right now, limited to the columns about to be
  // written. Two things depend on this: the audit entry can say what
  // actually changed instead of just "something was saved", and an autosave
  // that changed nothing (a blur with no edit, a second fire of the same
  // save) can stop here rather than writing a row and logging a no-op —
  // which is what put two identical entries in the log seconds apart.
  const { data: before } = await supabase
    .from("facilities")
    .select(Object.keys(toSync).join(", "))
    .eq("id", facilityId)
    .single();

  const { changed, old_value, new_value, changedLabels } = summarizeFacilityChanges(
    before as Record<string, unknown> | null,
    toSync,
  );

  // Only skip on a snapshot we actually read: if that select came back
  // empty, "nothing changed" is indistinguishable from "we can't see the
  // row", and the second one is the case worth writing through to find out.
  if (before && changed.length === 0) return;

  const { data: syncedRows, error } = await supabase
    .from("facilities")
    .update({ ...toSync, updated_at: new Date().toISOString() })
    .eq("id", facilityId)
    .select("id");

  // The attempted change rides along on all three outcomes, so a failed or
  // blocked entry says what was lost, not just that something was.
  const attempted = { old_value, new_value };

  if (error) {
    console.error("syncToFacilityIfApproved failed:", error.message);
    await logProviderAudit(supabase, {
      ...attempted,
      providerId,
      facilityId,
      action: "provider_live_sync_failed",
      note: `Edit to ${changedLabels || changeNote} failed to save to the public page: ${error.message}`,
    });
    return;
  }

  if (!syncedRows || syncedRows.length === 0) {
    console.error(
      "syncToFacilityIfApproved affected 0 rows — likely blocked by facilities RLS policy",
      facilityId,
    );
    await logProviderAudit(supabase, {
      ...attempted,
      providerId,
      facilityId,
      action: "provider_live_sync_blocked",
      note: `Edit to ${changedLabels || changeNote} did not reach the public page (0 rows updated — check the facilities RLS policy)`,
    });
    return;
  }

  await logProviderAudit(supabase, {
    ...attempted,
    providerId,
    facilityId,
    action: "provider_edit_synced",
    note: `Updated ${changedLabels || changeNote}`,
  });
}

// A failed audit-log write must never take down the actual save it is
// describing — the facility write above has already happened (or already
// failed) by the time this runs, so this only ever adds a record of it.
async function logProviderAudit(
  supabase: ProviderSupabaseClient,
  entry: {
    providerId: string;
    facilityId: string;
    action: string;
    note: string;
    old_value: Record<string, unknown>;
    new_value: Record<string, unknown>;
  },
): Promise<void> {
  try {
    const { error } = await supabase.from("audit_log").insert({
      provider_id: entry.providerId,
      action: entry.action,
      entity_type: "facility",
      entity_id: entry.facilityId,
      old_value: entry.old_value,
      new_value: entry.new_value,
      note: entry.note,
    });
    if (error) console.error("audit_log insert failed:", error.message);
  } catch (err) {
    console.error("audit_log insert threw:", err);
  }
}
