import { redirect } from "next/navigation";
import { getProviderAccount, createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { ProviderDashboard } from "@/components/provider/ProviderDashboard";

export default async function ProviderDashboardPage() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();
  const { data: claim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return <ProviderDashboard claim={claim ?? null} provider={provider} />;
}
