import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Admin Login — Tiru" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Tiru Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage the directory
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
