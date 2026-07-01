// Shared mapping from facility_claims.proposed_* fields to their facilities table equivalents.
// Used by:
//   - Admin claim approval (approveClaim / mergeProposedDataIntoFacility) to populate the
//     facilities row when a claim is first approved.
//   - Approved-provider step saves: after any autoSaveStepN the caller checks
//     claim.status === 'approved' and, if so, calls syncToFacilityIfApproved to push the
//     updated proposed values directly to the live facilities row with no re-approval gate.

type ClaimRow = Record<string, unknown>;

export function buildFacilityFieldsFromClaim(claim: ClaimRow): Record<string, unknown> {
  return {
    name: claim.proposed_name,
    sub_city: claim.proposed_sub_city,
    area: claim.proposed_area,
    latitude: claim.proposed_latitude,
    longitude: claim.proposed_longitude,
    maps_link: claim.proposed_maps_link,
    phone: claim.proposed_phone,
    phone_2: claim.proposed_phone_2,
    telegram: claim.proposed_telegram,
    email: claim.proposed_email,
    website: claim.proposed_website,
    instagram: claim.proposed_instagram,
    facebook: claim.proposed_facebook,
    services: claim.proposed_services,
    working_hours: claim.proposed_working_hours,
    logo_url: claim.proposed_logo_url,
    // No separate entrance_photo_url column — maps to the main public photo column.
    photo_url: claim.proposed_entrance_photo_url,
    // Requires migration 025 columns (schedule, doctors, emergency_type, walkin_appointment).
    schedule: claim.proposed_schedule,
    doctors: claim.proposed_doctors,
    emergency_type: claim.proposed_emergency_type,
    walkin_appointment: claim.proposed_walkin_appointment,
  };
}

// Strips null / undefined / empty-string values before writing to facilities,
// so a blank proposed field never silently clears a value the admin set at approval time.
export function filterNonEmpty(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  );
}
