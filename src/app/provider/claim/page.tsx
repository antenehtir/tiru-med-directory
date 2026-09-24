import { BrandMark } from "@/components/ui/BrandMark";
import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { VerificationForm } from "@/components/provider/VerificationForm";
import { SubmitButton } from "@/components/provider/SubmitButton";
import { chooseDifferentFacility } from "@/app/provider/claim/actions";
import { formatAddisDate } from "@/lib/addis-time";

export const metadata = { title: "Your claim — Tiru Health Provider Portal" };

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please fill in your role and phone number.",
  not_found: "That facility is no longer listed. Please choose it again.",
  already_managed:
    "This facility is already managed by a verified account. If you work there, contact the Tiru Health team and we'll sort it out.",
  save_failed: "Your claim could not be saved. Please try again.",
  bad_phone: "Please enter a working Ethiopian phone number, e.g. 0912 345 678 or +251 912 345 678.",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-background bg-[image:var(--home-hero)] px-4 py-12 sm:items-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        {children}
      </div>
    </div>
  );
}

function FacilityCard({
  facility,
}: {
  facility: { name: string; area: string | null; sub_city: string | null } | null;
}) {
  if (!facility) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Facility</p>
      <p className="mt-1 font-semibold text-foreground">{facility.name}</p>
      <p className="text-sm text-muted-foreground">
        {[facility.area, facility.sub_city].filter(Boolean).join(", ") || "Addis Ababa"}
      </p>
    </div>
  );
}

function ChooseDifferent() {
  return (
    <form action={chooseDifferentFacility} className="text-center">
      <SubmitButton className="mx-auto" loadingText="One moment…" variant="secondary">
        This isn&apos;t my facility — choose another
      </SubmitButton>
    </form>
  );
}

// One page for the whole claim, in whichever state it is in:
//   not yet submitted → the short form (role and contact, nothing else)
//   submitted         → what happens next, and nothing to do meanwhile
//   rejected          → why, and the way back in
// Approved providers are sent straight to their live listing.
export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");
  if (provider.status === "approved" && provider.facility_id) redirect("/provider/listing");
  if (!provider.facility_id) redirect("/provider/onboarding/claim");

  const { error } = await searchParams;
  const supabase = await createProviderSupabaseClient();
  const [{ data: facility }, { data: claim }] = await Promise.all([
    supabase
      .from("facilities")
      .select("id, name, area, sub_city, phone, verification_status")
      .eq("id", provider.facility_id)
      .maybeSingle(),
    supabase
      .from("facility_claims")
      .select("id, status, facility_id, submitted_at")
      .eq("provider_id", provider.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const submitted =
    claim?.status === "pending_review" && claim.facility_id === provider.facility_id;
  const rejected = !submitted && (claim?.status === "rejected" || provider.status === "rejected");
  // Someone else was verified for this facility while this claim waited.
  const managedByOther = facility?.verification_status === "facility-owned";

  if (submitted) {
    return (
      <Shell>
        <div>
          <div className="mb-3 inline-flex rounded-full bg-info-bg px-3 py-1 text-sm font-medium text-info-text">
            Waiting for verification
          </div>
          <h1 className="text-2xl font-bold text-foreground">We&apos;ve received your claim</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {claim?.submitted_at ? `Submitted ${formatAddisDate(claim.submitted_at)}. ` : ""}
            There&apos;s nothing more you need to do right now.
          </p>
        </div>

        <FacilityCard facility={facility} />

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">What happens next</h2>
          <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
              <span>
                The Tiru Health team confirms that you work at {facility?.name ?? "this facility"}.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
              <span>
                We may also call you on {provider.claimant_phone || provider.phone || "the number you gave us"}.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
              <span>
                Once confirmed, we email {provider.email} and you can edit your listing yourself —
                changes go live immediately.
              </span>
            </li>
          </ol>
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            Until then the public listing stays exactly as it is.
          </p>
        </div>
        {/* No "choose another facility" here: the claim is already with the
            team. Switching is offered only before submitting, below. */}
      </Shell>
    );
  }

  return (
    <Shell>
      <div>
        <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Claim your facility
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {rejected ? "Your claim wasn't approved" : "Tell us who you are"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {rejected
            ? "You can correct your details and send the claim again."
            : "We already have this facility's details. We just need to know your role there and how to reach you — then we verify and hand the listing over to you."}
        </p>
      </div>

      <FacilityCard facility={facility} />

      {rejected && provider.admin_note && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
          <span className="font-semibold">Reason given: </span>
          {provider.admin_note}
        </div>
      )}

      {error && ERROR_MESSAGES[error] && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {ERROR_MESSAGES[error]}
        </div>
      )}

      {managedByOther ? (
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          {ERROR_MESSAGES.already_managed}
          <a className="mt-2 block font-medium text-primary hover:underline" href="/contact">
            Contact the Tiru Health team →
          </a>
        </div>
      ) : (
        <VerificationForm
          facilityName={facility?.name ?? null}
          isNewListing={false}
          mode="claim"
          provider={{
            display_name: provider.display_name ?? "",
            phone: provider.phone ?? "",
            email: provider.email ?? "",
            claimant_role: provider.claimant_role ?? "",
            claimant_role_other: provider.claimant_role_other ?? "",
            claimant_phone: provider.claimant_phone ?? "",
            facility_official_phone_claimed: "",
            work_email: provider.work_email ?? "",
          }}
        />
      )}

      <ChooseDifferent />
    </Shell>
  );
}
