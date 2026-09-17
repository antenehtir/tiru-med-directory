"use server";

import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";
import {
  saveAboutSection,
  saveCheckupsSection,
  saveContactSection,
  saveDoctorsSection,
  saveIdentitySection,
  saveLocationSection,
  saveMediaSection,
  saveServicesSection,
  type FacilityAboutFields,
  type FacilityCheckupFields,
  type FacilityContactFields,
  type FacilityEditor,
  type FacilityIdentityFields,
  type FacilityLocationFields,
  type FacilityMediaFields,
  type FacilityServicesFields,
} from "@/lib/facility-edit/save-sections";

// Admin direct-edit save path for an existing, live facility row. Writes
// straight to `facilities`: this is an admin editing a listing that already
// exists, not an external submission being reviewed.
//
// Validation, the before-snapshot, the write and the audit entry live in
// lib/facility-edit/save-sections.ts, shared with the verified-provider
// editor. This file only establishes that the caller is an admin.

async function adminEditor(): Promise<FacilityEditor> {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Unauthorized");
  return { kind: "admin", id: adminUser.id, supabase: await createAdminSupabaseClient() };
}

export async function updateFacilityServices(facilityId: string, fields: FacilityServicesFields) {
  await saveServicesSection(await adminEditor(), facilityId, fields);
}

export async function updateFacilityContact(facilityId: string, fields: FacilityContactFields) {
  await saveContactSection(await adminEditor(), facilityId, fields);
}

export async function updateFacilityLocation(facilityId: string, fields: FacilityLocationFields) {
  await saveLocationSection(await adminEditor(), facilityId, fields);
}

export async function updateFacilityIdentity(facilityId: string, fields: FacilityIdentityFields) {
  await saveIdentitySection(await adminEditor(), facilityId, fields);
}

export async function updateFacilityAbout(facilityId: string, fields: FacilityAboutFields) {
  await saveAboutSection(await adminEditor(), facilityId, fields);
}

export async function updateFacilityCheckups(facilityId: string, fields: FacilityCheckupFields) {
  await saveCheckupsSection(await adminEditor(), facilityId, fields);
}

export async function updateFacilityDoctors(facilityId: string, doctors: unknown[]) {
  await saveDoctorsSection(await adminEditor(), facilityId, doctors);
}

export async function updateFacilityMedia(
  facilityId: string,
  fields: FacilityMediaFields,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await saveMediaSection(await adminEditor(), facilityId, fields);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed." };
  }
}
