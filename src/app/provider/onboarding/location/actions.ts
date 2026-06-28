"use server";

import { redirect } from "next/navigation";
import { createProviderSupabaseClient, getProviderAccount } from "@/lib/supabase/provider-client";
import { findPendingClaimId } from "@/lib/provider/get-claim";

export async function saveStep2(formData: FormData) {
  const provider = await getProviderAccount();
  if (!provider) redirect("/provider/login");

  const supabase = await createProviderSupabaseClient();

  const claimId = await findPendingClaimId(supabase, provider.id);
  if (!claimId) redirect("/provider/onboarding/location");

  const subCity = formData.get("sub_city") as string;
  const area = formData.get("area") as string;
  const landmark = formData.get("landmark") as string;
  const buildingDesc = formData.get("building_desc") as string;
  const accessNotes = formData.get("access_notes") as string;
  const lat = formData.get("lat") as string;
  const lng = formData.get("lng") as string;
  const mapsLink = formData.get("maps_link") as string;
  const phone = formData.get("phone") as string;
  const phone2 = formData.get("phone_2") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const telegram = formData.get("telegram") as string;
  const email = formData.get("email") as string;
  const website = formData.get("website") as string;
  const bookingLink = formData.get("booking_link") as string;

  await supabase
    .from("facility_claims")
    .update({
      proposed_sub_city: subCity || null,
      proposed_area: area || null,
      proposed_landmark: landmark || null,
      proposed_building_desc: buildingDesc || null,
      proposed_access_notes: accessNotes || null,
      proposed_latitude: lat ? parseFloat(lat) : null,
      proposed_longitude: lng ? parseFloat(lng) : null,
      proposed_maps_link: mapsLink || null,
      proposed_phone: phone || null,
      proposed_phone_2: phone2 || null,
      proposed_whatsapp: whatsapp || null,
      proposed_telegram: telegram || null,
      proposed_email: email || null,
      proposed_website: website || null,
      proposed_booking_link: bookingLink || null,
      submission_step: 3,
    })
    .eq("id", claimId);

  // phase 3 = services (the step they land on next), matching login's phaseToSlug map
  await supabase
    .from("provider_accounts")
    .update({
      onboarding_phase: 3,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", provider.id);

  redirect("/provider/onboarding/services");
}

export async function autoSaveStep2(data: {
  sub_city?: string;
  area?: string;
  landmark?: string;
  building_desc?: string;
  access_notes?: string;
  lat?: number | null;
  lng?: number | null;
  maps_link?: string;
  phone?: string;
  phone_2?: string;
  whatsapp?: string;
  telegram?: string;
  email?: string;
  website?: string;
  booking_link?: string;
  branches?: Array<{
    name: string;
    area: string;
    landmark: string;
    latitude: number | null;
    longitude: number | null;
    maps_link: string;
  }>;
}) {
  const provider = await getProviderAccount();
  if (!provider) return;

  const supabase = await createProviderSupabaseClient();

  const claimId = await findPendingClaimId(supabase, provider.id);
  if (!claimId) return;

  const updates: Record<string, unknown> = {};
  if (data.sub_city !== undefined) updates.proposed_sub_city = data.sub_city || null;
  if (data.area !== undefined) updates.proposed_area = data.area || null;
  if (data.landmark !== undefined) updates.proposed_landmark = data.landmark || null;
  if (data.building_desc !== undefined) updates.proposed_building_desc = data.building_desc || null;
  if (data.access_notes !== undefined) updates.proposed_access_notes = data.access_notes || null;
  if (data.lat !== undefined) updates.proposed_latitude = data.lat;
  if (data.lng !== undefined) updates.proposed_longitude = data.lng;
  if (data.maps_link !== undefined) updates.proposed_maps_link = data.maps_link || null;
  if (data.phone !== undefined) updates.proposed_phone = data.phone || null;
  if (data.phone_2 !== undefined) updates.proposed_phone_2 = data.phone_2 || null;
  if (data.whatsapp !== undefined) updates.proposed_whatsapp = data.whatsapp || null;
  if (data.telegram !== undefined) updates.proposed_telegram = data.telegram || null;
  if (data.email !== undefined) updates.proposed_email = data.email || null;
  if (data.website !== undefined) updates.proposed_website = data.website || null;
  if (data.booking_link !== undefined) updates.proposed_booking_link = data.booking_link || null;
  if (data.branches !== undefined) updates.proposed_branches = data.branches;

  if (Object.keys(updates).length === 0) return;

  await supabase
    .from("facility_claims")
    .update(updates)
    .eq("id", claimId);
}
