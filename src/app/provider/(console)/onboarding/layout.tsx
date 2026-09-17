import { redirect } from "next/navigation";
import { getProviderAccount } from "@/lib/supabase/provider-client";

// The onboarding wizard is for facilities that are not on Tiru yet.
//
// A provider with a facility_id is either claiming an existing listing
// (which has its own one-step form) or already verified for one (which they
// edit live from /provider/listing). Neither belongs in the wizard: it keeps
// its own copy of every field in the claim draft, and for a live listing that
// copy goes stale the moment anything is edited elsewhere — exactly how a
// provider's later edit once overwrote changes made in the meantime.
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  if (provider.facility_id) {
    redirect(provider.status === "approved" ? "/provider/listing" : "/provider/claim");
  }

  return <>{children}</>;
}
