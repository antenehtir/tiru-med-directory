// What an audit_log row should say about a facility edit.
//
// Two rules this file exists to keep apart, because collapsing them caused a
// data-loss bug:
//
//   1. DETECTION is structural and lossless. Whether something changed is
//      decided by deep-comparing the raw values, never by comparing their
//      display text.
//   2. DISPLAY is lossy on purpose. A hundred-item services list reduces to
//      "what came off, what went on"; a doctor reduces to their name and the
//      fields that moved.
//
// The first version used the display reduction AS the equality test. A
// doctor rendered as their name, so adding French to Dr Kale-Ab's languages
// produced identical text on both sides, read as "nothing changed" — and
// because the caller skips writing when nothing changed, the edit never
// reached the public page at all. A lossy comparison cannot be allowed
// anywhere near the decision to write.

// A list field's change. The audit page feature-detects these shapes, so
// rows written before they existed (plain strings) still render as text.
export type ListDelta = { added: string[]; removed: string[] };

// A list-of-objects field's change (doctors, branches). Items that stayed
// but changed internally are the whole reason this type exists.
export type ItemDelta = {
  added: string[];
  removed: string[];
  modified: { label: string; fields: string[] }[];
};

export function isListDelta(value: unknown): value is ListDelta {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.added) && Array.isArray(v.removed) && !Array.isArray(v.modified);
}

export function isItemDelta(value: unknown): value is ItemDelta {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.added) && Array.isArray(v.removed) && Array.isArray(v.modified);
}

// Column names are what the database calls things; these are what a person
// reading the log calls them. Anything unlisted falls back to the column
// name with its underscores opened up, which is close enough for the long
// tail (`booking_link` -> `booking link`).
const FIELD_LABELS: Record<string, string> = {
  services: "services",
  custom_service_categories: "custom service tags",
  special_services: "special services",
  payment_methods: "payment methods",
  insurance_note: "insurance note",
  insurance_accepted: "insurance accepted",
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
  available_schedule: "schedule",
  appointment_required: "appointment required",
  appointment_policy: "visit type",
  bed_count: "number of beds",
  role_other: "role (other)",
  full_name: "name",
};

export function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

// null, undefined and "" all mean "nothing here" across these columns, and
// the claim/facility pair disagrees about which one it uses often enough
// that treating them as distinct would report edits nobody made.
function isBlank(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

// Key-order independent: a row read back from Postgres and an object built
// in JS carry the same data in different key orders, and JSON.stringify
// would call that a change on every single save.
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (isBlank(a) && isBlank(b)) return true;
  if (isBlank(a) || isBlank(b)) return false;

  const aIsArray = Array.isArray(a);
  if (aIsArray !== Array.isArray(b)) return false;
  if (aIsArray) {
    const arrA = a as unknown[];
    const arrB = b as unknown[];
    return arrA.length === arrB.length && arrA.every((v, i) => deepEqual(v, arrB[i]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    // Blank-valued keys are ignored on both sides for the same reason as
    // isBlank above: {bio: ""} and {} describe the same doctor.
    const keys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
    for (const key of keys) {
      if (!deepEqual(objA[key], objB[key])) return false;
    }
    return true;
  }

  return false;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isObjectArray(value: unknown): value is Record<string, unknown>[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((v) => v !== null && typeof v === "object" && !Array.isArray(v))
  );
}

// A plain Record<string, string[]>, which is what custom_service_categories
// is. Flattened to "bucket: value" lines so it can diff like any other list
// instead of rendering as a JSON blob.
function isStringListRecord(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every(isStringArray);
}

function flattenListRecord(value: Record<string, string[]>): string[] {
  return Object.entries(value).flatMap(([key, items]) => items.map((item) => `${key}: ${item}`));
}

// What to call one item of an object array in the log.
function itemLabel(item: Record<string, unknown>, index: number): string {
  for (const key of ["full_name", "name", "label", "type", "value"]) {
    const candidate = item[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return `item ${index + 1}`;
}

// Stable identity for matching an item across before and after, so an edit
// to a doctor reads as "modified" rather than "one removed, one added".
function itemKey(item: Record<string, unknown>, index: number): string {
  const id = item.id;
  if (typeof id === "string" && id) return `id:${id}`;
  for (const key of ["full_name", "name", "label"]) {
    const candidate = item[key];
    if (typeof candidate === "string" && candidate.trim()) return `${key}:${candidate}`;
  }
  return `index:${index}`;
}

function diffObjectArrays(
  before: Record<string, unknown>[],
  after: Record<string, unknown>[],
): ItemDelta {
  const beforeByKey = new Map(before.map((item, i) => [itemKey(item, i), { item, i }]));
  const afterByKey = new Map(after.map((item, i) => [itemKey(item, i), { item, i }]));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: { label: string; fields: string[] }[] = [];

  for (const [key, { item, i }] of afterByKey) {
    const prior = beforeByKey.get(key);
    if (!prior) {
      added.push(itemLabel(item, i));
      continue;
    }
    const fields = Object.keys({ ...prior.item, ...item })
      .filter((field) => !deepEqual(prior.item[field], item[field]))
      .map(fieldLabel);
    if (fields.length > 0) modified.push({ label: itemLabel(item, i), fields });
  }

  for (const [key, { item, i }] of beforeByKey) {
    if (!afterByKey.has(key)) removed.push(itemLabel(item, i));
  }

  return { added, removed, modified };
}

export function toAuditText(value: unknown): string {
  if (isBlank(value)) return "";
  if (Array.isArray(value)) {
    if (isStringArray(value)) return value.join(", ");
    if (isObjectArray(value)) {
      return value.map((item, i) => itemLabel(item, i)).join(", ");
    }
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
  // Field names only. The delta itself lives in new_value, so the note stays
  // one readable line however many items moved.
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

    // Authoritative. Everything below only decides how to DESCRIBE a change
    // this line has already established.
    if (deepEqual(prev, next)) continue;
    changed.push(key);

    const prevList = isStringArray(prev) ? prev : isBlank(prev) ? [] : null;
    const nextList = isStringArray(next) ? next : isBlank(next) ? [] : null;
    if (prevList && nextList && (isStringArray(prev) || isStringArray(next))) {
      const prevSet = new Set(prevList);
      const nextSet = new Set(nextList);
      new_value[key] = {
        added: nextList.filter((v) => !prevSet.has(v)),
        removed: prevList.filter((v) => !nextSet.has(v)),
      } satisfies ListDelta;
      continue;
    }

    if (isStringListRecord(prev) || isStringListRecord(next)) {
      const prevFlat = isStringListRecord(prev) ? flattenListRecord(prev) : [];
      const nextFlat = isStringListRecord(next) ? flattenListRecord(next) : [];
      const prevSet = new Set(prevFlat);
      const nextSet = new Set(nextFlat);
      new_value[key] = {
        added: nextFlat.filter((v) => !prevSet.has(v)),
        removed: prevFlat.filter((v) => !nextSet.has(v)),
      } satisfies ListDelta;
      continue;
    }

    if (isObjectArray(prev) || isObjectArray(next)) {
      new_value[key] = diffObjectArrays(
        isObjectArray(prev) ? prev : [],
        isObjectArray(next) ? next : [],
      ) satisfies ItemDelta;
      continue;
    }

    old_value[key] = toAuditText(prev);
    new_value[key] = toAuditText(next);
  }

  return {
    changed,
    old_value,
    new_value,
    changedLabels: changed.map(fieldLabel).join(", "),
  };
}
