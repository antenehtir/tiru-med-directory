export const ONBOARDING_STEPS = [
  { num: 1, slug: "identity", label: "Basic Identity", weight: 10 },
  { num: 2, slug: "location", label: "Location & Contact", weight: 25 },
  { num: 3, slug: "services", label: "Services & Schedule", weight: 25 },
  { num: 4, slug: "doctors", label: "Doctors & Staff", weight: 10 },
  { num: 5, slug: "media", label: "Photos & Documents", weight: 20 },
  { num: 6, slug: "review", label: "Review & Submit", weight: 10 },
] as const;

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

// Provider category options
export const PROVIDER_CATEGORIES = [
  "General Hospital",
  "Specialty Center",
  "Clinic",
  "Diagnostic Center",
  "Pharmacy",
  "Ambulance Service",
  "Home Care Provider",
  "Telemedicine Provider",
  "Medical Plaza",
  "Other",
] as const;

export const OWNERSHIP_TYPES = [
  "Private",
  "NGO / Charity",
  "Faith-based",
  "Corporate / Group practice",
  "Other",
] as const;

export const LANGUAGES = [
  "Amharic",
  "English",
  "Afaan Oromo",
  "Tigrinya",
  "Somali",
  "Arabic",
] as const;

export const PATIENT_GROUPS = [
  "Adults",
  "Children",
  "Women's health",
  "Elderly",
  "Family care",
  "Emergency patients",
  "Chronic disease patients",
] as const;

export const ADDIS_SUB_CITIES = [
  "Addis Ketema",
  "Akaki Kaliti",
  "Arada",
  "Bole",
  "Gulele",
  "Kirkos",
  "Kolfe Keranio",
  "Lideta",
  "Nifas Silk-Lafto",
  "Yeka",
  "Lemi Kura",
  "Multiple",
] as const;

// Completion scoring — given a facility_claims row, returns 0-100
export function calculateCompletion(claim: Record<string, unknown>): number {
  let pct = 0;

  // Step 1 (10%): name + category + (claim already has authorized confirmation)
  if (claim.proposed_name && claim.proposed_sub_city !== undefined) {
    if (claim.proposed_name) pct += 10;
  }

  // Step 2 (25%): sub_city + area + landmark + phone + (map pin OR maps link)
  const hasLocation =
    claim.proposed_sub_city &&
    claim.proposed_area &&
    claim.proposed_landmark;
  const hasContact = claim.proposed_phone;
  const hasMap =
    (claim.proposed_latitude && claim.proposed_longitude) ||
    claim.proposed_maps_link;
  if (hasLocation && hasContact && hasMap) pct += 25;

  // Step 3 (25%): working hours + main services + walk-in/appointment
  const hasSchedule = claim.proposed_working_hours || claim.proposed_working_days;
  const hasServices =
    Array.isArray(claim.proposed_services) &&
    (claim.proposed_services as unknown[]).length > 0;
  const hasBooking = claim.proposed_walkin_appointment;
  if (hasSchedule && hasServices && hasBooking) pct += 25;

  // Step 4 (10%): doctors — optional, any entry counts
  if (
    Array.isArray(claim.proposed_doctors) &&
    (claim.proposed_doctors as unknown[]).length > 0
  ) {
    pct += 10;
  }

  // Step 5 (20%): at least one photo
  if (claim.proposed_entrance_photo_url || claim.proposed_photo_url) pct += 20;

  // Step 6 (10%): submission (status moves to pending_review)
  if (claim.status === "pending_review" || claim.status === "approved") pct += 10;

  return Math.min(pct, 100);
}
