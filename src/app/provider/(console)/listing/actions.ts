"use server";

import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import {
  saveAboutSection,
  saveCheckupsSection,
  saveContactSection,
  saveDoctorsSection,
  saveLocationSection,
  saveMediaSection,
  saveServicesSection,
  type FacilityAboutFields,
  type FacilityCheckupFields,
  type FacilityContactFields,
  type FacilityEditor,
  type FacilityLocationFields,
  type FacilityMediaFields,
  type FacilityServicesFields,
} from "@/lib/facility-edit/save-sections";

// The verified provider's side of the live facility editor. Same sections,
// same save path as /admin/facilities/[id]/edit (lib/facility-edit), scoped to
// the one facility this account was approved for.
//
// The facility id arrives from the browser, so it is never trusted on its
// own: it has to be the facility this account was verified for, and the
// account has to be approved. RLS (028, narrowed by 062) enforces the same
// thing underneath — this check exists so the refusal is a clear message
// rather than a zero-row update.
//
// No Identity section here: a facility's name and type change through
// requestFacilityNameChange / requestFacilityTypeChange, which put the change
// in front of an admin first.

async function ownFacilityEditor(facilityId: string): Promise<FacilityEditor> {
  const provider = await getProviderAccount();
  if (!provider) throw new Error("Please sign in again.");
  if (provider.status !== "approved" || !provider.facility_id) {
    throw new Error("Your listing can be edited once Tiru has verified your claim.");
  }
  if (provider.facility_id !== facilityId) {
    throw new Error("You can only edit the facility your account was verified for.");
  }
  return { kind: "provider", id: provider.id, supabase: await createProviderSupabaseClient() };
}

export async function updateOwnFacilityServices(facilityId: string, fields: FacilityServicesFields) {
  await saveServicesSection(await ownFacilityEditor(facilityId), facilityId, fields);
}

export async function updateOwnFacilityContact(facilityId: string, fields: FacilityContactFields) {
  await saveContactSection(await ownFacilityEditor(facilityId), facilityId, fields);
}

export async function updateOwnFacilityLocation(facilityId: string, fields: FacilityLocationFields) {
  await saveLocationSection(await ownFacilityEditor(facilityId), facilityId, fields);
}

export async function updateOwnFacilityAbout(facilityId: string, fields: FacilityAboutFields) {
  await saveAboutSection(await ownFacilityEditor(facilityId), facilityId, fields);
}

export async function updateOwnFacilityCheckups(facilityId: string, fields: FacilityCheckupFields) {
  await saveCheckupsSection(await ownFacilityEditor(facilityId), facilityId, fields);
}

export async function updateOwnFacilityDoctors(facilityId: string, doctors: unknown[]) {
  await saveDoctorsSection(await ownFacilityEditor(facilityId), facilityId, doctors);
}

export async function updateOwnFacilityMedia(
  facilityId: string,
  fields: FacilityMediaFields,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await saveMediaSection(await ownFacilityEditor(facilityId), facilityId, fields);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Save failed." };
  }
}
