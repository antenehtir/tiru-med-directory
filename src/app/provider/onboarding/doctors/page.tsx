import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { OnboardingShell } from "@/components/provider/OnboardingShell";
import { Step4DoctorsForm } from "@/components/provider/steps/Step4DoctorsForm";

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

  const completion = calculateCompletion(claim);

  return (
    <OnboardingShell completionPct={completion} currentStep={4}>
      <Step4DoctorsForm claim={claim} />
    </OnboardingShell>
  );
}
