import { revalidatePath, updateTag } from "next/cache";
import { FACILITIES_CACHE_TAG } from "@/lib/supabase/get-facilities";
import { summarizeFacilityChanges } from "@/lib/audit/change-summary";
import { firstPhoneError } from "@/lib/phone";
import type { createProviderSupabaseClient } from "@/lib/supabase/provider-client";

// One save path for the live facility editor, whoever is holding it.
//
// The editor's sections are shared between /admin/facilities/[id]/edit and a
// verified provider's own /provider/listing. What differs between those two
// is who may write, and how the edit is recorded — not what counts as a valid
// edit. So validation, the before-snapshot, the write, the audit entry and the
// cache clearing all live here, once, and the two server-action files only
// establish who the editor is.
//
// Both admin and provider clients are createServerClient over the anon key
// with the user's own session, so they are the same type and RLS decides what
// each may touch: admins through the admin policies, providers through 028
// (their own approved facility only) narrowed by 062.

type EditorClient = Awaited<ReturnType<typeof createProviderSupabaseClient>>;

export type FacilityEditor = {
  kind: "admin" | "provider";
  // admin_users.id or provider_accounts.id — both are the auth user id.
  id: string;
  supabase: EditorClient;
};

type Section =
  | "services"
  | "contact"
  | "location"
  | "identity"
  | "about"
  | "checkups"
  | "doctors"
  | "media";

// Admin actions keep the names the audit log has always used, so older rows
// and newer rows read the same. Provider actions get their own names, so a
// reader can tell at a glance whether the facility or Tiru made the change —
// not only from the actor column.
function auditAction(kind: FacilityEditor["kind"], section: Section): string {
  return kind === "admin" ? `facility_${section}_edited` : `provider_${section}_edited`;
}

// Pages that render a facility, and so hold a copy of whatever was just
// changed. Listing pages read the shared tagged list, so the tag is what
// actually refreshes them; the paths refresh the pages rendered per request.
function refreshFacilityPages(facilityId: string, section: Section) {
  revalidatePath("/admin/facilities");
  revalidatePath(`/admin/facilities/${facilityId}/edit`);
  revalidatePath("/provider/listing");
  revalidatePath("/facilities/[slug]", "page");
  updateTag(FACILITIES_CACHE_TAG);
  revalidatePath("/facilities");
  revalidatePath("/search");
  revalidatePath("/");
  // /nearby ranks by coordinates — a stale copy there is exactly how a moved
  // pin goes unnoticed.
  if (section === "location") revalidatePath("/nearby");
  if (section === "doctors") {
    revalidatePath("/specialists");
    revalidatePath("/specialists/[slug]", "page");
  }
}

async function commitSection(
  editor: FacilityEditor,
  facilityId: string,
  section: Section,
  payload: Record<string, unknown>,
) {
  if (Object.keys(payload).length === 0) return;

  const { supabase } = editor;
  const columns = Array.from(new Set(["name", ...Object.keys(payload)])).join(", ");

  // The snapshot is what the diff in the audit entry is taken against.
  const { data: before } = await supabase
    .from("facilities")
    .select(columns)
    .eq("id", facilityId)
    .single();

  // .select("id") is not decoration. An UPDATE that RLS filters out returns
  // no error — it simply matches nothing — and that silence once kept a
  // provider's edits off the public page for two and a half months. Counting
  // the rows turns "not permitted" back into an error someone sees.
  const { data: rows, error } = await supabase
    .from("facilities")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", facilityId)
    .select("id");

  if (error) throw new Error(error.message);
  if (!rows || rows.length === 0) {
    throw new Error("This listing could not be updated — you may not have permission to edit it.");
  }

  const snapshot = before as Record<string, unknown> | null;
  const { old_value, new_value, changed, changedLabels } = summarizeFacilityChanges(
    snapshot,
    payload,
  );

  if (changed.length > 0) {
    const facilityName = (payload.name ?? snapshot?.name ?? facilityId) as string;
    const who = editor.kind === "admin" ? "Admin" : "Provider";
    const { error: auditError } = await supabase.from("audit_log").insert({
      ...(editor.kind === "admin" ? { admin_id: editor.id } : { provider_id: editor.id }),
      action: auditAction(editor.kind, section),
      entity_type: "facility",
      entity_id: facilityId,
      old_value,
      new_value,
      note: `${who} edited ${changedLabels} on "${facilityName}"`,
    });
    // Surfaced rather than swallowed: a silent failure here means an edit
    // reached the public listing with no record of who made it.
    if (auditError) {
      throw new Error(`Saved, but the audit log write failed: ${auditError.message}`);
    }
  }

  refreshFacilityPages(facilityId, section);
}

// ---------------------------------------------------------------------------
// Services & Specialties
// ---------------------------------------------------------------------------

// Every key is optional: the editor sends only what was actually changed, so
// an untouched column is never overwritten with a UI default.
export type FacilityServicesFields = {
  services?: string[];
  // Legacy CSV-import column. The editor only ever sends an empty array here
  // — see AdminFacilityServicesEditor's hadSpecialServices — retiring it into
  // services rather than managing it as a field of its own.
  special_services?: string[];
  custom_service_categories?: Record<string, string[]>;
  schedule?: unknown;
  working_hours?: string;
  payment_methods?: string[];
  insurance_note?: string | null;
  walkin_appointment?: string | null;
  appointment_modalities?: unknown;
  emergency_type?: string | null;
  // Which service lists a Diagnostic Center is shown. Only three values are
  // meaningful and the column's CHECK constraint enforces them, but the guard
  // is here too: a bad value would not error, it would quietly hide a list the
  // facility needs.
  diagnostic_subtype?: string | null;
  // Three-state: null means nobody has answered, which the listing shows as
  // silence rather than as "open on holidays".
  closed_on_public_holidays?: boolean | null;
  // Inpatient beds (migration 064); null means not stated.
  bed_count?: number | null;
};

export async function saveServicesSection(
  editor: FacilityEditor,
  facilityId: string,
  fields: FacilityServicesFields,
) {
  if (fields.services && fields.services.length === 0) {
    throw new Error("At least one service is required.");
  }
  if (
    fields.diagnostic_subtype != null &&
    !["lab", "imaging", "both"].includes(fields.diagnostic_subtype)
  ) {
    throw new Error(`Unknown diagnostic subtype "${fields.diagnostic_subtype}".`);
  }
  if (
    fields.bed_count != null &&
    (!Number.isInteger(fields.bed_count) || fields.bed_count < 1 || fields.bed_count > 5000)
  ) {
    throw new Error("Number of beds must be a whole number between 1 and 5000.");
  }

  if (Array.isArray(fields.appointment_modalities)) {
    const phoneProblem = firstPhoneError(
      (fields.appointment_modalities as { type?: string; value?: string }[])
        .filter((m) => m?.type === "phone" || m?.type === "phone_2" || m?.type === "whatsapp")
        .map((m) => ({
          label: m.type === "whatsapp" ? "WhatsApp booking" : "Booking phone",
          value: m.value,
          kind: m.type === "whatsapp" ? ("personal" as const) : ("facility" as const),
        })),
    );
    if (phoneProblem) throw new Error(phoneProblem);
  }

  const payload: Record<string, unknown> = { ...fields };

  // Two columns the onboarding wizard always kept in step with these and the
  // editor never did: insurance_accepted is "Insurance" being ticked, and
  // booking_link is the online booking entry. Derived here so an edit from
  // either tool leaves the row saying one thing.
  if (Array.isArray(fields.payment_methods)) {
    payload.insurance_accepted = fields.payment_methods.includes("Insurance");
  }
  if (Array.isArray(fields.appointment_modalities)) {
    const online = (fields.appointment_modalities as { type?: string; value?: string }[]).find(
      (m) => m?.type === "online",
    );
    payload.booking_link = online?.value?.trim() || null;
  }

  await commitSection(editor, facilityId, "services", payload);
}

// ---------------------------------------------------------------------------
// Contact & Social
// ---------------------------------------------------------------------------

const URL_FIELDS = ["website", "instagram", "facebook", "tiktok", "linkedin", "youtube"] as const;

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export type FacilityContactFields = Partial<{
  // The full list. phone and phone_2 remain its first two entries and are
  // always sent alongside it, so a reader that knows only the old columns and
  // one that reads the array can never disagree about a facility's numbers.
  phones: string[];
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
  youtube: string | null;
}>;

export async function saveContactSection(
  editor: FacilityEditor,
  facilityId: string,
  fields: FacilityContactFields,
) {
  // Only enforced when phone is part of this edit — an untouched phone is
  // simply absent from the payload, not an attempt to clear it.
  if (fields.phone !== undefined && !fields.phone.trim()) {
    throw new Error("Primary phone is required.");
  }
  if (fields.phones !== undefined) {
    if (fields.phones.length === 0) {
      throw new Error("At least one phone number is required.");
    }
    // The pair has to mirror the head of the list, or the row describes two
    // different sets of numbers depending on who reads it.
    if (fields.phone !== undefined && fields.phones[0] !== fields.phone) {
      throw new Error("The first number and the primary phone must match.");
    }
  }
  for (const key of URL_FIELDS) {
    const value = fields[key];
    if (value && !isValidUrl(value)) {
      throw new Error(`"${value}" is not a valid URL for ${key}.`);
    }
  }
  const phoneProblem = firstPhoneError([
    ...(fields.phones ?? []).map((value, i) => ({ label: `Phone number ${i + 1}`, value })),
    { label: "Primary phone", value: fields.phone },
    { label: "Second phone", value: fields.phone_2 },
    { label: "WhatsApp", value: fields.whatsapp, kind: "personal" as const },
  ]);
  if (phoneProblem) throw new Error(phoneProblem);

  await commitSection(editor, facilityId, "contact", { ...fields });
}

// ---------------------------------------------------------------------------
// Location (incl. branches)
// ---------------------------------------------------------------------------

export type FacilityLocationFields = Partial<{
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

export async function saveLocationSection(
  editor: FacilityEditor,
  facilityId: string,
  fields: FacilityLocationFields,
) {
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

  // branch_count is never accepted from the client: it is the number of
  // sites, which is exactly branches.length + 1 (the array holds the
  // ADDITIONAL sites; the facility row itself is site one). One source of
  // truth: count the array.
  const payload: Record<string, unknown> = { ...fields };
  if (Array.isArray(fields.branches)) {
    const phoneProblem = firstPhoneError(
      (fields.branches as { name?: string; phone?: string; phone_2?: string }[]).flatMap((b, i) => [
        { label: `${b?.name?.trim() || `Branch ${i + 1}`} phone`, value: b?.phone },
        { label: `${b?.name?.trim() || `Branch ${i + 1}`} second number`, value: b?.phone_2 },
      ]),
    );
    if (phoneProblem) throw new Error(phoneProblem);
    payload.branch_count = fields.branches.length + 1;
  } else {
    delete payload.branch_count;
  }

  await commitSection(editor, facilityId, "location", payload);
}

// ---------------------------------------------------------------------------
// Identity — admin only
// ---------------------------------------------------------------------------

// Name and category change the listing a search result is trusted by, so a
// provider's changes go through requestFacilityNameChange /
// requestFacilityTypeChange (admin review) instead, and migration 062 refuses
// them at the database too.
export type FacilityIdentityFields = Partial<{
  name: string;
  category: string;
  // Only ever sent for the "describes as" labels or a free-typed Other —
  // subcategory doubles as most facilities' own short description text.
  subcategory: string | null;
}>;

export async function saveIdentitySection(
  editor: FacilityEditor,
  facilityId: string,
  fields: FacilityIdentityFields,
) {
  if (editor.kind !== "admin") {
    throw new Error("Name and type changes are reviewed by Tiru Health — request one from your listing.");
  }
  if (fields.name !== undefined && !fields.name.trim()) {
    throw new Error("Facility name is required.");
  }
  if (fields.category !== undefined) {
    const { isMappedFacilityCategory } = await import("@/lib/frontend-search-filters");
    if (!isMappedFacilityCategory(fields.category)) {
      throw new Error(`"${fields.category}" is not a supported facility category.`);
    }
  }

  await commitSection(editor, facilityId, "identity", { ...fields });
}

// ---------------------------------------------------------------------------
// About — description, languages, who it serves
// ---------------------------------------------------------------------------

const MAX_DESCRIPTION_LENGTH = 2000;

export type FacilityAboutFields = Partial<{
  alt_name: string | null;
  ownership_type: string | null;
  description: string | null;
  languages: string[];
  patient_groups: string[];
  access_notes: string | null;
}>;

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export async function saveAboutSection(
  editor: FacilityEditor,
  facilityId: string,
  fields: FacilityAboutFields,
) {
  if (fields.description && fields.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`The description is limited to ${MAX_DESCRIPTION_LENGTH} characters.`);
  }
  if (fields.languages !== undefined && !isStringList(fields.languages)) {
    throw new Error("Languages must be a list.");
  }
  if (fields.patient_groups !== undefined && !isStringList(fields.patient_groups)) {
    throw new Error("Patient groups must be a list.");
  }

  await commitSection(editor, facilityId, "about", { ...fields });
}

// ---------------------------------------------------------------------------
// Check-up packages
// ---------------------------------------------------------------------------

export type FacilityCheckupFields = Partial<{
  checkup_offered: boolean;
  checkup_packages: { name: string; url: string; fileType: "pdf" | "image" }[];
  checkup_note: string | null;
}>;

export async function saveCheckupsSection(
  editor: FacilityEditor,
  facilityId: string,
  fields: FacilityCheckupFields,
) {
  if (fields.checkup_offered !== undefined && typeof fields.checkup_offered !== "boolean") {
    throw new Error("Check-ups offered must be yes or no.");
  }
  if (fields.checkup_packages !== undefined) {
    const valid =
      Array.isArray(fields.checkup_packages) &&
      fields.checkup_packages.every(
        (pkg) => pkg && typeof pkg.name === "string" && typeof pkg.url === "string" && isValidUrl(pkg.url),
      );
    if (!valid) throw new Error("Each check-up package needs a name and a valid file link.");
  }

  await commitSection(editor, facilityId, "checkups", { ...fields });
}

// ---------------------------------------------------------------------------
// Doctors
// ---------------------------------------------------------------------------

export async function saveDoctorsSection(
  editor: FacilityEditor,
  facilityId: string,
  doctors: unknown,
) {
  if (!Array.isArray(doctors) || doctors.some((d) => !d || typeof d !== "object")) {
    throw new Error("The doctor list could not be read.");
  }
  await commitSection(editor, facilityId, "doctors", { doctors });
}

// ---------------------------------------------------------------------------
// Photos & logo
// ---------------------------------------------------------------------------

export const MAX_FACILITY_PHOTOS = 4;

export type FacilityMediaFields = {
  entrance_photo_urls: string[];
  logo_url: string;
};

export async function saveMediaSection(
  editor: FacilityEditor,
  facilityId: string,
  fields: FacilityMediaFields,
) {
  const photos = fields.entrance_photo_urls;
  if (!isStringList(photos) || photos.some((url) => !isValidUrl(url))) {
    throw new Error("A photo link could not be read.");
  }
  if (photos.length > MAX_FACILITY_PHOTOS) {
    throw new Error(`A listing can show up to ${MAX_FACILITY_PHOTOS} photos.`);
  }
  if (fields.logo_url && !isValidUrl(fields.logo_url)) {
    throw new Error("The logo link could not be read.");
  }

  // photo_url is the listing's main image and is always the first gallery
  // photo — the same pairing buildFacilityFieldsFromClaim writes on approval.
  await commitSection(editor, facilityId, "media", {
    photo_urls: photos,
    photo_url: photos[0] ?? null,
    logo_url: fields.logo_url || null,
  });
}
