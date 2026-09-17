"use server";

import { redirect } from "next/navigation";
import { getProviderAccount, createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { loadClaimableFacility, recordClaim } from "@/lib/provider/claim-facility";

// A signed-in provider picks the facility they want to claim. This used to
// send them on to /onboarding/verify and then into the six-step wizard,
// retyping details Tiru already has. It now goes to the one-step claim form.
export async function selectFacilityToClaim(facilityId: string): Promise<{ error: string } | void> {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");
  if (provider.status === "approved" && provider.facility_id) redirect("/provider/listing");

  const supabase = await createProviderSupabaseClient();
  const claimable = await loadClaimableFacility(supabase, facilityId);
  if (!claimable.ok) {
    return {
      error:
        claimable.reason === "already_managed"
          ? "This facility is already managed by a verified account."
          : "That facility could not be found.",
    };
  }

  // The facility is chosen, not owned: nothing grants edit access until an
  // admin approves the claim (status stays as it was, and migration 062
  // keeps it that way).
  const { error } = await supabase
    .from("provider_accounts")
    .update({
      facility_id: claimable.facility.id,
      facility_name: claimable.facility.name,
      facility_type: claimable.facility.category,
      onboarding_phase: 0,
      verification_status_internal: "unverified",
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);
  if (error) return { error: "Could not save your choice. Please try again." };

  await recordClaim(supabase, provider.id, claimable.facility.id, "pending", claimable.facility.category);

  redirect("/provider/claim");
}

// Unchanged: a facility that is not on Tiru yet goes through verification
// and then the onboarding wizard.
export async function startNewListing() {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();

  await supabase
    .from("provider_accounts")
    .update({
      onboarding_phase: 0,
      verification_status_internal: "unverified",
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  redirect("/provider/onboarding/verify");
}
