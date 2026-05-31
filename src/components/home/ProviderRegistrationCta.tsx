import { PageContainer } from "@/components/layout/PageContainer";
import { ProviderRegistrationPanel } from "@/components/registration/ProviderRegistrationPanel";
import { ProviderTypeGrid } from "@/components/registration/ProviderTypeGrid";
import { RegistrationTrustNote } from "@/components/registration/RegistrationTrustNote";
import { VerificationProcessSteps } from "@/components/registration/VerificationProcessSteps";

export function ProviderRegistrationCta() {
  return (
    <section className="bg-card">
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <ProviderRegistrationPanel />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <ProviderTypeGrid />
          <div className="grid gap-4">
            <VerificationProcessSteps />
            <RegistrationTrustNote />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
