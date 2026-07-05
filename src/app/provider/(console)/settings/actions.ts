"use server";

import { revalidatePath } from "next/cache";
import { getProviderAccount, createProviderSupabaseClient } from "@/lib/supabase/provider-client";

export async function updateAccountDetails(data: {
  display_name?: string;
  claimant_role?: string;
  phone?: string;
  facility_phone?: string;
}) {
  const provider = await getProviderAccount();
  if (!provider) return { error: "Not authenticated." };

  const supabase = await createProviderSupabaseClient();

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
