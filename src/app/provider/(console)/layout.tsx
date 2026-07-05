import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { ProviderConsoleShell } from "@/components/provider/ProviderConsoleShell";

export default async function ProviderConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getOrCreateClaim();
  if (!result) redirect("/provider/login");

  const { provider, claim } = result;
  const facilities = provider.facilities as { slug?: string; name?: string; updated_at?: string } | null;

  return (
    <ProviderConsoleShell
      facilityName={provider.facility_name ?? facilities?.name ?? "Your facility"}
      facilitySlug={facilities?.slug ?? null}
      facilityUpdatedAt={facilities?.updated_at ?? null}
      claimStatus={(claim?.status as string | undefined) ?? null}
      submissionStep={(claim?.submission_step as number | null) ?? null}
    >
      {children}
    </ProviderConsoleShell>
  );
}
