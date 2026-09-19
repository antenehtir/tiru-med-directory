"use server";

import { revalidatePath } from "next/cache";
import { getProviderAccount, createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { firstPhoneError } from "@/lib/phone";
import { isAccountLocked } from "@/lib/provider/account-lock";

export type AccountChangeField = "display_name" | "claimant_role" | "phone" | "facility_phone";

const FIELD_LABELS: Record<AccountChangeField, string> = {
  display_name: "Display name",
  claimant_role: "Role",
  phone: "Mobile number",
  facility_phone: "Facility phone",
};

export async function requestAccountChange(
  field: AccountChangeField,
  requestedValue: string,
  reason: string,
): Promise<{ ok: true } | { error: string }> {
  const provider = await getProviderAccount();
  if (!provider) return { error: "Not authenticated." };
  if (!(field in FIELD_LABELS)) return { error: "That detail can't be changed here." };

  const value = requestedValue.trim();
  const why = reason.trim();
  if (!value) return { error: `Enter the new ${FIELD_LABELS[field].toLowerCase()}.` };
  if (!why) return { error: "Tell us why it is changing." };
  if (field === "phone" || field === "facility_phone") {
    const problem = firstPhoneError([
      { label: FIELD_LABELS[field], value, kind: field === "phone" ? "personal" : "facility" },
    ]);
    if (problem) return { error: problem };
  }

  const current = (provider[field] as string | null) ?? null;
  if ((current ?? "").trim() === value) return { error: "That is already the value on file." };

  const supabase = await createProviderSupabaseClient();
  const { error } = await supabase.from("account_change_requests").insert({
    provider_id: provider.id,
    field,
    current_value: current,
    requested_value: value,
    reason: why,
  });
  if (error) {
    console.error("requestAccountChange failed:", error.message);
    return { error: "Could not send the request. Please try again." };
  }

  revalidatePath("/provider/settings");
  return { ok: true };
}

export async function updateAccountDetails(data: {
  display_name?: string;
  claimant_role?: string;
  phone?: string;
  facility_phone?: string;
}) {
  const provider = await getProviderAccount();
  if (!provider) return { error: "Not authenticated." };

  const supabase = await createProviderSupabaseClient();

  if (await isAccountLocked(supabase, provider as { id: string; status?: string | null })) {
    return { error: "These details are locked after submission. Use \"Request a change\" instead." };
  }

  const phoneProblem = firstPhoneError([
    { label: "Mobile number", value: data.phone, kind: "personal" },
    { label: "Facility phone", value: data.facility_phone },
  ]);
  if (phoneProblem) return { error: phoneProblem };

  const updates: Record<string, unknown> = {};
  if (data.display_name !== undefined) updates.display_name = data.display_name || null;
  if (data.claimant_role !== undefined) updates.claimant_role = data.claimant_role || null;
  if (data.phone !== undefined) updates.phone = data.phone || null;
  if (data.facility_phone !== undefined) updates.facility_phone = data.facility_phone || null;

  if (Object.keys(updates).length === 0) return { ok: true };

  const { error } = await supabase
    .from("provider_accounts")
    .update(updates)
    .eq("id", provider.id);

  if (error) return { error: error.message };

  revalidatePath("/provider/settings");
  return { ok: true };
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const supabase = await createProviderSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { error: "Not authenticated." };

  // Verify the current password by attempting a real sign-in before allowing
  // the change — supabase.auth.updateUser() has no "old password" check of
  // its own, so this is the reauthentication step.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) return { error: "Current password is incorrect." };

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { error: updateError.message };

  return { ok: true };
}
