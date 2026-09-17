import type { Step5Data } from "@/app/provider/(console)/onboarding/media/actions";

// Small reads both editors (admin and verified provider) make of the same
// facility row, kept in one place so the two cannot drift.

// Pharmacies list no doctors — the same rule the onboarding flow applies
// when it skips the Doctors step for them.
export function showsDoctorsSection(facility: Record<string, unknown>): boolean {
  return facility.category !== "Pharmacy";
}

// photo_urls is the gallery; photo_url is the single main image older rows
// carry on its own. A row with only the latter still shows that photo.
export function mediaFromFacility(facility: Record<string, unknown>): Step5Data {
  const gallery = Array.isArray(facility.photo_urls)
    ? (facility.photo_urls as unknown[]).filter((u): u is string => typeof u === "string" && u !== "")
    : [];
  const main = typeof facility.photo_url === "string" && facility.photo_url ? facility.photo_url : null;
  return {
    entrance_photo_urls: gallery.length > 0 ? gallery : main ? [main] : [],
    logo_url: typeof facility.logo_url === "string" ? facility.logo_url : "",
  };
}
