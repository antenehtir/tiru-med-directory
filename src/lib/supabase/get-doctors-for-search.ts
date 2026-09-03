import { getSupabasePublicDoctorCards } from "@/lib/supabase/doctors-public-read";
import type { Doctor, DoctorTelemedicineStatus } from "@/types/doctor";
import type { PublicProviderCard } from "@/types/public-listings";

// Moved out of src/app/search/page.tsx so /api/search/services can load the
// same doctors list countQueryMatches needs, without a second copy of this
// mapping. Two independent specialist sources feed /search (see the
// doctors-public-read.ts vs. get-specialists.ts split) — both are surfaced
// since the `doctors` table path may still hold real records independent of
// the facility-embedded specialists most providers add through onboarding.
//
// Same in-memory-cache-with-TTL pattern as getFacilitiesFromDB() and
// getAllSpecialists(). Missing this was a real bug, not a stylistic gap:
// /api/search/services started calling this on every autocomplete keystroke
// once it needed doctors for its result count, and an uncached Supabase
// round trip measured ~165-225ms warm — the entire perceived delay on the
// service-suggestion row, dwarfing the ~4ms the route's own ranking and
// counting logic costs. The table is empty today, so this was 165ms spent
// fetching zero rows, every keystroke.
let cachedDoctors: Doctor[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000;

export async function getDoctorsForSearch(): Promise<Doctor[]> {
  if (cachedDoctors && Date.now() - cacheTime < CACHE_TTL) {
    return cachedDoctors;
  }

  const supabaseResult = await getSupabasePublicDoctorCards();

  if (supabaseResult.status !== "success") {
    // A real fetch failure — serve the last good list rather than an
    // empty one, same fallback getAllSpecialists() uses.
    return cachedDoctors ?? [];
  }

  const fresh = supabaseResult.cards.map(mapPublicDoctorCardToDoctor);
  cachedDoctors = fresh;
  cacheTime = Date.now();
  return fresh;
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
