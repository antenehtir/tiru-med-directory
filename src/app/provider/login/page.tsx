import { ProviderLoginForm } from "@/components/provider/ProviderLoginForm";

export const metadata = { title: "Provider Sign In — Tiru" };

export default function ProviderLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Tiru Provider</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your facility listing
          </p>
        </div>
        <ProviderLoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New provider?{" "}
          <a className="text-primary hover:underline" href="/provider/signup">
            Register your facility
          </a>
        </p>
      </div>
    </div>
  );
}
