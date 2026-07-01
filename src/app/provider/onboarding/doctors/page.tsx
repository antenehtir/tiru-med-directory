import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { OnboardingShell } from "@/components/provider/OnboardingShell";
import { Step4DoctorsForm } from "@/components/provider/steps/Step4DoctorsForm";

// MANUAL SETUP REQUIRED: Create 'doctor-photos' bucket in Supabase dashboard
// Settings: Public bucket, allowed MIME types: image/jpeg, image/png, image/webp, max size 2MB
// Then add RLS policy: allow insert for authenticated users
// And: GRANT SELECT ON storage.objects TO anon;

export default async function DoctorsStepPage() {
  const result = await getOrCreateClaim();
  if (!result) redirect("/provider/login");

  const { claim } = result;
  if (!claim) {
    return (
      <OnboardingShell completionPct={0} currentStep={4}>
        <p className="text-sm text-red-500">Could not load your draft.</p>
      </OnboardingShell>
    );
  }

  if (claim.status === "pending_review") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-teal-100 text-3xl text-teal-600">✓</div>
          <h1 className="text-lg font-bold text-foreground">Your listing is under review</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your listing cannot be edited while it is under review. An admin will contact
            your facility to verify your claim.
          </p>
          <div className="mt-6 space-y-2">
            <a className="block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90" href="/provider/onboarding/milestone">
              View submission status →
            </a>
            <a className="block text-sm text-muted-foreground hover:text-foreground" href="/provider/dashboard">
              Go to dashboard →
            </a>
          </div>
        </div>
      </div>
    );
  }

  const completion = calculateCompletion(claim);
  const isLiveEdit = (claim.status as string) === "approved";

  return (
    <OnboardingShell completionPct={completion} currentStep={4} isLiveEdit={isLiveEdit}>
      <Step4DoctorsForm claim={claim} />
    </OnboardingShell>
  );
}
