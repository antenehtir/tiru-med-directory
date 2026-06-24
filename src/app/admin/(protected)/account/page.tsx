import { getAdminUser } from "@/lib/supabase/admin-client";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function AdminAccountPage() {
  const adminUser = await getAdminUser();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your admin account settings
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Profile info */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">Profile</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Display name</p>
              <p className="mt-0.5 font-medium text-foreground">
                {adminUser?.display_name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-0.5 font-medium text-foreground">
                {adminUser?.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="mt-0.5 font-medium text-foreground capitalize">
                {adminUser?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <ChangePasswordForm />
      </div>
    </div>
  );
}
