# Codex Task 179: Real Provider Data Spreadsheet Export Planning

## Project

DigitalDirectory-v2

## Goal

Create a planning record for exporting the real provider data intake template into spreadsheet-ready files in a later task.

This task follows:

- `docs/CodexTask-176-RealProviderDataIntakeFormatAndReplacementPlanning.md`
- `docs/CodexTask-177-RealProviderDataIntakeTemplateCreation.md`
- `docs/CodexTask-178-RealProviderDataIntakeTemplateQA.md`
- `docs/data-intake/RealProviderDataIntakeTemplate.md`

This is a planning-only task. No Excel files, CSV files, source code, UI copy, test data, real data, SQL, RLS, schema, migrations, static data, routes, probes, or package scripts were created or modified for this task.

---

## Planning Status

```text
Spreadsheet export planning complete.
```

This document defines the future workbook/export structure only. It does not create the workbook, create CSV files, import data, delete data, or authorize real data insertion.

---

## Recommended Workbook

Recommended workbook name:

```text
TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx
```

Recommended export folder for the future export task:

```text
docs/data-intake/exports/
```

Recommended CSV export folder for optional companion files:

```text
docs/data-intake/exports/csv/
```

Do not create these files or folders in Task 179 unless they already exist. Task 179 records the plan only.

---

## Workbook Structure

Recommended workbook sheets:

| Order | Sheet name | Purpose |
| --- | --- | --- |
| 01 | `01_Facilities` | Facility provider rows. |
| 02 | `02_Doctors` | Doctor provider rows. |
| 03 | `03_Pharmacies` | Pharmacy provider rows. |
| 04 | `04_Diagnostics` | Diagnostics provider rows. |
| 05 | `05_Contact_Channels` | One row per provider contact method. |
| 06 | `06_Verification_Notes` | Verification/review history and issue notes. |
| 07 | `07_Source_Tracking` | Source provenance for provider/contact data. |
| 08 | `08_Import_QA_Checklist` | QA checks before import/export approval. |
| 09 | `09_Allowed_Values` | Controlled values reference for validation. |
| 10 | `10_Instructions` | Plain-language data entry instructions. |

---

## Column Order

### `01_Facilities`

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

Default `provider_category`:

```text
facility
```

### `02_Doctors`

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

Default `provider_category`:

```text
doctor
```

### `03_Pharmacies`

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

Default `provider_category`:

```text
pharmacy
```

### `04_Diagnostics`

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

Default `provider_category`:

```text
diagnostics
```

Approved `diagnostic_provider_type` values:

```text
laboratory
imaging_center
radiology_center
pathology_service
mixed_diagnostic_center
facility_diagnostic_department
home_sample_collection_provider
```

### `05_Contact_Channels`

```text
provider_category
contact_provider_type
provider_slug
channel_type
label
value_public
url_public
is_primary
display_order
listing_status
visibility_status
verification_status
last_confirmed_at
source_note
internal_review_note
```

Use `provider_category = diagnostics` and `contact_provider_type = diagnostic` for diagnostics contact channels.

### `06_Verification_Notes`

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

### `07_Source_Tracking`

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

### `08_Import_QA_Checklist`

```text
check_name
required
result
reviewer
review_date
notes
```

Recommended checklist rows:

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
Contact channel provider_slug matches an existing provider slug
Rows marked hidden/internal will not appear publicly
Rows marked pending are not imported as public active listings
Source tracking exists for each row
Public fields contain no internal notes
```

---

## Allowed Values Sheet

Sheet `09_Allowed_Values` should list controlled values in a simple reference format.

Recommended columns:

```text
value_group
allowed_value
description
notes
```

Recommended value groups:

| Value group | Allowed values |
| --- | --- |
| `provider_category` | `facility`, `doctor`, `pharmacy`, `diagnostics` |
| `contact_provider_type` | `facility`, `doctor`, `pharmacy`, `diagnostic` |
| `listing_status` | `draft`, `pending`, `active`, `rejected`, `archived`, `suspended` |
| `visibility_status` | `public`, `hidden`, `internal` |
| `verification_status` | `unverified`, `pending`, `verified`, `disputed`, `expired` |
| `boolean_or_unknown` | `true`, `false`, `unknown` |
| `review_status` | `not_started`, `needs_review`, `in_review`, `approved`, `needs_correction`, `needs_followup`, `rejected` |
| `facility_type` | `general_hospital`, `specialty_hospital`, `specialty_center`, `clinic`, `medical_center`, `dental_clinic`, `eye_center`, `aesthetic_center`, `rehabilitation_center`, `home_care_provider`, `ambulance_provider` |
| `pharmacy_type` | `retail_pharmacy`, `hospital_pharmacy`, `specialty_pharmacy`, `compounding_pharmacy`, `online_pharmacy` |
| `diagnostic_provider_type` | `laboratory`, `imaging_center`, `radiology_center`, `pathology_service`, `mixed_diagnostic_center`, `facility_diagnostic_department`, `home_sample_collection_provider` |
| `channel_type` | `phone`, `whatsapp`, `telegram`, `website`, `email`, `maps`, `appointment`, `habaridoc`, `emergency`, `social` |
| `source_type` | `provider_submitted`, `phone_verified`, `official_website`, `social_media`, `public_directory`, `field_visit`, `internal_staff_confirmation`, `government_or_regulator`, `partner_submission`, `unknown` |

---

## Instructions Sheet

Sheet `10_Instructions` should include plain-language guidance for project-owner data entry.

Recommended instruction topics:

1. Fill one row per provider in the relevant provider sheet.
2. Use one row per public contact method in `05_Contact_Channels`.
3. Use `diagnostics` for diagnostics provider rows.
4. Use `diagnostic` only for diagnostics contact-channel provider type.
5. Do not include private contact details unless approved for public display.
6. Use `active` and `public` only when a row is ready for public display.
7. Use `pending`, `hidden`, or `internal` for rows still under review.
8. Use stable slugs that follow the slug rules.
9. Use semicolons for multi-value fields.
10. Use `unknown` instead of guessing.
11. Do not delete QA/test rows until real data is reviewed and import-ready.
12. Do not import data until the spreadsheet passes QA.

Slug reminder for instructions:

```text
lowercase only; hyphen-separated; no spaces; no underscores; no special characters except hyphen; unique within provider category
```

---

## CSV Export Option

Excel should be the primary project-owner entry format, but CSV companion files may be useful for future import workflows.

Recommended future CSV files:

```text
facilities.csv
doctors.csv
pharmacies.csv
diagnostics.csv
contact_channels.csv
verification_notes.csv
source_tracking.csv
import_qa_checklist.csv
allowed_values.csv
instructions.csv
```

CSV export guidance:

- Use UTF-8.
- Keep column order identical to the workbook sheets.
- Do not include real provider data in template CSV files.
- Keep empty template rows or field-header-only CSVs unless owner approval requests examples.
- Do not use CSV export as an import approval by itself.

---

## File Naming Convention

Recommended workbook names:

```text
TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx
TiruMedicalDirectory_RealProviderDataIntake_Template_v1.xlsx
TiruMedicalDirectory_RealProviderDataIntake_Filled_YYYY-MM-DD.xlsx
```

Recommended CSV archive folder name:

```text
TiruMedicalDirectory_RealProviderDataIntake_CSV_Template_v1/
```

Recommended CSV file naming:

```text
01_facilities.csv
02_doctors.csv
03_pharmacies.csv
04_diagnostics.csv
05_contact_channels.csv
06_verification_notes.csv
07_source_tracking.csv
08_import_qa_checklist.csv
09_allowed_values.csv
10_instructions.csv
```

Versioning guidance:

- Use `_Template_v1` for blank templates.
- Use `_Filled_YYYY-MM-DD` only for owner-supplied real data files.
- Never commit filled real-provider spreadsheets unless project ownership and privacy approval explicitly allow it.

---

## Data Entry Safety Notes

```text
Do not insert real data yet.
Do not create Excel files in Task 179.
Do not create CSV files in Task 179.
Do not delete diagnostics test rows yet.
Do not delete fallback data yet.
Do not remove QA fixtures yet.
Do not import spreadsheet data until the template is QA-reviewed.
Do not mark rows active/public until verification and owner approval are complete.
```

Private-data warning:

- Do not enter private staff phone numbers unless approved for public listing.
- Do not enter private addresses, credentials, documents, passwords, API keys, tokens, or internal-only comments in public fields.
- Keep internal notes in `internal_review_note`, `verification_note`, or `review_note`.

---

## Recommended Next Task

Recommended next task:

```text
Task 180 — Real Provider Data Spreadsheet Template Export
```

Purpose:

- Create the actual Excel workbook.
- Optionally create CSV-ready companion files.
- Keep all files template-only.
- Do not include real provider data.

Task 180 was not created as part of this task.

---

## Scope Confirmation

For Task 179:

- No Excel files were created.
- No CSV files were created.
- No source code was modified.
- No UI copy was modified.
- No test data was deleted.
- No real data was inserted.
- No SQL was modified.
- No RLS was modified.
- No schema was modified.
- No migrations were modified.
- No static data was modified.
- No routes were changed.
- No probes were modified.
- No package scripts were modified.
- Task 180 was not created.

---

## Planning Summary

The recommended export is a single Excel workbook named `TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx` under `docs/data-intake/exports/`, with ten sheets covering provider rows, contact channels, verification, source tracking, QA checks, allowed values, and instructions. CSV companion files can be planned for future import workflows, but no spreadsheet files should be created until Task 180.
