"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ensureClaimId } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { buildFacilityFieldsFromClaim } from "@/lib/provider/facility-field-mapping";

export async function saveStep3(formData: FormData) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) {
    console.error("saveStep3: could not find or create claim for provider", provider.id);
    redirect("/provider/onboarding/services");
  }

  const services = formData.getAll("services") as string[];
  const workingDays = formData.get("working_days") as string;
  const workingHours = formData.get("working_hours") as string;
  const scheduleJson = formData.get("schedule_json") as string;
  const schedule = scheduleJson ? JSON.parse(scheduleJson) : null;
  const appointmentModalitiesJson = formData.get(
    "appointment_modalities_json",
  ) as string;
  const appointmentModalities = appointmentModalitiesJson
    ? JSON.parse(appointmentModalitiesJson)
    : null;
  const holidayHours = formData.get("holiday_hours") as string;
  const emergencyType = formData.get("emergency_type") as string;
  const walkinAppointment = formData.get("walkin_appointment") as string;
  const checkupOffered = formData.get("checkup_offered") === "yes";
  const checkupPdfUrl = formData.get("checkup_pdf_url") as string;
  const checkupPackagesJson = formData.get("checkup_packages_json") as string;
  const checkupPackages = checkupPackagesJson
    ? JSON.parse(checkupPackagesJson)
    : null;
  const checkupNote = formData.get("checkup_note") as string;
  const paymentMethods = formData.getAll("payment_methods") as string[];
  const insuranceAccepted = paymentMethods.includes("Insurance");
  const insuranceNote = formData.get("insurance_note") as string;
  const categoryDataJson = formData.get("category_data_json") as string;
  const categoryData = categoryDataJson ? JSON.parse(categoryDataJson) : null;

  const { error } = await supabase
    .from("facility_claims")
    .update({
      proposed_services: services.length > 0 ? services : null,
      proposed_working_days: workingDays || null,
      proposed_working_hours: workingHours || null,
      proposed_schedule: schedule,
      proposed_holiday_hours: holidayHours || null,
      proposed_emergency_type: emergencyType || null,
      proposed_walkin_appointment: walkinAppointment || null,
      proposed_appointment_modalities: appointmentModalities,
      proposed_booking_link:
        appointmentModalities?.find(
          (m: { type: string; value: string }) => m.type === "online",
        )?.value ?? null,
      proposed_checkup_offered: checkupOffered,
      proposed_checkup_pdf_url: checkupPdfUrl || null,
      proposed_checkup_packages: checkupPackages,
      proposed_checkup_note: checkupNote || null,
      proposed_payment_methods: paymentMethods.length > 0 ? paymentMethods : null,
      proposed_insurance_accepted: insuranceAccepted,
      proposed_insurance_note: insuranceAccepted ? insuranceNote || null : null,
      proposed_category_data: categoryData,
      submission_step: 4,
    })
    .eq("id", claimId);

  if (error) {
    console.error("saveStep3 failed:", error.message);
    redirect("/provider/onboarding/services");
  }

  const { data: updatedClaim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (updatedClaim) {
    const completionPct = calculateCompletion(updatedClaim);
    await supabase
      .from("provider_accounts")
      .update({ completion_pct: completionPct })
      .eq("id", provider.id);
  }

  // phase 4 = doctors (the step they land on next), matching login's phaseToSlug map
  await supabase
    .from("provider_accounts")
    .update({ onboarding_phase: 4, last_active_at: new Date().toISOString() })
    .eq("id", provider.id);

  // Approved providers editing live — go to next step, not milestone
  if ((updatedClaim?.status as string | undefined) === "approved") {
    redirect("/provider/onboarding/doctors");
  }
  redirect("/provider/onboarding/milestone");
}

export async function autoSaveStep3(data: Record<string, unknown>) {
  const provider = await getProviderAccount();
  if (!provider) return;

  const supabase = await createProviderSupabaseClient();
  const claimId = await ensureClaimId(supabase, provider.id, provider.facility_id ?? null);
  if (!claimId) return;

  const allowed = [
    "proposed_services",
    "proposed_working_days",
    "proposed_working_hours",
    "proposed_schedule",
    "proposed_holiday_hours",
    "proposed_emergency_type",
    "proposed_walkin_appointment",
    "proposed_appointment_modalities",
    "proposed_booking_link",
    "proposed_checkup_offered",
    "proposed_checkup_pdf_url",
    "proposed_checkup_packages",
    "proposed_checkup_note",
    "proposed_payment_methods",
    "proposed_insurance_accepted",
    "proposed_insurance_note",
    "proposed_category_data",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  // "Insurance" ticked in payment_methods is the sole insurance-accepted signal
  // now (Step 3 consolidation) — keep the legacy boolean column in sync.
  if (data.proposed_payment_methods !== undefined) {
    const methods = data.proposed_payment_methods as string[];
    updates.proposed_insurance_accepted = methods.includes("Insurance");
  }

  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from("facility_claims")
    .update(updates)
    .eq("id", claimId);

  if (error) {
    console.error("autoSaveStep3 failed:", error.message);
    return;
  }

  const { data: updatedClaim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (updatedClaim) {
    const completionPct = calculateCompletion(updatedClaim);
    await supabase
      .from("provider_accounts")
      .update({ completion_pct: completionPct })
      .eq("id", provider.id);

    if ((updatedClaim.status as string) === "approved" && updatedClaim.facility_id) {
      const toSync = buildFacilityFieldsFromClaim(updatedClaim);
      const { data: syncedRows, error: liveUpdateError } = await supabase
        .from("facilities")
        .update({ ...toSync, updated_at: new Date().toISOString() })
        .eq("id", updatedClaim.facility_id as string)
        .select("id");
      if (liveUpdateError) console.error("autoSaveStep3 live sync failed:", liveUpdateError.message);
      else if (!syncedRows || syncedRows.length === 0) {
        console.error("autoSaveStep3 live sync affected 0 rows — likely blocked by facilities RLS policy", updatedClaim.facility_id);
      }
    }
  }
}
