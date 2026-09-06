"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, getAdminUser } from "@/lib/supabase/admin-client";

// Admin direct-edit save path for an existing, live facility row. Unlike the
// provider-onboarding autosave actions (autoSaveStep2/autoSaveStep3), this
// writes straight to `facilities` — there is no facility_claims row to vet,
// because this is an admin editing a listing that already exists, not an
// external submission being reviewed. Every write is logged to audit_log
// using the same {admin_id, action, entity_type, entity_id, old_value,
// new_value, note} shape already used by updateFacilityBadge/deactivateFacility
// in ../actions.ts, and never touches verification_status.

async function loadFacilitySnapshot(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  facilityId: string,
  columns: string,
) {
  const { data } = await supabase.from("facilities").select(columns).eq("id", facilityId).single();
  return data as Record<string, unknown> | null;
}

// audit_log's old_value/new_value are rendered by the admin audit-log page
// as Object.values(v)[0] — so every value stored here must be a scalar, the
// way updateFacilityBadge's {verification_status: "..."} is. Arrays and
// nested objects (a schedule row, a services list) crash that page, so
// everything is flattened to a display string first.
function toAuditText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "string")) return (value as string[]).join(", ");
    // Branches are objects. Reduce them to their names rather than dumping the
    // objects: a non-scalar in old_value/new_value is what crashed the whole
    // audit-log page with "Objects are not valid as a React child".
    const named = value
      .map((v) =>
        v && typeof v === "object" && "name" in (v as Record<string, unknown>)
          ? String((v as Record<string, unknown>).name || "(unnamed)")
          : null,
      )
      .filter((v): v is string => v !== null);
    if (named.length === value.length) return named.join(", ");
    return `${value.length} item(s)`;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Only the fields that actually changed, so the log reads as a diff rather
// than a dump of every column the section happens to touch.
function diffForAudit(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
): { old_value: Record<string, string>; new_value: Record<string, string>; changed: string[] } {
  const old_value: Record<string, string> = {};
  const new_value: Record<string, string> = {};
  const changed: string[] = [];
  for (const [key, next] of Object.entries(after)) {
    const prevText = toAuditText(before?.[key]);
    const nextText = toAuditText(next);
    if (prevText === nextText) continue;
    old_value[key] = prevText;
    new_value[key] = nextText;
    changed.push(key);
  }
  return { old_value, new_value, changed };
}

async function logFacilityEdit(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  adminId: string,
  facilityId: string,
  action: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
  facilityName: string | undefined,
) {
  const { old_value, new_value, changed } = diffForAudit(before, after);
  if (changed.length === 0) return;

  const { error } = await supabase.from("audit_log").insert({
    admin_id: adminId,
    action,
    entity_type: "facility",
    entity_id: facilityId,
    old_value,
    new_value,
    note: `Admin edited ${changed.join(", ")} on "${facilityName ?? facilityId}"`,
  });
  // Surfaced rather than swallowed: a silent failure here means an admin edit
  // landed on the live listing with no trace of who made it.
  if (error) throw new Error(`Facility updated, but the audit log write failed: ${error.message}`);
}

const SERVICES_COLUMNS =
  "name, services, custom_service_categories, schedule, working_hours, payment_methods, insurance_note, walkin_appointment, appointment_modalities, emergency_type";

// Every key is optional: the editor sends only what the admin actually
// changed, so an untouched column is never overwritten with a UI default.
type FacilityServicesFields = {
  services?: string[];
  custom_service_categories?: Record<string, string[]>;
  schedule?: unknown;
  working_hours?: string;
  payment_methods?: string[];
  insurance_note?: string | null;
  walkin_appointment?: string | null;
  appointment_modalities?: unknown;
  emergency_type?: string | null;
};

export async function updateFacilityServices(
  facilityId: string,
  fields: FacilityServicesFields,
) {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Unauthorized");

  if (Object.keys(fields).length === 0) return;

  if (fields.services && fields.services.length === 0) {
    throw new Error("At least one service is required.");
  }

  const supabase = await createAdminSupabaseClient();
  const before = await loadFacilitySnapshot(supabase, facilityId, SERVICES_COLUMNS);

  const { error } = await supabase.from("facilities").update(fields).eq("id", facilityId);
  if (error) throw new Error(error.message);

  await logFacilityEdit(
    supabase,
    adminUser.id,
    facilityId,
    "facility_services_edited",
    before,
    fields,
    before?.name as string | undefined,
  );

  revalidatePath("/admin/facilities");
  revalidatePath(`/admin/facilities/${facilityId}/edit`);
  revalidatePath("/facilities/[slug]", "page");
}

const LOCATION_COLUMNS =
  "name, latitude, longitude, maps_link, sub_city, area, branches, branch_count";

// Same partial contract as the other two sections.
type FacilityLocationFields = Partial<{
  latitude: number | null;
  longitude: number | null;
  maps_link: string | null;
  sub_city: string | null;
  area: string | null;
  branches: unknown;
  branch_count: number;
}>;

// Matches the bounds /api/provider/resolve-maps-link already enforces, so a
// coordinate cannot be saved here that the picker itself would have rejected.
function isWithinAddis(lat: number, lng: number): boolean {
  return lat >= 8.7 && lat <= 9.3 && lng >= 38.5 && lng <= 39.0;
}

export async function updateFacilityLocation(
  facilityId: string,
  fields: FacilityLocationFields,
) {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Unauthorized");

  if (Object.keys(fields).length === 0) return;

  // Latitude and longitude only ever move together — a row carrying one
  // without the other cannot be placed on a map at all.
  const movingLat = fields.latitude !== undefined;
  const movingLng = fields.longitude !== undefined;
  if (movingLat !== movingLng) {
    throw new Error("Latitude and longitude must be set together.");
  }
  if (movingLat && movingLng) {
    const { latitude, longitude } = fields;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("Coordinates must both be numbers.");
    }
    if (!isWithinAddis(latitude, longitude)) {
      throw new Error(
        `${latitude}, ${longitude} is outside Addis Ababa — check the map link before saving.`,
      );
    }
  }

  // branch_count is never accepted from the client: it is the number of sites,
  // which is exactly branches.length + 1 (the array holds the ADDITIONAL sites;
  // the facility row itself is site one). Two fields that must agree but can be
  // set independently is the drift this codebase has been bitten by repeatedly
  // — the category maps, the nav route list, the category vocabulary. One
  // source of truth: count the array.
  const payload: Record<string, unknown> = { ...fields };
  if (Array.isArray(fields.branches)) {
    payload.branch_count = fields.branches.length + 1;
  } else {
    delete payload.branch_count;
  }

  const supabase = await createAdminSupabaseClient();
  const before = await loadFacilitySnapshot(supabase, facilityId, LOCATION_COLUMNS);

  const { error } = await supabase.from("facilities").update(payload).eq("id", facilityId);
  if (error) throw new Error(error.message);

  await logFacilityEdit(
    supabase,
    adminUser.id,
    facilityId,
    "facility_location_edited",
    before,
    payload,
    before?.name as string | undefined,
  );

  revalidatePath("/admin/facilities");
  revalidatePath(`/admin/facilities/${facilityId}/edit`);
  revalidatePath("/facilities/[slug]", "page");
  // /nearby ranks by these coordinates, so a stale cache there is the whole
  // point of this edit going unnoticed.
  revalidatePath("/nearby");
}

const CONTACT_COLUMNS =
  "name, phone, phone_2, whatsapp, telegram, email, website, instagram, facebook, tiktok, linkedin";

const URL_FIELDS = ["website", "instagram", "facebook", "tiktok", "linkedin"] as const;

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Partial for the same reason as the services payload: only the fields the
// admin actually changed are sent, so nothing else on the row is rewritten.
type FacilityContactFields = Partial<{
  phone: string;
  phone_2: string | null;
  whatsapp: string | null;
  telegram: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  linkedin: string | null;
}>;

export async function updateFacilityContact(
  facilityId: string,
  fields: FacilityContactFields,
) {
  const adminUser = await getAdminUser();
  if (!adminUser) throw new Error("Unauthorized");

  if (Object.keys(fields).length === 0) return;

  // Only enforced when phone is part of this edit — an untouched phone is
  // simply absent from the payload, not an attempt to clear it.
  if (fields.phone !== undefined && !fields.phone.trim()) {
    throw new Error("Primary phone is required.");
  }

  for (const key of URL_FIELDS) {
    const value = fields[key];
    if (value && !isValidUrl(value)) {
      throw new Error(`"${value}" is not a valid URL for ${key}.`);
    }
  }

  const supabase = await createAdminSupabaseClient();
  const before = await loadFacilitySnapshot(supabase, facilityId, CONTACT_COLUMNS);

  const { error } = await supabase.from("facilities").update(fields).eq("id", facilityId);
  if (error) throw new Error(error.message);

  await logFacilityEdit(
    supabase,
    adminUser.id,
    facilityId,
    "facility_contact_edited",
    before,
    fields,
    before?.name as string | undefined,
  );

  revalidatePath("/admin/facilities");
  revalidatePath(`/admin/facilities/${facilityId}/edit`);
  revalidatePath("/facilities/[slug]", "page");
}
