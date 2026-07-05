import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { Step6ReviewForm } from "@/components/provider/steps/Step6ReviewForm";

export default async function ReviewStepPage() {
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

  if (claim.status === "approved") {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-teal-100 text-3xl text-teal-600">
            ✓
          </div>
          <h1 className="text-lg font-bold text-foreground">Your listing is live</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your facility is published on the Tiru Medical Directory with the Official badge.
            Changes you make go live immediately — no resubmission needed.
          </p>
          <div className="mt-6 space-y-2">
            <a
              className="block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              href="/provider/dashboard"
            >
              Go to dashboard →
            </a>
            <a
              className="block text-sm text-muted-foreground hover:text-foreground"
              href="/provider/onboarding/identity"
            >
              Continue editing →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (claim.status === "pending_review") {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-teal-100 text-3xl text-teal-600">
            ✓
          </div>
          <h1 className="text-lg font-bold text-foreground">Your listing has been submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your listing is currently under review. You cannot make changes while it is being
            reviewed. An admin will contact your registered facility number to verify your claim.
          </p>
          <div className="mt-6 space-y-2">
            <a
              className="block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              href="/provider/onboarding/milestone"
            >
              View submission status →
            </a>
            <a
              className="block text-sm text-muted-foreground hover:text-foreground"
              href="/provider/dashboard"
            >
              Go to dashboard →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Step6ReviewForm claim={claim} />
    </div>
  );
}
