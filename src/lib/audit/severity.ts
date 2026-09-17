// How much does this audit entry matter?
//
// A general-purpose audit log treats every row as equal. This one should
// not: the directory exists so a patient can find care and get to it, so
// the question worth flagging is "could this send someone to the wrong
// place, or stop them reaching care at all?"
//
// A wrong phone number on a hospital and a swapped logo are both "an edit".
// One of them means a person cannot call for an ambulance.

export type AuditSeverity =
  | "attention" // a write failed, or a listing came down — patients lose access
  | "patient" // what a patient physically acts on: call this, travel here, arrive then
  | "care" // what care is offered: services, specialists, payment
  | "account" // who can administer the directory
  | "routine"; // presentation — photos, descriptions, social links

export const SEVERITY_ORDER: AuditSeverity[] = [
  "attention",
  "patient",
  "care",
  "account",
  "routine",
];

export const SEVERITY_LABELS: Record<AuditSeverity, string> = {
  attention: "Needs attention",
  patient: "Patient-facing",
  care: "Care details",
  account: "Account & access",
  routine: "Routine",
};

// Only tokens that already exist in globals.css — no new colours invented.
export const SEVERITY_DOT_CLASS: Record<AuditSeverity, string> = {
  attention: "bg-[var(--error)]",
  patient: "bg-[var(--warning)]",
  care: "bg-[var(--info)]",
  account: "bg-foreground",
  routine: "bg-muted-foreground",
};

export const SEVERITY_ROW_CLASS: Record<AuditSeverity, string> = {
  // Only the top tier tints its whole row. If every severity painted the
  // background the table becomes a rainbow and nothing stands out, which is
  // the opposite of flagging.
  attention: "bg-red-50 dark:bg-red-950/20",
  patient: "",
  care: "",
  account: "",
  routine: "",
};

export const SEVERITY_BORDER_CLASS: Record<AuditSeverity, string> = {
  attention: "border-l-[var(--error)]",
  patient: "border-l-[var(--warning)]",
  care: "border-l-[var(--info)]",
  account: "border-l-foreground",
  routine: "border-l-muted-foreground",
};

// Fields a patient acts on in the physical world. Getting one of these
// wrong sends someone to a door that is locked, or to a number nobody
// answers.
const PATIENT_FIELDS = new Set([
  "name",
  "phone",
  "phone_2",
  "phones",
  "whatsapp",
  "latitude",
  "longitude",
  "maps_link",
  "sub_city",
  "area",
  "landmark",
  "working_hours",
  "schedule",
  "closed_on_public_holidays",
  "emergency_type",
  "walkin_appointment",
  "is_active",
]);

// What care is on offer, and how it is paid for. Wrong here wastes a trip
// rather than misdirecting one.
const CARE_FIELDS = new Set([
  "services",
  "special_services",
  "custom_service_categories",
  "doctors",
  "checkup_offered",
  "checkup_packages",
  "checkup_note",
  "checkup_pdf_url",
  "appointment_modalities",
  "booking_link",
  "insurance_accepted",
  "insurance_note",
  "payment_methods",
  "languages",
  "patient_groups",
  "branches",
  "branch_count",
]);

const ACTION_SEVERITY: Record<string, AuditSeverity> = {
  provider_live_sync_failed: "attention",
  provider_live_sync_blocked: "attention",
  facility_deactivated: "attention",
  facility_reactivated: "patient",
  facility_created: "patient",
  claim_approved_new_listing: "patient",
  facility_location_edited: "patient",
  facility_contact_edited: "patient",
  facility_identity_edited: "patient",
  facility_services_edited: "care",
  facility_checkups_edited: "care",
  facility_doctors_edited: "care",
  provider_location_edited: "patient",
  provider_contact_edited: "patient",
  provider_services_edited: "care",
  provider_checkups_edited: "care",
  provider_doctors_edited: "care",
  claim_approved_merged: "care",
  correction_reviewed: "care",
  approve_claim: "account",
  reject_claim: "account",
  approve_listing: "account",
  reject_listing: "account",
  update_badge: "account",
  update_admin_role: "account",
  remove_admin_user: "account",
  change_password: "account",
  provider_edit_synced: "routine",
};

function rank(severity: AuditSeverity): number {
  return SEVERITY_ORDER.indexOf(severity);
}

// The action gives a floor; the fields actually touched can raise it. An
// edit logged as "Contact edited" is routine when it swapped an Instagram
// handle and patient-facing when it changed the phone number — the action
// name alone cannot tell those apart, and a log that grades them the same
// teaches people to ignore the grading.
export function auditSeverity(action: string, changedFields: string[]): AuditSeverity {
  let worst: AuditSeverity = ACTION_SEVERITY[action] ?? "routine";

  for (const field of changedFields) {
    const fieldSeverity: AuditSeverity = PATIENT_FIELDS.has(field)
      ? "patient"
      : CARE_FIELDS.has(field)
        ? "care"
        : "routine";
    if (rank(fieldSeverity) < rank(worst)) worst = fieldSeverity;
  }

  return worst;
}
