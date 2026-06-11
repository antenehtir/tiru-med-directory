# Codex Task 176: Real Provider Data Intake Format and Replacement Planning

## Project

DigitalDirectory-v2

## Goal

Define the real provider data intake format and staged replacement plan for moving from placeholder, sample, fallback, and QA provider data toward approved real provider records.

This task follows:

- `docs/CodexTask-171-PlaceholderAndTestDataInventory.md`
- `docs/CodexTask-172-PlaceholderAndTestDataClassificationDecisions.md`
- `docs/CodexTask-175-PublicFacingPlaceholderCopyCleanupQA.md`

This is a planning and data-format task. No source code, UI copy, test data, SQL, RLS, schema, migrations, static data, routes, probes, package scripts, or real provider data were modified for this task.

---

## Planning Status

```text
Real provider data intake format and replacement planning complete.
```

This document defines the intake format only. It does not approve import, deletion, migration, SQL execution, or replacement of any existing records.

---

## Context Reviewed

Required context reviewed:

- `docs/CodexTask-171-PlaceholderAndTestDataInventory.md`
- `docs/CodexTask-172-PlaceholderAndTestDataClassificationDecisions.md`
- `docs/CodexTask-175-PublicFacingPlaceholderCopyCleanupQA.md`
- `docs/CodexTask-176-RealProviderDataIntakeFormatAndReplacementPlanning.md`
- existing provider data structures in `src/data`
- existing Supabase public-read helper patterns in `src/lib/supabase`
- existing public listing types in `src/types/public-listings.ts`

Relevant current patterns:

- `PublicProviderType` currently supports `facility`, `doctor`, `pharmacy`, and `diagnostics`.
- Contact channel helper provider types include `facility`, `doctor`, `pharmacy`, and `diagnostic`.
- Public-read helpers only expose records with `listing_status = active` and `visibility_status = public`.
- Existing Supabase helper status values include `draft`, `pending`, `active`, `rejected`, `archived`, and `suspended`.
- Existing visibility values are `public`, `hidden`, and `internal`.
- Existing verification values include `unverified`, `pending`, `verified`, `disputed`, and `expired`.
- Current seed metadata includes sample-oriented source, listing, and review statuses that should remain until real replacement data and QA coverage are ready.

---

## Provider Categories

The real provider intake format should support these primary provider categories:

| Intake category | App/public listing type | Contact-channel provider type | Notes |
| --- | --- | --- | --- |
| Facilities | `facility` | `facility` | Hospitals, clinics, medical centers, specialty centers, care sites. |
| Doctors | `doctor` | `doctor` | Individual clinicians or professional profiles. |
| Pharmacies | `pharmacy` | `pharmacy` | Retail, hospital, specialty, compounding, and online pharmacies. |
| Diagnostics | `diagnostics` | `diagnostic` | Labs, imaging centers, radiology centers, pathology services, mixed diagnostic centers. |

Guidance:

- Use `diagnostics` for app/public listing category alignment.
- Use `diagnostic` only where the existing contact-channel helper expects singular provider type.
- Do not add new provider categories during this planning task.

---

## Intake Sections

The recommended intake workbook or structured file should use separate sheets/sections:

| Section | Purpose |
| --- | --- |
| Facilities | Core rows for hospitals, clinics, specialty centers, and care facilities. |
| Doctors | Core rows for individual clinicians and professional profiles. |
| Pharmacies | Core rows for pharmacy locations or pharmacy services. |
| Diagnostics | Core rows for labs, imaging centers, and diagnostic service providers. |
| Contact Channels | One-to-many public contact rows linked by provider category and slug. |
| Verification Notes | Review history, verification status, reviewer, and pending issues. |
| Source Tracking | Source details, collection date, source URL, and review notes. |
| Import QA Checklist | Pre-import checks and approval sign-off fields. |

Contact channels should stay separate because one provider may have multiple phone numbers, WhatsApp numbers, websites, emails, map links, booking links, or social links.

---

## Core Provider Fields

Every provider category should include these shared fields.

| Field | Required | Format / values | Notes |
| --- | --- | --- | --- |
| `provider_category` | Yes | `facility`, `doctor`, `pharmacy`, `diagnostics` | Main intake category. |
| `display_name` | Yes | Public provider name | Must be approved for public display. |
| `slug` | Yes | Lowercase hyphen slug | Stable public URL key. |
| `city` | Yes | Text | Example: `Addis Ababa`. |
| `area` | Recommended | Text | Neighborhood or area. |
| `public_address` | Recommended | Public-safe text | Do not include private notes. |
| `public_landmark` | Optional | Public-safe text | Helpful for local discovery. |
| `short_description` | Recommended | Public-safe summary | Avoid claims that are not verified. |
| `services_public` | Recommended | Semicolon-separated list | Public service labels only. |
| `opening_hours_public` | Optional | Text | Use only if verified. |
| `appointment_required` | Optional | `true`, `false`, `unknown` | Unknown is safer than guessing. |
| `walk_in_available` | Optional | `true`, `false`, `unknown` | Use only when confirmed. |
| `home_service_available` | Optional | `true`, `false`, `unknown` | Category-specific meaning. |
| `listing_status` | Yes | See status guidance below | Public reads require `active`. |
| `visibility_status` | Yes | See status guidance below | Public reads require `public`. |
| `verification_status` | Yes | See verification guidance below | Must not default to verified. |
| `last_confirmed_at` | Recommended | `YYYY-MM-DD` | Date provider information was confirmed. |
| `source_note` | Recommended | Internal text | Where the data came from. |
| `internal_review_note` | Optional | Internal text | Must not be displayed publicly. |

---

## Facilities Fields

Facilities should extend core fields with:

| Field | Required | Format / values | Notes |
| --- | --- | --- | --- |
| `facility_type` | Yes | Controlled value | Examples below. |
| `ownership_type` | Optional | `public`, `private`, `ngo`, `faith_based`, `unknown` | Use `unknown` if unclear. |
| `category` | Recommended | Public label | Example: `Clinic`, `Hospital`, `Medical center`. |
| `specialties` | Optional | Semicolon-separated list | Public-safe specialty labels. |
| `emergency_available` | Optional | `true`, `false`, `unknown` | Must be verified before public claim. |
| `inpatient_available` | Optional | `true`, `false`, `unknown` | Must be verified. |
| `outpatient_available` | Optional | `true`, `false`, `unknown` | Must be verified. |
| `diagnostics_available` | Optional | `true`, `false`, `unknown` | Use only if confirmed. |
| `pharmacy_available` | Optional | `true`, `false`, `unknown` | Use only if confirmed. |
| `related_service_ids` | Optional | Semicolon-separated ids | For future taxonomy mapping. |

Recommended `facility_type` values:

```text
general_hospital
specialty_hospital
specialty_center
clinic
medical_center
dental_clinic
eye_center
aesthetic_center
rehabilitation_center
home_care_provider
ambulance_provider
```

---

## Doctors Fields

Doctors should extend core fields with:

| Field | Required | Format / values | Notes |
| --- | --- | --- | --- |
| `doctor_name` | Yes | Public professional name | Usually same as `display_name`. |
| `professional_title` | Recommended | Text | Example: `Dr.`, `Prof.`, or approved title. |
| `specialty` | Yes | Public specialty label | Must be approved. |
| `subspecialty` | Optional | Text | Public-safe specialty detail. |
| `facility_affiliation` | Recommended | Public facility name or slug | Link later only after matching facility exists. |
| `consultation_modes` | Optional | Semicolon list | Example: `in_person; telemedicine`. |
| `languages` | Optional | Semicolon list | Use public-safe language labels. |
| `schedule_public` | Optional | Text | Do not invent appointment times. |
| `accepts_online_consultation` | Optional | `true`, `false`, `unknown` | Verified only. |
| `accepts_in_person_consultation` | Optional | `true`, `false`, `unknown` | Verified only. |
| `public_bio` | Optional | Public-safe summary | Avoid private credentials not approved for display. |

Do not include private personal details, private phone numbers, home addresses, personal documents, or credentials that are not intended for public display.

---

## Pharmacies Fields

Pharmacies should extend core fields with:

| Field | Required | Format / values | Notes |
| --- | --- | --- | --- |
| `pharmacy_type` | Yes | Controlled value | Examples below. |
| `service_modes` | Optional | Semicolon list | Example: `pickup; delivery; wellness`. |
| `delivery_available` | Optional | `true`, `false`, `unknown` | Public only after verification. |
| `pickup_available` | Optional | `true`, `false`, `unknown` | Public only after verification. |
| `accepts_prescription_upload` | Optional | `true`, `false`, `unknown` | Do not claim unless workflow exists and is approved. |
| `prescription_required_note` | Optional | Public-safe text | Avoid legal or medical advice. |
| `medicine_inventory_public` | Optional | Public-safe text/list | Use only if inventory is verified and maintainable. |

Recommended `pharmacy_type` values:

```text
retail_pharmacy
hospital_pharmacy
specialty_pharmacy
compounding_pharmacy
online_pharmacy
```

---

## Diagnostics Fields

Diagnostics should extend core fields with:

| Field | Required | Format / values | Notes |
| --- | --- | --- | --- |
| `diagnostic_provider_type` | Yes | Controlled value | Examples below. |
| `category` | Recommended | Public label | Example: `Laboratory`, `Imaging`, `Mixed diagnostics`. |
| `services_public` | Recommended | Semicolon list | Public diagnostic service labels. |
| `sample_collection_modes` | Optional | Semicolon list | Use only if confirmed. |
| `result_turnaround_public` | Optional | Text | Use only if verified. |
| `appointment_required` | Optional | `true`, `false`, `unknown` | Use current helper-aligned meaning. |
| `walk_in_available` | Optional | `true`, `false`, `unknown` | Must be verified. |
| `home_sample_collection` | Optional | `true`, `false`, `unknown` | Must be verified. |
| `pricing_public` | Optional | Text | Use only if approved and maintainable. |

Recommended `diagnostic_provider_type` values:

```text
laboratory
imaging_center
radiology_center
pathology_service
mixed_diagnostic_center
facility_diagnostic_department
home_sample_collection_provider
```

Public-listing type normalization should map diagnostic provider types into:

```text
laboratory
imaging
mixed
```

---

## Contact Channel Fields

Contact channels should be collected in a separate sheet/section.

| Field | Required | Format / values | Notes |
| --- | --- | --- | --- |
| `provider_category` | Yes | `facility`, `doctor`, `pharmacy`, `diagnostics` | Intake category. |
| `contact_provider_type` | Yes | `facility`, `doctor`, `pharmacy`, `diagnostic` | Must match contact-channel helper values. |
| `provider_slug` | Yes | Existing provider slug | Links channel to provider. |
| `channel_type` | Yes | Controlled value | See values below. |
| `label` | Recommended | Public label | Example: `Main phone`, `WhatsApp`, `Website`. |
| `value_public` | Yes | Public-safe value | Do not include private values. |
| `url_public` | Optional | URL or link href | Required for websites/maps/social links. |
| `is_primary` | Optional | `true` or `false` | One primary per provider/channel type if possible. |
| `display_order` | Optional | Number | Lower numbers display first. |
| `listing_status` | Yes | See status guidance | Public reads require `active`. |
| `visibility_status` | Yes | See status guidance | Public reads require `public`. |
| `verification_status` | Yes | See verification guidance | Contact-specific verification. |
| `last_confirmed_at` | Recommended | `YYYY-MM-DD` | Date contact was confirmed. |
| `source_note` | Recommended | Internal text | Where contact came from. |
| `internal_review_note` | Optional | Internal text | Not public. |

Recommended `channel_type` values:

```text
phone
whatsapp
telegram
website
email
maps
appointment
habaridoc
emergency
social
```

Contact channel rules:

- Use `visibility_status = public` only for contact details intended for public display.
- Do not include private staff numbers unless explicitly approved.
- Do not publish emergency, appointment, upload, or payment links unless workflow ownership is confirmed.
- Every contact row must match an intake provider category and slug.

---

## Verification Fields

Verification should be tracked at provider and contact-channel level.

| Field | Required | Format / values | Notes |
| --- | --- | --- | --- |
| `verification_status` | Yes | `unverified`, `pending`, `verified`, `disputed`, `expired` | Matches Supabase helper pattern. |
| `verification_method` | Recommended | Controlled text | Example: phone, official website, provider submitted. |
| `verified_by` | Recommended | Reviewer name/id | Internal only. |
| `verified_at` | Recommended when verified | `YYYY-MM-DD` | Required before using `verified` publicly. |
| `last_confirmed_at` | Recommended | `YYYY-MM-DD` | May differ from first verification date. |
| `verification_note_public` | Optional | Public-safe note | Avoid internal or sensitive text. |
| `verification_note_internal` | Optional | Internal note | Not public. |

Verification guidance:

- Use `verified` only after approved confirmation.
- Use `pending` when awaiting review.
- Use `unverified` for collected but unconfirmed data.
- Use `disputed` when sources conflict.
- Use `expired` when previously confirmed data is stale and needs reconfirmation.

---

## Source Tracking Fields

Every provider and contact channel should have source tracking.

| Field | Required | Format / values | Notes |
| --- | --- | --- | --- |
| `source_type` | Yes | Controlled value | See list below. |
| `source_name` | Recommended | Text | Organization, website, person, or process. |
| `source_url` | Optional | URL | Use for public web sources. |
| `source_date` | Recommended | `YYYY-MM-DD` | Date source was collected or checked. |
| `collected_by` | Recommended | Internal name/id | Internal only. |
| `reviewed_by` | Recommended before import | Internal name/id | Internal only. |
| `review_status` | Yes | `needs_review`, `approved`, `rejected`, `needs_followup` | Controls readiness. |
| `review_note` | Optional | Internal text | Not public. |

Recommended `source_type` values:

```text
provider_submitted
phone_verified
official_website
social_media
public_directory
field_visit
internal_staff_confirmation
government_or_regulator
partner_submission
unknown
```

---

## Slug Rules

Slug rules:

- lowercase only
- hyphen-separated
- ASCII letters and numbers only, plus hyphen
- no spaces
- no underscores
- no special characters except hyphen
- no leading or trailing hyphen
- no consecutive hyphens
- stable after publication
- unique within provider category
- should not include sensitive, private, or internal notes
- should not include verification status or listing status

Suggested validation regex:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Examples:

```text
st-paul-general-hospital
bole-alpha-pharmacy
addis-diagnostic-imaging-center
dr-hana-bekele
```

If two providers would have the same slug, append a stable area or category suffix, such as:

```text
central-care-pharmacy-bole
central-care-pharmacy-piassa
```

---

## Listing And Visibility Status Guidance

Recommended `listing_status` values:

| Value | Meaning | Public readable? |
| --- | --- | --- |
| `draft` | Incomplete internal row | No |
| `pending` | Awaiting review | No |
| `active` | Approved for public read if visibility is public | Yes, only with `visibility_status = public` |
| `rejected` | Not approved | No |
| `archived` | Historical / replaced | No |
| `suspended` | Temporarily blocked | No |

Recommended `visibility_status` values:

| Value | Meaning | Public readable? |
| --- | --- | --- |
| `public` | Intended for public display | Yes, only with `listing_status = active` |
| `hidden` | Hidden from public UI | No |
| `internal` | Internal QA/admin only | No |

Public-read rule:

```text
Only rows with listing_status = active and visibility_status = public should be publicly readable.
```

Rows must not be marked `active` and `public` until verification and owner approval are complete.

---

## Data Quality Validation Rules

Pre-import validation should check:

- every row has `provider_category`, `display_name`, `slug`, `listing_status`, `visibility_status`, and `verification_status`
- slugs match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- slugs are unique within provider category
- contact channel provider slugs match provider rows
- diagnostics contact channels use `contact_provider_type = diagnostic`
- all controlled values match approved lists
- dates use `YYYY-MM-DD`
- boolean fields use `true`, `false`, or `unknown` where applicable
- semicolon lists do not contain empty items
- public fields contain no internal notes, private phone numbers, personal addresses, passwords, tokens, or staff-only contacts
- `verified` rows have `verified_at` or `last_confirmed_at`
- `active` + `public` rows have enough public information for safe display
- unverified rows do not claim verified status in public copy
- duplicate provider names in the same area are reviewed manually
- URLs begin with `https://` where possible
- map links are public and safe
- appointment or booking links are owned/approved before display
- contact channel `display_order` values are numeric
- source tracking fields are present before import approval

Manual QA should also review:

- listing page cards
- detail pages
- contact panels
- search results
- correction request paths
- mobile layout
- desktop layout
- safe empty states for missing data

---

## Staged Replacement Strategy

Stage 1: Create intake template

- Build a spreadsheet-ready template with the sections defined above.
- Do not insert real data yet.

Stage 2: Project owner fills real provider data

- Collect provider rows, contact channels, verification notes, and source tracking.
- Keep private/internal notes out of public fields.

Stage 3: Validate intake data

- Run field-level validation, duplicate checks, slug checks, status checks, and privacy review.
- Keep rows in `draft`, `pending`, `hidden`, or `internal` until approved.

Stage 4: Prepare replacement mapping

- Map each sample/static provider row to either a real replacement, an archive decision, or a keep-for-QA decision.
- Do not delete QA/test fixtures during mapping.

Stage 5: Import only approved records

- Import to Supabase or approved seed structure only after owner approval.
- Preserve RLS expectations and public-read filters.

Stage 6: QA public surfaces

- Verify listing pages, detail pages, contact panels, search, correction flows, mobile, and desktop views.
- Confirm no private data is visible.

Stage 7: Archive or remove placeholder/test/fallback rows later

- Only after real data is stable, public pages pass QA, and replacement QA fixtures exist.
- Keep diagnostics test rows and probe fixtures until an explicit QA replacement plan exists.

---

## Do Not Delete Yet Warning

```text
Do not delete diagnostics test rows yet.
Do not delete fallback data yet.
Do not remove QA fixtures yet.
Do not insert real data until the intake format is approved.
Do not replace static data until real records and regression QA are ready.
Do not modify SQL, RLS, schema, or migrations as part of this planning task.
```

Reason:

The current test, fallback, and QA data still protects public-read behavior while real provider intake, validation, import, and regression QA are being planned.

---

## Recommended Next Task

Recommended next task:

```text
Task 177 — Real Provider Data Intake Template Creation
```

Purpose:

- Create a spreadsheet-ready intake template.
- Include separate sheets for Facilities, Doctors, Pharmacies, Diagnostics, Contact Channels, Verification Notes, Source Tracking, and Import QA Checklist.
- Add field descriptions, controlled-value lists, and validation guidance.
- Keep the task template-only unless owner approval expands scope.

Task 177 was not created as part of this task.

---

## Scope Confirmation

For Task 176:

- No source code was modified.
- No UI copy was modified.
- No test data was deleted.
- No SQL was modified.
- No RLS was modified.
- No schema was modified.
- No migrations were modified.
- No real data was inserted.
- No static data was modified.
- No routes were changed.
- No probes were modified.
- No package scripts were modified.
- Task 177 was not created.

---

## Planning Summary

The project should collect real provider data in a structured, category-specific intake template before any replacement begins. Provider rows, contact channels, verification notes, and source tracking should be separated so data can be validated safely. Public reads should continue to require `listing_status = active` and `visibility_status = public`. Test/fallback rows should remain in place until approved real data, replacement mapping, and regression QA are ready.
