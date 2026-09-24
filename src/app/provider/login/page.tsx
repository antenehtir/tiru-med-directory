import { ProviderLoginForm } from "@/components/provider/ProviderLoginForm";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata = { title: "Provider Sign In — Tiru Health" };

export default function ProviderLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-[image:var(--home-hero)] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-foreground">Provider sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your facility listing
          </p>
        </div>
        <ProviderLoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New provider?{" "}
          <a className="text-primary hover:underline" href="/provider/signup">
            List or claim your facility
          </a>
        </p>
      </div>
    </div>
  );
}
