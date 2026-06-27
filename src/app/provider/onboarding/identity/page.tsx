import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { OnboardingShell } from "@/components/provider/OnboardingShell";
import { Step1IdentityForm } from "@/components/provider/steps/Step1IdentityForm";

export default async function IdentityStepPage() {
  const result = await getOrCreateClaim();
  if (!result) redirect("/provider/login");

  const { provider, claim } = result;
  if (!claim) {
    return (
      <OnboardingShell completionPct={0} currentStep={1}>
        <p className="text-sm text-red-500">
          Could not load your draft. Please refresh or contact support.
        </p>
      </OnboardingShell>
    );
  }

  const completion = calculateCompletion(claim);

  return (
    <OnboardingShell completionPct={completion} currentStep={1}>
      <Step1IdentityForm
        claim={claim}
        facilityName={(provider.facilities as { name?: string } | null)?.name ?? ""}
      />
    </OnboardingShell>
  );
}
