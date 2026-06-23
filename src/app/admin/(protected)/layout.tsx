import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/admin-client";
import { AdminSidebar, AdminBottomNav } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Tiru Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-foreground">Tiru</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:block">
            {adminUser.display_name ?? adminUser.email}
          </span>
          <a
            className="text-sm text-muted-foreground hover:text-foreground"
            href="/admin/logout"
          >
            Sign out
          </a>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-8 pb-20 sm:px-8 lg:ml-56 lg:pb-8">
          {children}
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
