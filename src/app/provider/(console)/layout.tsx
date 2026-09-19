import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { listingCompletenessPct } from "@/lib/provider/listing-completeness";
import { createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import {
  ProviderConsoleShell,
  type ProviderConsoleMode,
} from "@/components/provider/ProviderConsoleShell";

export default async function ProviderConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getOrCreateClaim();
  if (!result) redirect("/provider/login");

  const { provider, claim } = result;
  const facilities = provider.facilities as { slug?: string; name?: string; updated_at?: string } | null;

  // provider_accounts decides this, not the claim row: it is the same pair of
  // columns RLS reads to allow a live edit, and only an admin can set them
  // (migration 062).
  const mode: ProviderConsoleMode =
    provider.facility_id && provider.status === "approved"
      ? "live"
      : provider.facility_id
        ? "claim"
        : "wizard";

  // A live listing is scored on the public row itself — the onboarding draft
  // stops changing once it is approved.
  let completionPct: number | null = null;
  if (mode === "wizard") {
    completionPct = (provider.completion_pct as number | null) ?? 0;
  } else if (mode === "live") {
    const supabase = await createProviderSupabaseClient();
    const { data: facility } = await supabase
      .from("facilities")
      .select("*")
      .eq("id", provider.facility_id)
      .maybeSingle();
    if (facility) completionPct = listingCompletenessPct(facility as Record<string, unknown>);
  }

  return (
    <ProviderConsoleShell
      claimStatus={(claim?.status as string | undefined) ?? null}
      completionPct={completionPct}
      facilityName={provider.facility_name ?? facilities?.name ?? "Your facility"}
      facilitySlug={facilities?.slug ?? null}
      facilityType={(claim?.facility_type as string | undefined) ?? null}
      facilityUpdatedAt={facilities?.updated_at ?? null}
      mode={mode}
      submissionStep={(claim?.submission_step as number | null) ?? null}
    >
      {children}
    </ProviderConsoleShell>
  );
}
