import type { createProviderSupabaseClient } from "@/lib/supabase/provider-client";

type Client = Awaited<ReturnType<typeof createProviderSupabaseClient>>;

export type ClaimableFacility = {
  id: string;
  name: string;
  slug: string | null;
  category: string | null;
  phone: string | null;
  area: string | null;
  sub_city: string | null;
};

export type ClaimableResult =
  | { ok: true; facility: ClaimableFacility }
  | { ok: false; reason: "not_found" | "already_managed" };

// Whether a facility can be claimed at all. The picker already greys out
// facilities another account manages, but only in the browser — this is the
// same check on the server, so a claim cannot be filed against a listing that
// already has a verified owner by skipping the UI.
export async function loadClaimableFacility(
  supabase: Client,
  facilityId: string,
): Promise<ClaimableResult> {
  if (!facilityId) return { ok: false, reason: "not_found" };

  const { data } = await supabase
    .from("facilities")
    .select("id, name, slug, category, phone, area, sub_city, verification_status, is_active")
    .eq("id", facilityId)
    .maybeSingle();

  if (!data || data.is_active === false) return { ok: false, reason: "not_found" };
  if (data.verification_status === "facility-owned") return { ok: false, reason: "already_managed" };

  return {
    ok: true,
    facility: {
      id: data.id as string,
      name: data.name as string,
      slug: (data.slug as string | null) ?? null,
      category: (data.category as string | null) ?? null,
      phone: (data.phone as string | null) ?? null,
      area: (data.area as string | null) ?? null,
      sub_city: (data.sub_city as string | null) ?? null,
    },
  };
}

// Points the provider's claim record at a facility, in the given state.
//
// A claim on an existing facility is the same facility_claims row the admin
// queue already reads (status pending_review, facility_id set), just without
// any proposed_* data: the live listing is the source of truth, so there is
// nothing for the claimant to re-enter and nothing for approval to merge.
//
// Reuses the provider's most recent claim rather than adding another — the
// console and the admin queue both read "the latest claim", and a second row
// would leave the first behind as a stale duplicate.
export async function recordClaim(
  supabase: Client,
  providerId: string,
  facilityId: string | null,
  status: "pending" | "pending_review",
  facilityType: string | null,
): Promise<{ error?: string }> {
  const { data: existing } = await supabase
    .from("facility_claims")
    .select("id, status")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const fields = {
    facility_id: facilityId,
    status,
    submitted_at: status === "pending_review" ? new Date().toISOString() : null,
    facility_type: facilityType,
  };

  if (existing && existing.status !== "approved") {
    const { error } = await supabase.from("facility_claims").update(fields).eq("id", existing.id as string);
    return error ? { error: error.message } : {};
  }

  const { error } = await supabase.from("facility_claims").insert({
    ...fields,
    provider_id: providerId,
    submission_step: 1,
    completion_pct: 0,
  });
  return error ? { error: error.message } : {};
}
