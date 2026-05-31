import { PageContainer } from "@/components/layout/PageContainer";
import { CorrectionRequestCta } from "./CorrectionRequestCta";
import { ProviderTypeOptions } from "./ProviderTypeOptions";
import { RegisterHero } from "./RegisterHero";
import { RegistrationPreviewForm } from "./RegistrationPreviewForm";
import { RequestTypeOptions } from "./RequestTypeOptions";
import { TrustReviewNote } from "./TrustReviewNote";
import { VerificationExplanation } from "./VerificationExplanation";

export function RegisterPage() {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <RegisterHero />

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="grid gap-6">
            <ProviderTypeOptions />
            <RequestTypeOptions />
            <CorrectionRequestCta />
          </div>

          <RegistrationPreviewForm />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <VerificationExplanation />
          <TrustReviewNote />
        </div>
      </div>
    </PageContainer>
  );
}
