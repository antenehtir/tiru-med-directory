import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata = { title: "Admin Login — Tiru Health" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-[image:var(--home-hero)] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <BrandMark />
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage the directory
          </p>
        </div>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
