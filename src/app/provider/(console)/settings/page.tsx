import { redirect } from "next/navigation";
import { getProviderAccount } from "@/lib/supabase/provider-client";
import { SettingsForm } from "@/components/provider/SettingsForm";

export default async function ProviderSettingsPage() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-foreground">Account settings</h1>
      <SettingsForm
        provider={{
          display_name: (provider.display_name as string | null) ?? null,
          claimant_role: (provider.claimant_role as string | null) ?? null,
          phone: (provider.phone as string | null) ?? null,
          facility_phone: (provider.facility_phone as string | null) ?? null,
          email: (provider.email as string | null) ?? null,
        }}
      />
    </div>
  );
}
