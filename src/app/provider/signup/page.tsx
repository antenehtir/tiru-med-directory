import { ProviderSignupForm } from "@/components/provider/ProviderSignupForm";

export const metadata = { title: "Register Your Facility — Tiru" };

export default function ProviderSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Register your facility
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to claim or list your facility on Tiru.
            It&apos;s free.
          </p>
        </div>
        <ProviderSignupForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <a className="text-primary hover:underline" href="/provider/login">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
