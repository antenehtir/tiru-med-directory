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

  if (claim.status === "pending_review") {
    return (
      <div className="flex items-center justify-center px-4 py-16">
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Step5MediaForm claimId={claim.id as string} initialData={initialData} />
    </div>
  );
}
