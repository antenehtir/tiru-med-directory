import { getSupabasePublicDoctorCards } from "@/lib/supabase/doctors-public-read";
import type { Doctor, DoctorTelemedicineStatus } from "@/types/doctor";
import type { PublicProviderCard } from "@/types/public-listings";

// Moved out of src/app/search/page.tsx so /api/search/services can load the
// same doctors list countQueryMatches needs, without a second copy of this
// mapping. Two independent specialist sources feed /search (see the
// doctors-public-read.ts vs. get-specialists.ts split) — both are surfaced
// since the `doctors` table path may still hold real records independent of
// the facility-embedded specialists most providers add through onboarding.
export async function getDoctorsForSearch(): Promise<Doctor[]> {
  const supabaseResult = await getSupabasePublicDoctorCards();

  if (supabaseResult.status !== "success" || supabaseResult.cards.length === 0) {
    return [];
  }

  return supabaseResult.cards.map(mapPublicDoctorCardToDoctor);
}

function mapPublicDoctorCardToDoctor(card: PublicProviderCard): Doctor {
  return {
    id: card.id,
    name: card.name,
    slug: card.slug,
    specialty: card.categoryLabel,
    facility: card.affiliations[0] ?? "Facility not listed",
    location: card.locationLabel,
    availability: card.availabilityPreview ?? "Availability details are being verified.",
    verificationStatus: card.verificationStatus,
    telemedicineStatus: mapTelemedicinePreviewToStatus(card.telemedicinePreview),
    profileInitials: createDoctorInitials(card.name),
    profileActionLabel: card.primaryActionLabel,
    bookingActionLabel: card.secondaryActionLabel,
    detailHref: card.listingHref,
  };
}

function mapTelemedicinePreviewToStatus(
  preview: string | undefined,
): DoctorTelemedicineStatus {
  const normalizedPreview = preview?.toLowerCase() ?? "";

  if (normalizedPreview.includes("available")) {
    return "available";
  }

  if (normalizedPreview.includes("planned")) {
    return "planned";
  }

  return "not-available";
}

function createDoctorInitials(name: string): string {
  const parts = name
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "DR";
}
