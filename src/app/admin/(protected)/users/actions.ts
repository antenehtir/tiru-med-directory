"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

// displayName/role are accepted now and wired up by AdminUserList's form, but
// unused until inviting via Supabase Auth is implemented here.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addAdminUser(email: string, displayName: string, role: string) {
  const currentAdmin = await getAdminUser();
  if (!currentAdmin || currentAdmin.role !== "super_admin") {
    return { error: "Only super admins can add admin users." };
  }

  const supabase = await createAdminSupabaseClient();

  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { error: "This email is already an admin user." };
  }

  return {
    error:
      "User must be created in Supabase Auth first. Go to Supabase Dashboard → Authentication → Users → Create new user, then try again.",
  };
}

export async function updateAdminRole(userId: string, newRole: string) {
  const currentAdmin = await getAdminUser();
  if (!currentAdmin || currentAdmin.role !== "super_admin") return;

  const validRoles = ["admin", "super_admin"];
  if (!validRoles.includes(newRole)) return;

  const supabase = await createAdminSupabaseClient();

  await supabase.from("admin_users").update({ role: newRole }).eq("id", userId);

  await supabase.from("audit_log").insert({
    admin_id: currentAdmin.id,
    action: "update_admin_role",
    entity_type: "admin_user",
    entity_id: userId,
    new_value: { role: newRole },
    note: `Admin role updated to ${newRole}`,
  });

  revalidatePath("/admin/users");
}

export async function removeAdminUser(userId: string) {
  const currentAdmin = await getAdminUser();
  if (!currentAdmin || currentAdmin.role !== "super_admin") return;

  const supabase = await createAdminSupabaseClient();

  await supabase.from("admin_users").delete().eq("id", userId);

  await supabase.from("audit_log").insert({
    admin_id: currentAdmin.id,
    action: "remove_admin_user",
    entity_type: "admin_user",
    entity_id: userId,
    note: "Admin user removed",
  });

  revalidatePath("/admin/users");
}
