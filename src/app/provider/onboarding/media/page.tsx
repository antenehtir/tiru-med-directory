import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { OnboardingShell } from "@/components/provider/OnboardingShell";
import { Step5MediaForm } from "@/components/provider/steps/Step5MediaForm";

export default async function MediaStepPage() {
  const result = await getOrCreateClaim();
  if (!result) redirect("/provider/login");

  const { claim } = result;
  if (!claim) {
    return (
      <OnboardingShell completionPct={0} currentStep={5}>
        <p className="text-sm text-red-500">Could not load your draft.</p>
      </OnboardingShell>
    );
  }

  const completion = calculateCompletion(claim);

  const initialData = {
    entrance_photo_url: (claim.proposed_entrance_photo_url as string) ?? "",
    logo_url: (claim.proposed_logo_url as string) ?? "",
    license_url: (claim.proposed_license_url as string) ?? "",
  };

  return (
    <OnboardingShell completionPct={completion} currentStep={5}>
      <Step5MediaForm claimId={claim.id as string} initialData={initialData} />
    </OnboardingShell>
  );
}
