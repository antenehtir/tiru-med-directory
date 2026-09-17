import { ProviderSignupForm } from "@/components/provider/ProviderSignupForm";
import { ClaimFacilityForm } from "@/components/provider/ClaimFacilityForm";
import { createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { getActiveFacilityCount } from "@/lib/supabase/get-facilities";
import { loadClaimableFacility } from "@/lib/provider/claim-facility";

export const metadata = { title: "Register Your Facility — Tiru" };

// The front door of the provider portal, and the one place the claim and
// new-listing paths split:
//
//   /provider/signup                 → "is your facility already on Tiru?"
//   /provider/signup?claim=<id>      → short sign-up that claims that facility
//   /provider/signup?path=new        → new-listing sign-up (unchanged), then
//                                      verification and the onboarding wizard
//
// Every "List your facility" link already points here, so they all reach the
// search first without being changed. ?facility_name= is an older link shape
// that pre-fills the new-listing form, and still does.
export default async function ProviderSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string; path?: string; facility_name?: string }>;
}) {
  const params = await searchParams;

  if (params.claim) {
    const supabase = await createProviderSupabaseClient();
    const claimable = await loadClaimableFacility(supabase, params.claim);

    return (
      <Page
        subtitle="Tell us who you are. We'll verify you with the facility, then hand the listing over to you."
        title="Claim your facility"
      >
        {claimable.ok ? (
          <ProviderSignupForm
            claimFacility={{
              id: claimable.facility.id,
              name: claimable.facility.name,
              location:
                [claimable.facility.area, claimable.facility.sub_city].filter(Boolean).join(", ") || null,
            }}
          />
        ) : (
          <div className="space-y-4">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              {claimable.reason === "already_managed"
                ? "This facility is already managed by a verified account. If you work there, contact the Tiru team and we'll sort it out."
                : "That facility could not be found. Search for it again below."}
            </p>
            <ClaimFacilityForm />
          </div>
        )}
      </Page>
    );
  }

  if (params.path === "new" || params.facility_name) {
    return (
      <Page
        subtitle="Create an account to add your facility to Tiru. It's free."
        title="List a new facility"
      >
        <ProviderSignupForm />
      </Page>
    );
  }

  const facilityCount = await getActiveFacilityCount();

  return (
    <Page
      subtitle={`${facilityCount > 0 ? `Tiru already lists ${facilityCount} facilities. ` : ""}Search for yours — if it's here, claim it instead of creating it again.`}
      title="Is your facility already on Tiru?"
    >
      <ClaimFacilityForm />
    </Page>
  );
}

function Page({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <a className="text-primary hover:underline" href="/provider/login">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
