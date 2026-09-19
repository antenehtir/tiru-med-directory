import { redirect } from "next/navigation";
import { getProviderAccount, createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { ProviderDashboard, type LiveFacilitySummary } from "@/components/provider/ProviderDashboard";

export default async function ProviderDashboardPage() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  // A claim on an existing facility is followed on its own page until it is
  // verified; this dashboard's progress rings describe the new-listing wizard.
  if (provider.facility_id && provider.status !== "approved") {
    redirect("/provider/claim");
  }

  const supabase = await createProviderSupabaseClient();

  let liveFacility: LiveFacilitySummary | null = null;
  if (provider.facility_id && provider.status === "approved") {
    const { data } = await supabase
      .from("facilities")
      .select("*")
      .eq("id", provider.facility_id)
      .maybeSingle();
    liveFacility = (data as LiveFacilitySummary | null) ?? null;
  }

  const { data: claim } = await supabase
    .from("facility_claims")
    .select("*")
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return <ProviderDashboard claim={claim ?? null} liveFacility={liveFacility} provider={provider} />;
}
