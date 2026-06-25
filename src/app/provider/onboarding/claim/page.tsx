import { redirect } from "next/navigation";
import { getProviderAccount } from "@/lib/supabase/provider-client";
import { ClaimFacilityForm } from "@/components/provider/ClaimFacilityForm";

export default async function ClaimFacilityPage() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");
  if (provider.facility_id) redirect("/provider/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Step 1 of 4
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Is your facility already on Tiru?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We have 105 facilities listed. Search to see if yours is already
            here — if so, you can claim it and take ownership of the listing.
          </p>
        </div>
        <ClaimFacilityForm providerId={provider.id} />
      </div>
    </div>
  );
}
