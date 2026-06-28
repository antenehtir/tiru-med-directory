import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { OnboardingShell } from "@/components/provider/OnboardingShell";
import { Step2LocationForm } from "@/components/provider/steps/Step2LocationForm";

export default async function LocationStepPage() {
  const result = await getOrCreateClaim();
  if (!result) redirect("/provider/login");

  const { claim } = result;
  if (!claim) {
    return (
      <OnboardingShell completionPct={0} currentStep={2}>
        <p className="text-sm text-red-500">
          Could not load your draft. Please refresh or contact support.
        </p>
      </OnboardingShell>
    );
  }

  const completion = calculateCompletion(claim);

  return (
    <OnboardingShell completionPct={completion} currentStep={2}>
      <Step2LocationForm claim={claim} />
    </OnboardingShell>
  );
}
