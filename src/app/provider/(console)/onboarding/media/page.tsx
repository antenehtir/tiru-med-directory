import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { Step5MediaForm } from "@/components/provider/steps/Step5MediaForm";

export default async function MediaStepPage() {
  const result = await getOrCreateClaim();
  if (!result) redirect("/provider/login");

  const { claim } = result;
  if (!claim) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-sm text-red-500">Could not load your draft.</p>
      </div>
    );
  }

  // Falls back to the legacy single-URL column for claims saved before the
  // multi-photo gallery migration (supabase/migrations_draft/032_*.sql) adds
  // proposed_entrance_photo_urls.
  const legacyEntrancePhoto = (claim.proposed_entrance_photo_url as string) ?? "";
  const entrancePhotoUrls = Array.isArray(claim.proposed_entrance_photo_urls)
    ? (claim.proposed_entrance_photo_urls as string[]).filter(Boolean)
    : legacyEntrancePhoto
      ? [legacyEntrancePhoto]
      : [];

  const initialData = {
    entrance_photo_urls: entrancePhotoUrls,
    logo_url: (claim.proposed_logo_url as string) ?? "",
    license_url: (claim.proposed_license_url as string) ?? "",
    license_issue_date: (claim.proposed_license_issue_date as string) ?? "",
    license_expiry_date: (claim.proposed_license_expiry_date as string) ?? "",
    business_license_url: (claim.proposed_business_license_url as string) ?? "",
    business_license_issue_date: (claim.proposed_business_license_issue_date as string) ?? "",
    business_license_expiry_date: (claim.proposed_business_license_expiry_date as string) ?? "",
  };

  // Pharmacies skip the Doctors step entirely — send them back to Services
  // instead of a step they never saw.
  const backHref =
    claim.facility_type === "Pharmacy"
      ? "/provider/onboarding/services"
      : "/provider/onboarding/doctors";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Step5MediaForm
        backHref={backHref}
        claimId={claim.id as string}
        claimStatus={(claim.status as string) ?? null}
        initialData={initialData}
      />
    </div>
  );
}
