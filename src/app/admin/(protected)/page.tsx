import { getAdminUser } from "@/lib/supabase/admin-client";

export default async function AdminDashboardPage() {
  const adminUser = await getAdminUser();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {adminUser?.display_name ?? adminUser?.email}.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Stats and review queues coming in the next step.
        </p>
      </div>
    </div>
  );
}
