import { redirect } from "next/navigation";
import { getProviderAccount } from "@/lib/supabase/provider-client";

export default async function ProviderDashboardPage() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");
  if (!provider.facility_id) redirect("/provider/onboarding/claim");

  const facility = provider.facilities as {
    name: string;
    category: string;
    verification_status: string;
  } | null;

  const completion = provider.completion_pct ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-foreground">Tiru</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Provider
            </span>
          </div>
          <a
            className="text-sm text-muted-foreground hover:text-foreground"
            href="/provider/logout"
          >
            Sign out
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {facility?.name ?? "Your Facility"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {facility?.category}
          </p>
        </div>

        {/* Completion meter */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-foreground">Profile completion</p>
            <p className={`text-sm font-bold ${completion >= 70 ? "text-teal-600" : "text-amber-600"}`}>
              {completion}%
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                completion >= 70 ? "bg-teal-500" : "bg-amber-500"
              }`}
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 70 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Reach 70% to submit for Official status
            </p>
          ) : (
            <p className="mt-2 text-xs text-teal-600">
              ✓ Ready to submit for Official status
            </p>
          )}
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold text-foreground">Listing status</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {provider.status === "pending_review"
              ? "Your claim is under review. We'll notify you when it's approved."
              : provider.status === "approved"
                ? "Your facility is Official on Tiru."
                : provider.status === "rejected"
                  ? `Your claim was not approved. Reason: ${provider.admin_note ?? "Contact support."}`
                  : "Complete your profile to submit for Official status."}
          </p>
        </div>
      </main>
    </div>
  );
}
