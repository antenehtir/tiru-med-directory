import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { ProviderListingEditor } from "@/components/provider/ProviderListingEditor";

export const metadata = { title: "Your listing — Tiru Provider Portal" };

// Where a verified provider edits their facility. Everything here saves
// straight to the public listing — there is no draft and no re-approval.
export default async function ProviderListingPage() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");
  if (provider.status !== "approved" || !provider.facility_id) {
    redirect("/provider/dashboard");
  }

  const supabase = await createProviderSupabaseClient();
  const [{ data: facility }, { data: claim }] = await Promise.all([
    supabase.from("facilities").select("*").eq("id", provider.facility_id).single(),
    supabase
      .from("facility_claims")
      .select("id")
      .eq("provider_id", provider.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!facility) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-lg font-bold text-foreground">We couldn&apos;t load your listing</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please refresh the page. If it keeps happening, contact the Tiru team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Your listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {String(facility.name)} · Changes you save here appear on your public listing straight away.
        </p>
      </div>
      <Suspense fallback={null}>
        <ProviderListingEditor
          facility={facility as Record<string, unknown>}
          uploadFolder={(claim?.id as string | undefined) ?? (facility.id as string)}
        />
      </Suspense>
    </div>
  );
}
