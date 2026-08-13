import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-sm text-red-500">Could not load your draft.</p>
      </div>
    );
  }

  // Pharmacies don't list doctors/named staff — this step is skipped
  // entirely for them (sidebar nav + saveStep3's phase routing already do
  // this in the normal flow); redirect here too in case of a direct link,
  // bookmark, or back-navigation to this route.
  if (claim.facility_type === "Pharmacy") {
    redirect("/provider/onboarding/media");
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Step4DoctorsForm claim={claim} />
    </div>
  );
}
