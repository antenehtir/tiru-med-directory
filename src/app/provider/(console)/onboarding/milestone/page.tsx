import { redirect } from "next/navigation";
import { getOrCreateClaim } from "@/lib/provider/get-claim";
import { calculateCompletion } from "@/lib/provider/onboarding-config";
import { createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { MilestoneCard } from "@/components/provider/MilestoneCard";

export default async function MilestoneStepPage() {
  const result = await getOrCreateClaim();
  if (!result) redirect("/provider/login");

  const { claim } = result;
  if (!claim) redirect("/provider/onboarding/services");

  const pct = calculateCompletion(claim);

  let facilitySlug: string | null = null;
  if (claim.facility_id) {
    const supabase = await createProviderSupabaseClient();
    const { data: facility } = await supabase
      .from("facilities")
      .select("slug")
      .eq("id", claim.facility_id as string)
      .maybeSingle();
    facilitySlug = facility?.slug ?? null;
  }

  const stepChecklist = [
    { label: "Step 1: Basic Identity", complete: Boolean(claim.proposed_name) },
    {
      label: "Step 2: Location & Contact",
      complete: Boolean(
        claim.proposed_sub_city &&
          claim.proposed_area &&
          claim.proposed_landmark &&
          claim.proposed_phone &&
          ((claim.proposed_latitude && claim.proposed_longitude) || claim.proposed_maps_link),
      ),
    },
    {
      label: "Step 3: Services & Schedule",
      complete: Boolean(
        (claim.proposed_working_hours || claim.proposed_working_days) &&
          Array.isArray(claim.proposed_services) &&
          (claim.proposed_services as unknown[]).length > 0 &&
          claim.proposed_walkin_appointment,
      ),
    },
  ];

  return (
    <MilestoneCard
      facilitySlug={facilitySlug}
      pct={pct}
      status={(claim.status as string) ?? "pending"}
      stepChecklist={stepChecklist}
    />
  );
}
