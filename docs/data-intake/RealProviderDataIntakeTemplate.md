# Real Provider Data Intake Template

## Purpose

Use this spreadsheet-ready template to collect approved real provider information before any import, replacement, or deletion work begins.

This template is intentionally blank of real provider data. Example values are placeholders that show format only.

---

## Do Not Delete Or Import Yet

```text
Do not delete diagnostics test rows yet.
Do not delete fallback data yet.
Do not remove QA fixtures yet.
Do not insert real data until the intake template is reviewed and approved.
Do not modify SQL, RLS, schema, migrations, source code, routes, probes, package scripts, or static data from this template task.
```

Reason:

Existing test, fallback, and QA data still protects public-read behavior until real provider data, import mapping, and regression QA are ready.

---

## How To Use This Template

- Copy each section into its own spreadsheet tab.
- Keep public fields separate from internal review notes.
- Use semicolons for multi-value fields, for example `general care; pediatrics`.
- Use `unknown` instead of guessing.
- Do not include private staff phone numbers, private addresses, credentials, documents, passwords, tokens, or internal-only comments in public fields.
- Mark rows `active` and `public` only after verification and owner approval.

---

## Facilities

| Field name | Required or optional | Example value | Notes/guidance |
| --- | --- | --- | --- |
| `provider_category` | Required | `facility` | Must be `facility`. |
| `provider_subtype` | Optional | `clinic` | Broad subtype for intake grouping. |
| `display_name` | Required | `Example Facility Name` | Public facility name approved for display. |
| `slug` | Required | `example-facility-name` | Must follow slug rules. |
| `facility_type` | Required | `clinic` | Use allowed facility type values. |
| `ownership_type` | Optional | `private` | Use `public`, `private`, `ngo`, `faith_based`, or `unknown`. |
| `city` | Required | `Addis Ababa` | Public city. |
| `area` | Recommended | `Example Area` | Neighborhood or area. |
| `public_address` | Recommended | `Example public street address` | Public-safe address only. |
| `public_landmark` | Optional | `Near example landmark` | Public-safe landmark. |
| `short_description` | Recommended | `Short public service summary.` | Avoid unverified claims. |
| `specialties` | Optional | `pediatrics; internal medicine` | Semicolon-separated public labels. |
| `services` | Recommended | `general care; diagnostics` | Semicolon-separated public labels. |
| `emergency_available` | Optional | `unknown` | Use `true`, `false`, or `unknown`. |
| `inpatient_available` | Optional | `unknown` | Use only when verified. |
| `outpatient_available` | Optional | `true` | Use only when verified. |
| `diagnostics_available` | Optional | `unknown` | Use only when verified. |
| `pharmacy_available` | Optional | `unknown` | Use only when verified. |
| `opening_hours` | Optional | `Mon-Fri 8:00-17:00` | Use only if confirmed. |
| `appointment_required` | Optional | `unknown` | Use `true`, `false`, or `unknown`. |
| `walk_in_available` | Optional | `unknown` | Use only when verified. |
| `home_service_available` | Optional | `unknown` | Use only when verified. |
| `verification_status` | Required | `pending` | See allowed verification values. |
| `last_confirmed_at` | Recommended | `YYYY-MM-DD` | Required before marking verified if possible. |
| `listing_status` | Required | `pending` | Public reads require `active`. |
| `visibility_status` | Required | `hidden` | Public reads require `public`. |
| `source_note` | Recommended | `Provider submitted by intake form.` | Internal source context. |
| `internal_review_note` | Optional | `Needs phone confirmation.` | Internal only; do not publish. |

---

## Doctors

| Field name | Required or optional | Example value | Notes/guidance |
| --- | --- | --- | --- |
| `provider_category` | Required | `doctor` | Must be `doctor`. |
| `display_name` | Required | `Dr. Example Name` | Public professional name approved for display. |
| `slug` | Required | `dr-example-name` | Must follow slug rules. |
| `doctor_name` | Required | `Dr. Example Name` | Usually same as display name. |
| `professional_title` | Recommended | `Dr.` | Use approved title only. |
| `specialty` | Required | `Pediatrics` | Public specialty label. |
| `subspecialty` | Optional | `Pediatric cardiology` | Public-safe label. |
| `facility_affiliation` | Recommended | `example-facility-name` | Use facility slug or approved public name. |
| `city` | Required | `Addis Ababa` | Public city. |
| `area` | Recommended | `Example Area` | Public area. |
| `consultation_modes` | Optional | `in_person; telemedicine` | Use only when confirmed. |
| `languages` | Optional | `Amharic; English` | Public language labels. |
| `schedule_public` | Optional | `Mon-Wed mornings` | Do not invent appointment times. |
| `accepts_online_consultation` | Optional | `unknown` | Use `true`, `false`, or `unknown`. |
| `accepts_in_person_consultation` | Optional | `unknown` | Use `true`, `false`, or `unknown`. |
| `short_description` | Optional | `Short public professional summary.` | Avoid private/unverified claims. |
| `services` | Optional | `consultation; follow-up` | Semicolon-separated public labels. |
| `verification_status` | Required | `pending` | See allowed verification values. |
| `last_confirmed_at` | Recommended | `YYYY-MM-DD` | Required before marking verified if possible. |
| `listing_status` | Required | `pending` | Public reads require `active`. |
| `visibility_status` | Required | `hidden` | Public reads require `public`. |
| `source_note` | Recommended | `Provider submitted by intake form.` | Internal source context. |
| `internal_review_note` | Optional | `Needs license/name confirmation.` | Internal only; do not publish. |

Do not request or store private personal details that are not intended for public display.

---

## Pharmacies

| Field name | Required or optional | Example value | Notes/guidance |
| --- | --- | --- | --- |
| `provider_category` | Required | `pharmacy` | Must be `pharmacy`. |
| `provider_subtype` | Optional | `retail_pharmacy` | Broad subtype for intake grouping. |
| `display_name` | Required | `Example Pharmacy Name` | Public pharmacy name approved for display. |
| `slug` | Required | `example-pharmacy-name` | Must follow slug rules. |
| `pharmacy_type` | Required | `retail_pharmacy` | Use allowed pharmacy type values. |
| `city` | Required | `Addis Ababa` | Public city. |
| `area` | Recommended | `Example Area` | Public area. |
| `public_address` | Recommended | `Example public street address` | Public-safe address only. |
| `public_landmark` | Optional | `Near example landmark` | Public-safe landmark. |
| `short_description` | Recommended | `Short public pharmacy summary.` | Avoid unverified inventory claims. |
| `services` | Recommended | `prescription pickup; wellness items` | Semicolon-separated public labels. |
| `delivery_available` | Optional | `unknown` | Use only when verified. |
| `pickup_available` | Optional | `unknown` | Use only when verified. |
| `prescription_required_note` | Optional | `Prescription required for regulated medicines.` | Public-safe note; avoid medical/legal advice. |
| `opening_hours` | Optional | `Mon-Sat 8:00-20:00` | Use only if confirmed. |
| `appointment_required` | Optional | `false` | Use `true`, `false`, or `unknown`. |
| `walk_in_available` | Optional | `unknown` | Use only when verified. |
| `home_service_available` | Optional | `unknown` | Use only when verified. |
| `verification_status` | Required | `pending` | See allowed verification values. |
| `last_confirmed_at` | Recommended | `YYYY-MM-DD` | Required before marking verified if possible. |
| `listing_status` | Required | `pending` | Public reads require `active`. |
| `visibility_status` | Required | `hidden` | Public reads require `public`. |
| `source_note` | Recommended | `Provider submitted by intake form.` | Internal source context. |
| `internal_review_note` | Optional | `Needs public phone confirmation.` | Internal only; do not publish. |

---

## Diagnostics

| Field name | Required or optional | Example value | Notes/guidance |
| --- | --- | --- | --- |
| `provider_category` | Required | `diagnostics` | Use plural for app/public listing category. |
| `provider_subtype` | Optional | `laboratory` | Broad subtype for intake grouping. |
| `display_name` | Required | `Example Diagnostic Center` | Public diagnostics provider name. |
| `slug` | Required | `example-diagnostic-center` | Must follow slug rules. |
| `diagnostic_provider_type` | Required | `laboratory` | Use allowed diagnostics provider type values. |
| `category` | Recommended | `Laboratory` | Public category label. |
| `city` | Required | `Addis Ababa` | Public city. |
| `area` | Recommended | `Example Area` | Public area. |
| `address_public` | Recommended | `Example public street address` | Public-safe address only. |
| `landmark_public` | Optional | `Near example landmark` | Public-safe landmark. |
| `short_description` | Recommended | `Short public diagnostics summary.` | Avoid unverified pricing/result claims. |
| `services_public` | Recommended | `blood tests; imaging` | Semicolon-separated public labels. |
| `sample_collection_modes` | Optional | `on_site; home_visit` | Use only when confirmed. |
| `opening_hours_public` | Optional | `Mon-Fri 8:00-17:00` | Use only if confirmed. |
| `result_turnaround_public` | Optional | `Same day for selected tests` | Use only if verified and maintainable. |
| `appointment_required_preview` | Optional | `unknown` | Use `true`, `false`, or `unknown`; mirrors current helper naming. |
| `walk_in_available` | Optional | `unknown` | Use only when verified. |
| `home_sample_collection_preview` | Optional | `unknown` | Use `true`, `false`, or `unknown`; mirrors current helper naming. |
| `verification_status` | Required | `pending` | See allowed verification values. |
| `last_confirmed_at` | Recommended | `YYYY-MM-DD` | Required before marking verified if possible. |
| `listing_status` | Required | `pending` | Public reads require `active`. |
| `visibility_status` | Required | `hidden` | Public reads require `public`. |
| `source_note` | Recommended | `Provider submitted by intake form.` | Internal source context. |
| `internal_review_note` | Optional | `Needs services confirmation.` | Internal only; do not publish. |

---

## Contact Channels

Use one row per public contact method. A single provider can have multiple contact channel rows.

| Field name | Required or optional | Example value | Notes/guidance |
| --- | --- | --- | --- |
| `provider_category` | Required | `diagnostics` | Intake category: `facility`, `doctor`, `pharmacy`, or `diagnostics`. |
| `contact_provider_type` | Required | `diagnostic` | Use singular `diagnostic` for diagnostics contact channels. |
| `provider_slug` | Required | `example-diagnostic-center` | Must match a provider slug from the relevant section. |
| `channel_type` | Required | `phone` | Use allowed channel type values. |
| `label` | Recommended | `Main phone` | Public label. |
| `value_public` | Required | `+251 900 000 000` | Public-safe contact value only. |
| `url_public` | Optional | `https://example.org` | Required for website/maps/social links. |
| `is_primary` | Optional | `true` | Use `true` or `false`. |
| `display_order` | Optional | `1` | Lower numbers display first. |
| `listing_status` | Required | `pending` | Public reads require `active`. |
| `visibility_status` | Required | `hidden` | Public reads require `public`. |
| `verification_status` | Required | `pending` | Contact-specific verification. |
| `last_confirmed_at` | Recommended | `YYYY-MM-DD` | Date this contact detail was confirmed. |
| `source_note` | Recommended | `Confirmed by provider call.` | Internal source context. |
| `internal_review_note` | Optional | `Confirm this is not a private staff number.` | Internal only; do not publish. |

Contact channel guidance:

- Do not include private staff numbers unless explicitly approved for public listing.
- Use `visibility_status = public` only for public display.
- Appointment, emergency, upload, payment, and booking links require explicit workflow ownership approval.
- Map links should be public and safe.
- `provider_slug` must exactly match a provider row.

---

## Verification Notes

Use this section to track review and verification decisions separately from public provider data.

| Field name | Required or optional | Example value | Notes/guidance |
| --- | --- | --- | --- |
| `provider_category` | Required | `facility` | Use the intake category. |
| `provider_slug` | Required | `example-facility-name` | Must match provider row. |
| `review_status` | Required | `in_review` | See allowed review status values. |
| `verification_status` | Required | `pending` | See allowed verification values. |
| `reviewed_by` | Recommended | `Reviewer name or id` | Internal only. |
| `review_date` | Recommended | `YYYY-MM-DD` | Date reviewed. |
| `verification_method` | Recommended | `phone_verified` | How the information was checked. |
| `verification_note` | Optional | `Need second source for hours.` | Internal unless explicitly approved. |
| `issue_flag` | Optional | `needs_contact_confirmation` | Use concise internal issue tags. |
| `next_review_date` | Optional | `YYYY-MM-DD` | Useful for expiring verification. |

---

## Source Tracking

Use this section to track where each provider or contact-channel record came from.

| Field name | Required or optional | Example value | Notes/guidance |
| --- | --- | --- | --- |
| `provider_category` | Required | `pharmacy` | Use the intake category. |
| `provider_slug` | Required | `example-pharmacy-name` | Must match provider row. |
| `source_type` | Required | `provider_submitted` | See allowed source type values. |
| `source_name` | Recommended | `Provider intake form` | Source name or process. |
| `source_url` | Optional | `https://example.org` | Use for public web sources. |
| `source_date` | Recommended | `YYYY-MM-DD` | Date source was collected or checked. |
| `collected_by` | Recommended | `Collector name or id` | Internal only. |
| `reviewed_by` | Recommended | `Reviewer name or id` | Internal only. |
| `review_status` | Required | `needs_review` | See allowed review status values. |
| `review_note` | Optional | `Public address needs confirmation.` | Internal only. |

---

## Import QA Checklist

Use one row per QA check. Mark `result` only after reviewing the completed intake workbook.

| Field name | Required or optional | Example value | Notes/guidance |
| --- | --- | --- | --- |
| `check_name` | Required | `No duplicate slugs` | Name of QA check. |
| `required` | Required | `true` | Use `true` or `false`. |
| `result` | Required | `not_started` | Use `not_started`, `passed`, `failed`, or `needs_review`. |
| `reviewer` | Optional | `Reviewer name or id` | Internal only. |
| `review_date` | Optional | `YYYY-MM-DD` | Date check was completed. |
| `notes` | Optional | `Duplicate check pending.` | Internal QA notes. |

Required checklist items:

| Check name | Required | Guidance |
| --- | --- | --- |
| No duplicate slugs | Yes | Check uniqueness within provider category. |
| All required display names are present | Yes | Every provider row must have `display_name`. |
| All provider categories are valid | Yes | Use allowed provider category values only. |
| All listing_status values are valid | Yes | Use allowed listing status values only. |
| All visibility_status values are valid | Yes | Use allowed visibility status values only. |
| All public contact details are approved | Yes | No unapproved contact detail should be public. |
| No private staff contact details are included | Yes | Privacy and safety check. |
| All active/public rows have minimum location information | Yes | At least city and preferably area/address. |
| All verified rows have last_confirmed_at | Yes | Verification must have date support. |
| Diagnostics provider types match approved values | Yes | Use allowed diagnostics provider types. |
| Contact channel provider_category matches provider rows | Yes | Verify category and slug match. |
| Rows marked hidden/internal will not appear publicly | Yes | Confirm status behavior before import. |
| Source tracking exists for each row | Yes | Every row needs source context. |
| Public fields contain no internal notes | Yes | Internal review text must stay out of public fields. |

---

## Allowed Values Reference

Provider category values:

```text
facility
doctor
pharmacy
diagnostics
```

Contact-channel provider type values:

```text
facility
doctor
pharmacy
diagnostic
```

Listing status values:

```text
draft
pending
active
rejected
archived
suspended
```

Visibility status values:

```text
public
hidden
internal
```

Verification status values:

```text
unverified
pending
verified
disputed
expired
```

Boolean values:

```text
true
false
unknown
```

Review status values:

```text
not_started
needs_review
in_review
approved
needs_correction
needs_followup
rejected
```

Facility type values:

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

Pharmacy type values:

```text
retail_pharmacy
hospital_pharmacy
specialty_pharmacy
compounding_pharmacy
online_pharmacy
```

Diagnostics provider type values:

```text
laboratory
imaging_center
radiology_center
pathology_service
mixed_diagnostic_center
facility_diagnostic_department
home_sample_collection_provider
```

Public diagnostics type mapping:

```text
laboratory -> laboratory
pathology_service -> laboratory
imaging_center -> imaging
radiology_center -> imaging
mixed_diagnostic_center -> mixed
facility_diagnostic_department -> mixed
home_sample_collection_provider -> mixed
```

Contact channel type values:

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

Source type values:

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

Slug requirements:

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
- no sensitive, private, or internal notes
- no verification status or listing status inside the slug

Validation regex:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Format examples only:

```text
example-general-hospital
example-pharmacy-bole
example-diagnostic-imaging-center
dr-example-name
```

---

## Diagnostics Provider Type Guidance

- Use `diagnostic_provider_type` for the diagnostic provider subtype.
- Use `provider_category = diagnostics` in the Diagnostics sheet.
- Use `contact_provider_type = diagnostic` in the Contact Channels sheet for diagnostics providers.
- Do not use diagnostics service labels as provider types.
- Do not publish test availability, pricing, result turnaround, booking, upload, or home collection claims unless verified and maintainable.

---

## Recommended Next Task

Recommended next task:

```text
Task 178 — Real Provider Data Intake Template QA
```

Purpose:

- Verify the template is complete.
- Confirm the project owner can use it to prepare real provider data.
- Decide whether to produce Excel/CSV files next.
- Prepare for real data collection/import planning.
