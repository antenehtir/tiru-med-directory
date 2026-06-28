import { redirect } from "next/navigation";
import { getProviderAccount } from "@/lib/supabase/provider-client";
import { VerificationForm } from "@/components/provider/VerificationForm";

export default async function VerifyPage() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const facility = provider.facilities as {
    name?: string;
    phone?: string;
    category?: string;
  } | null;

  const isNewListing = !provider.facility_id;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Verification
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Verify your authority to manage this listing
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isNewListing
              ? "Tell us about your role. Our team will verify your details before your listing goes live."
              : `You're claiming ${facility?.name ?? "this facility"}. Our team will call the facility's official number to confirm you're authorized.`}
          </p>
        </div>
        <VerificationForm
          facilityName={facility?.name ?? null}
          isNewListing={isNewListing}
          provider={{
            display_name: provider.display_name ?? "",
            phone: provider.phone ?? "",
            email: provider.email ?? "",
            claimant_role: provider.claimant_role ?? "",
            claimant_role_other: provider.claimant_role_other ?? "",
            claimant_phone: provider.claimant_phone ?? "",
            facility_official_phone_claimed: provider.facility_official_phone_claimed ?? "",
            work_email: provider.work_email ?? "",
          }}
        />
      </div>
    </div>
  );
}
