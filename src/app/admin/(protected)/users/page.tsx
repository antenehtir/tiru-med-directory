import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";
import { AdminUserList } from "@/components/admin/AdminUserList";

async function getAdminUsers() {
  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, role, display_name, created_at")
    .order("created_at", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export default async function AdminUsersPage() {
  const [adminUsers, currentUser] = await Promise.all([
    getAdminUsers(),
    getAdminUser(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage who has access to the Tiru admin panel
        </p>
      </div>
      <AdminUserList
        currentUserId={currentUser?.id ?? ""}
        users={adminUsers}
      />
    </div>
  );
}
