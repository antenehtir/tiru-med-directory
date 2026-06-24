"use server";

import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string; success?: boolean }> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { error: "Not authenticated." };

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const supabase = await createAdminSupabaseClient();

  // Verify current password by attempting sign-in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: adminUser.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect." };
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // Log to audit trail
  await supabase.from("audit_log").insert({
    admin_id: adminUser.id,
    action: "change_password",
    entity_type: "admin_user",
    entity_id: adminUser.id,
    note: "Admin changed their own password",
  });

  return { success: true };
}
