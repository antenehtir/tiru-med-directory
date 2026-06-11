# Codex Task 182: Real Provider Data Filling Guidance

## Project

DigitalDirectory-v2

## Goal

Create guidance for how the project owner should fill the real provider data intake spreadsheet before any real data import or replacement work begins.

This task follows:

* CodexTask-176-RealProviderDataIntakeFormatAndReplacementPlanning.md
* CodexTask-177-RealProviderDataIntakeTemplateCreation.md
* CodexTask-178-RealProviderDataIntakeTemplateQA.md
* CodexTask-179-RealProviderDataSpreadsheetExportPlanning.md
* CodexTask-180-RealProviderDataSpreadsheetTemplateExport.md
* CodexTask-181-RealProviderDataSpreadsheetTemplateQA.md

This is a documentation-only guidance task.

Do not insert, delete, import, or modify real provider data in this task.

---

## Important Context

The Excel provider intake template now exists at:

```text
docs/data-intake/exports/TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx
```

Task 181 verified the workbook and marked QA status as:

```text
Passed
```

The next step is to guide the project owner on how to fill the spreadsheet safely.

---

## Main Objective

Create a guidance document explaining:

1. Which provider categories to fill first.
2. How many providers to include in the first test batch.
3. Which fields are required before import.
4. Which fields can be optional.
5. How to fill contact channels safely.
6. How to handle verification and source tracking.
7. How to avoid private or unsafe data.
8. How to prepare the spreadsheet for later QA/import planning.

Recommended target file:

```text
docs/CodexTask-182-RealProviderDataFillingGuidance.md
```

---

## Recommended First Data Batch

The first real-data batch should be small and controlled.

Recommended first batch:

```text
5 facilities
5 doctors
5 pharmacies
5 diagnostics providers
```

or, if the project owner wants to move faster:

```text
10 providers total across mixed categories
```

Reason:

* Easier to review.
* Easier to catch schema/format issues.
* Safer than importing many rows at once.
* Allows listing, detail, contact, and search behavior to be tested before scaling.

---

## Recommended Category Priority

Recommended filling order:

### Priority 1: Facilities

Start with well-known private facilities in Addis Ababa.

Reason:

* Facilities are the core of the directory.
* Doctors, pharmacies, and diagnostics can later connect to facilities.
* Facility records help establish location and service trust.

### Priority 2: Pharmacies

Pharmacy module is MVP-stable.

Reason:

* Listing, detail, and contact channels already work.
* Good category for first real import testing.

### Priority 3: Diagnostics

Diagnostics module is MVP-stable.

Reason:

* Listing, detail, and contact channels already work.
* Test rows exist and can be replaced later after real data QA.

### Priority 4: Doctors

Doctors are important, but require more careful verification.

Reason:

* Specialty, schedule, affiliation, and public contact details need careful review.
* Avoid private personal data.

---

## Minimum Required Fields Before Review

For each provider row, the project owner should fill at minimum:

```text
provider_category
display_name
slug
city
area
short_description
services
verification_status
last_confirmed_at
listing_status
visibility_status
source_note
```

For public rows, use only:

```text
listing_status = active
visibility_status = public
```

when the provider is ready for public display.

If not ready, use:

```text
listing_status = pending
visibility_status = hidden
```

---

## Contact Channel Guidance

Use the `05_Contact_Channels` sheet.

Each contact method should be one row.

Example:

```text
One provider with two phone numbers and one website = three contact channel rows
```

Required contact fields:

```text
provider_category
provider_slug
channel_type
label
value
is_public
verification_status
last_confirmed_at
source_note
```

Use `is_public = true` only if the contact detail is approved for public display.

Do not include:

```text
private staff phone numbers
personal doctor phone numbers unless approved
internal hospital extensions not intended for public use
private emails
unverified WhatsApp numbers
```

---

## Slug Guidance

Every provider needs a stable slug.

Rules:

```text
lowercase only
use hyphens
no spaces
no special characters except hyphen
unique within provider category
do not include private/internal notes
```

Examples:

```text
kadisco-general-hospital
bole-community-pharmacy
addis-diagnostic-imaging-center
dr-example-cardiology
```

If unsure, leave a note in `internal_review_note`.

---

## Verification Guidance

Use verification statuses carefully:

```text
verified = confirmed directly or from reliable official source
unverified = collected but not confirmed
pending = waiting for review
disputed = conflicting information exists
```

Do not mark a provider as `verified` unless the information has been checked.

Recommended first-batch status:

```text
verification_status = pending
listing_status = pending
visibility_status = hidden
```

until reviewed.

---

## Source Tracking Guidance

Use the `07_Source_Tracking` sheet.

Every provider should have at least one source row.

Recommended source types:

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

If the source is uncertain, use:

```text
source_type = unknown
review_status = needs_correction
```

---

## Import QA Guidance

Before import, the spreadsheet should pass these checks:

```text
No duplicate slugs
All display names are present
All provider categories are valid
All listing_status values are valid
All visibility_status values are valid
No private contact details are included
All public contact details are approved
All active/public rows have minimum location information
All verified rows have last_confirmed_at
Contact provider_slug values match provider rows
Rows marked hidden/internal will not appear publicly
```

---

## What Not To Do Yet

The guidance must clearly state:

```text
Do not import real data yet.
Do not delete diagnostics test rows yet.
Do not delete fallback data yet.
Do not remove QA fixtures yet.
Do not bulk-fill hundreds of rows before the first QA batch.
Do not include private contact details.
Do not mark unverified rows as public active listings.
```

---

## Recommended Next Task

The recommended next task should be:

```text
Task 183 — Real Provider Data First Batch Preparation
```

Purpose:

* Prepare the first small real provider batch.
* Use the approved Excel template.
* Keep the batch small enough for careful review.
* Do not import yet.

---

## Scope

Allowed:

* Create/update `docs/CodexTask-182-RealProviderDataFillingGuidance.md`.
* Document how the project owner should fill the Excel template.
* Recommend first-batch size and category priority.
* Document safety rules.
* Recommend next task.

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
* Do not create Task 183.

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

* Real provider data filling guidance document exists.
* Recommended first-batch size is documented.
* Category priority is documented.
* Required minimum fields are documented.
* Contact channel guidance is documented.
* Slug guidance is documented.
* Verification guidance is documented.
* Source tracking guidance is documented.
* Import QA guidance is documented.
* What-not-to-do-yet warning is included.
* Recommended next task is identified.
* No source code is modified.
* No SQL/RLS/migration/schema files are modified.
* No real provider data is inserted.
* Task 183 is not created.

---

## Deliverable

A focused guidance document for filling the real provider data spreadsheet safely.

Do not proceed beyond Task 182.
