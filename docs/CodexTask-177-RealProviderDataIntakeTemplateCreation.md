# Codex Task 177: Real Provider Data Intake Template Creation

## Project

DigitalDirectory-v2

## Goal

Create a spreadsheet-ready real provider data intake template that the project owner can use to provide real healthcare provider information in a structure compatible with the app and future Supabase replacement workflow.

This task follows:

* CodexTask-171-PlaceholderAndTestDataInventory.md
* CodexTask-172-PlaceholderAndTestDataClassificationDecisions.md
* CodexTask-175-PublicFacingPlaceholderCopyCleanupQA.md
* CodexTask-176-RealProviderDataIntakeFormatAndReplacementPlanning.md

This task creates a template only.

Do not insert, delete, import, or modify real provider data in this task.

---

## Important Context

Task 176 defined the real provider data intake format and replacement planning.

The template should help the project owner provide real data for:

```text
Facilities
Doctors
Pharmacies
Diagnostics
Contact Channels
Verification Notes
Source Tracking
Import QA Checklist
```

The template should be spreadsheet-ready, easy to copy into Excel or Google Sheets, and compatible with later import/replacement planning.

---

## Main Objective

Create a real provider data intake template in the repository.

Recommended target folder:

```text
docs/data-intake/
```

Recommended primary template file:

```text
docs/data-intake/RealProviderDataIntakeTemplate.md
```

If project conventions support multiple template files, Codex may also create CSV-ready companion files, but keep the task focused and minimal.

---

## Required Template Sections

The template must include these sections:

```text
1. Facilities
2. Doctors
3. Pharmacies
4. Diagnostics
5. Contact Channels
6. Verification Notes
7. Source Tracking
8. Import QA Checklist
```

Each section should include:

* Field name
* Required or optional
* Example value
* Notes / guidance

---

## Facilities Template Fields

Include these fields:

```text
provider_category
provider_subtype
display_name
slug
facility_type
ownership_type
city
area
public_address
public_landmark
short_description
specialties
services
emergency_available
inpatient_available
outpatient_available
diagnostics_available
pharmacy_available
opening_hours
appointment_required
walk_in_available
home_service_available
verification_status
last_confirmed_at
listing_status
visibility_status
source_note
internal_review_note
```

---

## Doctors Template Fields

Include these fields:

```text
provider_category
display_name
slug
doctor_name
professional_title
specialty
subspecialty
facility_affiliation
city
area
consultation_modes
languages
schedule_public
accepts_online_consultation
accepts_in_person_consultation
short_description
services
verification_status
last_confirmed_at
listing_status
visibility_status
source_note
internal_review_note
```

Do not request private personal details that are not intended for public display.

---

## Pharmacies Template Fields

Include these fields:

```text
provider_category
provider_subtype
display_name
slug
pharmacy_type
city
area
public_address
public_landmark
short_description
services
delivery_available
pickup_available
prescription_required_note
opening_hours
appointment_required
walk_in_available
home_service_available
verification_status
last_confirmed_at
listing_status
visibility_status
source_note
internal_review_note
```

---

## Diagnostics Template Fields

Include these fields:

```text
provider_category
provider_subtype
display_name
slug
diagnostic_provider_type
category
city
area
address_public
landmark_public
short_description
services_public
sample_collection_modes
opening_hours_public
result_turnaround_public
appointment_required_preview
walk_in_available
home_sample_collection_preview
verification_status
last_confirmed_at
listing_status
visibility_status
source_note
internal_review_note
```

Recommended diagnostics provider type values:

```text
laboratory
imaging_center
radiology_center
pathology_service
mixed_diagnostic_center
facility_diagnostic_department
home_sample_collection_provider
```

---

## Contact Channels Template Fields

Contact channels should be separate because a provider can have multiple public contact methods.

Include these fields:

```text
provider_category
provider_slug
channel_type
label
value
href
availability_note
display_order
is_public
verification_status
last_confirmed_at
source_note
internal_review_note
```

Recommended `provider_category` values:

```text
facility
doctor
pharmacy
diagnostic
```

Recommended `channel_type` values:

```text
phone
whatsapp
email
website
map
booking
telegram
facebook
instagram
linkedin
```

Important:

* Use `diagnostic` for diagnostics contact channels.
* Do not use private staff phone numbers unless approved for public listing.
* Use `is_public = true` only for contact details approved for public display.

---

## Verification Notes Template Fields

Include:

```text
provider_category
provider_slug
review_status
verification_status
reviewed_by
review_date
verification_method
verification_note
issue_flag
next_review_date
```

Recommended `verification_status` values:

```text
verified
unverified
pending
disputed
```

Recommended `review_status` values:

```text
not_started
in_review
approved
needs_correction
rejected
```

---

## Source Tracking Template Fields

Include:

```text
provider_category
provider_slug
source_type
source_name
source_url
source_date
collected_by
reviewed_by
review_status
review_note
```

Recommended `source_type` values:

```text
provider_submitted
phone_verified
official_website
social_media
public_directory
field_visit
internal_staff_confirmation
unknown
```

---

## Import QA Checklist

Create a checklist section that verifies:

```text
No duplicate slugs
All required display names are present
All provider categories are valid
All listing_status values are valid
All visibility_status values are valid
All public contact details are approved
No private staff contact details are included
All active/public rows have minimum location information
All verified rows have last_confirmed_at
Diagnostics provider types match approved values
Contact channel provider_category matches provider rows
Rows marked hidden/internal will not appear publicly
```

---

## Allowed Values Reference

The template should clearly list allowed values.

Provider category:

```text
facility
doctor
pharmacy
diagnostic
```

Listing status:

```text
active
pending
inactive
archived
```

Visibility status:

```text
public
hidden
internal
```

Verification status:

```text
verified
unverified
pending
disputed
```

Boolean values:

```text
true
false
unknown
```

---

## Slug Rules

Include slug guidance:

* lowercase only
* hyphen-separated
* no spaces
* no special characters except hyphen
* stable
* unique within provider category
* avoid internal notes or sensitive information

Examples:

```text
st-paul-general-hospital
bole-alpha-pharmacy
addis-diagnostic-imaging-center
```

---

## Do Not Delete Or Import Yet

The template must clearly state:

```text
Do not delete diagnostics test rows yet.
Do not delete fallback data yet.
Do not remove QA fixtures yet.
Do not insert real data until the intake template is reviewed and approved.
```

---

## Recommended Next Task

The recommended next task should be:

```text
Task 178 — Real Provider Data Intake Template QA
```

Purpose:

* Verify the template is complete.
* Confirm the project owner can use it to prepare real provider data.
* Decide whether to produce Excel/CSV files next.
* Prepare for real data collection/import planning.

---

## Scope

Allowed:

* Create `docs/data-intake/RealProviderDataIntakeTemplate.md`.
* Create the folder `docs/data-intake/` if it does not exist.
* Update `docs/CodexTask-177-RealProviderDataIntakeTemplateCreation.md` with task completion details.
* Create CSV-ready examples only if simple and clearly template-only.
* Do not include real provider data.

Not allowed:

* Do not modify source code.
* Do not modify UI copy.
* Do not delete test data.
* Do not insert real data.
* Do not modify SQL, RLS, schema, or migrations.
* Do not modify static data.
* Do not change routes.
* Do not modify probes.
* Do not modify package scripts.
* Do not create Task 178.

---

## Validation

No code validation is required.

Recommended check:

```bash
git status
```

No lint/build is required unless Codex modifies source code, which it must not do.

---

## Acceptance Criteria

* Real provider data intake template exists.
* Template contains Facilities section.
* Template contains Doctors section.
* Template contains Pharmacies section.
* Template contains Diagnostics section.
* Template contains Contact Channels section.
* Template contains Verification Notes section.
* Template contains Source Tracking section.
* Template contains Import QA Checklist section.
* Allowed values are clearly documented.
* Slug rules are documented.
* Do-not-delete/import warning is included.
* No real provider data is inserted.
* No source code is modified.
* No SQL/RLS/migration/schema files are modified.
* Task 178 is not created.

---

## Deliverable

A spreadsheet-ready real provider data intake template.

Do not proceed beyond Task 177.
