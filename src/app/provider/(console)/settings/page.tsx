import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { SettingsForm } from "@/components/provider/SettingsForm";
import type { AccountChangeRequest } from "@/components/provider/LockedAccountDetails";
import { isAccountLocked } from "@/lib/provider/account-lock";

export default async function ProviderSettingsPage() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();
  const locked = await isAccountLocked(supabase, provider as { id: string; status?: string | null });
  // Empty until migration 066 creates the table — the page still works.
  const { data: requests } = await supabase
    .from("account_change_requests")
    .select("id, field, requested_value, status, created_at, admin_note")
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-foreground">Account settings</h1>
      <SettingsForm
        locked={locked}
        requests={(requests as AccountChangeRequest[] | null) ?? []}
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
