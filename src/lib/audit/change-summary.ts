// What an audit_log row should say about a facility edit.
//
// The first version of this diffed whole FIELDS: if `services` changed at
// all, it wrote the entire before list into old_value and the entire after
// list into new_value. Removing one service from Lancet — which carries a
// hundred of them — produced two hundred-item strings side by side, and the
// one word that actually changed was somewhere inside both. The log recorded
// the edit without communicating it.
//
// So list fields diff by ITEM here: what came off, what went on, nothing
// else. Scalars still record before and after, because for a scalar that IS
// the whole change.

// A list field's change, stored under its own key in new_value. The audit
// page feature-detects this shape, so rows written before it existed (plain
// strings) still render as plain text rather than breaking.
export type ListDelta = { added: string[]; removed: string[] };

export function isListDelta(value: unknown): value is ListDelta {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.added) && Array.isArray(candidate.removed);
}

// Column names are what the database calls things; these are what a person
// reading the log calls them. Anything not listed falls back to the column
// name with its underscores opened up, which is already close enough for the
// long tail (`booking_link` -> `booking link`).
const FIELD_LABELS: Record<string, string> = {
  services: "services",
  custom_service_categories: "custom service tags",
  special_services: "special services",
  payment_methods: "payment methods",
  insurance_note: "insurance note",
  walkin_appointment: "walk-in / appointment policy",
  appointment_modalities: "appointment methods",
  emergency_type: "emergency type",
  diagnostic_subtype: "diagnostic subtype",
  closed_on_public_holidays: "public holiday closure",
  working_hours: "working hours",
  photo_urls: "photos",
  photo_url: "main photo",
  logo_url: "logo",
  patient_groups: "patient groups",
  sub_city: "sub-city",
  maps_link: "map link",
  phone_2: "second phone",
  checkup_offered: "check-ups offered",
  checkup_packages: "check-up packages",
  checkup_note: "check-up note",
  checkup_pdf_url: "check-up PDF",
  booking_link: "booking link",
  branch_count: "branch count",
  ownership_type: "ownership type",
  building_desc: "building description",
  access_notes: "access notes",
  alt_name: "alternative name",
};

export function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

// Object arrays (schedule rows, doctors, branches) reduce to their names
// where they have one — dumping the objects themselves is what once crashed
// this page with "Objects are not valid as a React child".
function namedItems(value: unknown[]): string[] | null {
  const named = value.map((v) => {
    if (!v || typeof v !== "object") return null;
    const item = v as Record<string, unknown>;
    const name = item.name ?? item.full_name ?? item.label;
    return typeof name === "string" && name.trim() ? name : null;
  });
  return named.every((n): n is string => n !== null) ? named : null;
}

export function toAuditText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    if (isStringArray(value)) return value.join(", ");
    const named = namedItems(value);
    if (named) return named.join(", ");
    return `${value.length} item(s)`;
  }
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export type FacilityChangeSummary = {
  changed: string[];
  old_value: Record<string, unknown>;
  new_value: Record<string, unknown>;
  // Field names only, for the note — the delta itself lives in new_value so
  // the note stays one readable line however many items moved.
  changedLabels: string;
};

// Compares only the keys present in `after`, so a caller that writes six
// columns never reports on the other forty it left alone.
export function summarizeFacilityChanges(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
): FacilityChangeSummary {
  const old_value: Record<string, unknown> = {};
  const new_value: Record<string, unknown> = {};
  const changed: string[] = [];

  for (const [key, next] of Object.entries(after)) {
    const prev = before?.[key];

    const prevList = isStringArray(prev) ? prev : prev == null && isStringArray(next) ? [] : null;
    const nextList = isStringArray(next) ? next : next == null && isStringArray(prev) ? [] : null;

    if (prevList && nextList) {
      const prevSet = new Set(prevList);
      const nextSet = new Set(nextList);
      const removed = prevList.filter((v) => !nextSet.has(v));
      const added = nextList.filter((v) => !prevSet.has(v));
      if (removed.length === 0 && added.length === 0) continue;
      new_value[key] = { added, removed } satisfies ListDelta;
      changed.push(key);
      continue;
    }

    const prevText = toAuditText(prev);
    const nextText = toAuditText(next);
    if (prevText === nextText) continue;
    old_value[key] = prevText;
    new_value[key] = nextText;
    changed.push(key);
  }

  return {
    changed,
    old_value,
    new_value,
    changedLabels: changed.map(fieldLabel).join(", "),
  };
}
