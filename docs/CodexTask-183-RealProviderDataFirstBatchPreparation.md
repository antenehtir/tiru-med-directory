# Codex Task 183: Real Provider Data First Batch Preparation

## Project

DigitalDirectory-v2

## Goal

Create a first-batch preparation guide for the first small real provider data batch using the approved Excel intake template.

This task follows:

- `docs/CodexTask-176-RealProviderDataIntakeFormatAndReplacementPlanning.md`
- `docs/CodexTask-177-RealProviderDataIntakeTemplateCreation.md`
- `docs/CodexTask-180-RealProviderDataSpreadsheetTemplateExport.md`
- `docs/CodexTask-181-RealProviderDataSpreadsheetTemplateQA.md`
- `docs/CodexTask-182-RealProviderDataFillingGuidance.md`
- `docs/data-intake/exports/TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx`

This is a documentation-only first-batch preparation task. No real provider data was inserted, imported, deleted, or modified.

---

## Guidance Status

```text
Real provider data first-batch preparation guide complete.
```

This guide explains how the project owner should prepare the first small batch for later QA. It does not authorize import, replacement, deletion, SQL changes, static-data changes, or source-code changes.

---

## First Batch Size

Recommended first batch:

```text
10 providers total
```

Reason:

- Small enough for careful manual review.
- Large enough to exercise all four provider categories.
- Large enough to test provider rows, contact channels, source tracking, verification notes, and import QA.
- Safer than bulk-filling many rows before the first QA checklist pass.

---

## Category Mix

Use this category mix:

| Category | Sheet | Count | Purpose |
| --- | --- | ---: | --- |
| Facilities | `01_Facilities` | 4 | Test core directory listing/detail fields and location/service basics. |
| Pharmacies | `03_Pharmacies` | 2 | Test pharmacy-specific fields and public contact channel handling. |
| Diagnostics | `04_Diagnostics` | 2 | Test diagnostics provider type, services, and verification-sensitive claims. |
| Doctors | `02_Doctors` | 2 | Test doctor specialty, affiliation, privacy, and schedule-review handling. |

Total:

```text
4 facilities + 2 pharmacies + 2 diagnostics providers + 2 doctors = 10 providers
```

Do not add new provider categories in the first batch.

---

## Where To Fill The Data

Use the approved workbook template:

```text
docs/data-intake/exports/TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx
```

Recommended project-owner workflow for a future data-entry task:

1. Make a copy of the approved template outside this documentation task.
2. Name the copy clearly as a draft, for example:

```text
TiruMedicalDirectory_RealProviderDataIntake_FirstBatch_DRAFT.xlsx
```

3. Fill the copied workbook, not the original template.
4. Keep the filled workbook private until review rules are agreed.
5. Do not commit the filled real-data workbook unless the project owner explicitly approves.
6. Do not import spreadsheet data yet.

Task 183 does not create, fill, import, or commit a real-data spreadsheet.

---

## Minimum Required Provider Fields

Every first-batch provider row should include these minimum fields before QA review:

| Field | Requirement | Notes |
| --- | --- | --- |
| `provider_category` | Required | Must match the sheet/category. |
| `display_name` | Required | Public-safe provider name only. |
| `slug` | Required | Stable, lowercase, hyphen-separated slug. |
| `city` | Required | Public-safe city. |
| `area` | Recommended | Public-safe neighborhood/area. |
| `short_description` | Recommended | Public-safe summary; avoid unverified claims. |
| Category-specific type field | Required where present | Examples: `facility_type`, `pharmacy_type`, `diagnostic_provider_type`. |
| Services field | Recommended | Use `services` or `services_public`, depending on the sheet. |
| `verification_status` | Required | Use `pending` by default for first-batch rows. |
| `last_confirmed_at` | Required before verified | Use `YYYY-MM-DD`; leave unresolved rows pending. |
| `listing_status` | Required | Use `pending` by default. |
| `visibility_status` | Required | Use `hidden` by default. |
| `source_note` | Recommended | Brief internal source context. |
| `internal_review_note` | Recommended when uncertain | Internal only; do not publish. |

Recommended default status values for first-batch rows:

```text
verification_status = pending
listing_status = pending
visibility_status = hidden
```

Use public-ready values only after review and owner approval:

```text
verification_status = verified
listing_status = active
visibility_status = public
```

---

## Category-Specific Minimums

### Facilities

Fill `01_Facilities`.

Minimum first-batch fields:

```text
provider_category
display_name
slug
facility_type
city
area
short_description
services
verification_status
listing_status
visibility_status
source_note
```

Use `unknown` for unverified availability claims, such as emergency, inpatient, outpatient, diagnostics, pharmacy, walk-in, and home-service fields.

### Pharmacies

Fill `03_Pharmacies`.

Minimum first-batch fields:

```text
provider_category
display_name
slug
pharmacy_type
city
area
short_description
services
verification_status
listing_status
visibility_status
source_note
```

Use `unknown` for delivery, pickup, walk-in, and home-service fields unless confirmed.

### Diagnostics

Fill `04_Diagnostics`.

Minimum first-batch fields:

```text
provider_category
display_name
slug
diagnostic_provider_type
category
city
area
short_description
services_public
verification_status
listing_status
visibility_status
source_note
```

Do not publish pricing, test availability, result turnaround, booking, upload, or home sample collection claims unless verified and maintainable.

### Doctors

Fill `02_Doctors`.

Minimum first-batch fields:

```text
provider_category
display_name
slug
doctor_name
specialty
city
area
verification_status
listing_status
visibility_status
source_note
```

Do not include private personal phone numbers, home addresses, private documents, credentials, or schedule claims unless approved for public display.

---

## Contact Channel Guidance

Fill `05_Contact_Channels` after provider rows are drafted.

Use one row per contact method.

Template-only pattern:

```text
One provider with one public phone number and one website should have two contact-channel rows.
```

Minimum contact-channel fields:

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
internal_review_note
```

Contact-channel rules:

- `provider_slug` must exactly match a provider row slug.
- `provider_category` must match the provider row category.
- Use `is_public = false` until public display is approved.
- Use `verification_status = pending` until the contact method is confirmed.
- Use `last_confirmed_at` only when the contact method has a confirmation date.
- Keep private or staff-only contact details out of public fields.
- Do not include unverified WhatsApp numbers, private emails, internal extensions, payment links, upload links, or booking links unless explicitly approved.
- Use `internal_review_note` for uncertainty.

Diagnostics contact rows should follow the workbook's diagnostics contact guidance.

---

## Slug Guidance

Each provider row needs one stable slug.

Slug rules:

```text
lowercase only
hyphen-separated
ASCII letters and numbers only, plus hyphen
no spaces
no underscores
no special characters except hyphen
no leading or trailing hyphen
no consecutive hyphens
unique within provider category
stable after publication
```

Template-only slug patterns:

```text
example-general-hospital
example-community-pharmacy
example-diagnostic-center
dr-example-name
```

Do not include:

```text
verification status
listing status
private notes
internal review comments
temporary labels
```

If two rows would share the same slug, add a stable public-safe area or category suffix.

---

## Verification Guidance

Use verification status conservatively.

| Status | First-batch use |
| --- | --- |
| `pending` | Default for first-batch rows awaiting review. |
| `unverified` | Use when collected but not confirmed. |
| `verified` | Use only after approved confirmation and date support. |
| `disputed` | Use when sources conflict. |
| `expired` | Use when previously confirmed information is stale. |

Before marking a row `verified`, confirm:

- public name is correct
- provider category is correct
- public location is safe to display
- public contact details are approved
- service and availability claims are verified
- `last_confirmed_at` uses `YYYY-MM-DD`
- source tracking exists

Use `06_Verification_Notes` for review notes, unresolved questions, issue flags, and future review dates.

---

## Source Tracking Guidance

Fill `07_Source_Tracking` for every first-batch provider row before QA.

Minimum source-tracking fields:

```text
provider_category
provider_slug
source_type
source_name
source_date
review_status
review_note
```

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

Source-tracking rules:

- Add at least one source row per provider.
- Use more than one source row when multiple sources matter.
- Use `source_url` only for public web sources.
- Use `source_date` in `YYYY-MM-DD` format.
- Use `unknown` rather than guessing.
- Keep reviewer names, collector notes, and uncertainty in internal fields only.
- Source tracking does not equal import approval.

---

## First Batch QA Checklist

Use `08_Import_QA_Checklist` to prepare the first batch for the future QA task.

The first batch should not move forward until these checks are ready to review:

| QA check | Required |
| --- | --- |
| No duplicate slugs | Yes |
| All required display names are present | Yes |
| All provider categories are valid | Yes |
| All category-specific type fields are valid | Yes |
| All `listing_status` values are valid | Yes |
| All `visibility_status` values are valid | Yes |
| All `verification_status` values are valid | Yes |
| No private contact details are included | Yes |
| All public contact details are approved | Yes |
| Active/public rows have minimum location information | Yes |
| Verified rows have `last_confirmed_at` | Yes |
| Diagnostics provider types match approved values | Yes |
| Contact-channel `provider_slug` values match provider rows | Yes |
| Contact-channel categories match provider rows | Yes |
| Hidden/internal rows will not appear publicly | Yes |
| Pending rows are not imported as public active listings | Yes |
| Source tracking exists for every provider row | Yes |
| Public fields contain no internal review notes | Yes |

Recommended preparation sequence:

1. Fill the 10 provider rows in the copied workbook.
2. Fill contact-channel rows.
3. Fill verification notes for unresolved issues.
4. Fill source-tracking rows.
5. Review controlled values against `09_Allowed_Values`.
6. Mark import QA checklist items as ready for review.
7. Keep all rows out of public-ready status until QA passes.

---

## What Not To Do Yet

Do not do any of the following in Task 183:

```text
Do not insert real provider data.
Do not import spreadsheet data.
Do not modify the original workbook template.
Do not commit a filled real-data spreadsheet unless explicitly approved.
Do not delete diagnostics test rows yet.
Do not delete fallback data yet.
Do not remove QA fixtures yet.
Do not bulk-fill hundreds of rows before first-batch QA.
Do not include private contact details.
Do not mark unverified rows as active/public.
Do not modify SQL, RLS, schema, or migrations.
Do not modify static data.
Do not change routes, probes, or package scripts.
```

The first batch should remain a preparation plan until a future QA task confirms it is ready for review.

---

## Recommended Next Task

Recommended next task:

```text
Task 184 - Real Provider Data First Batch QA Checklist
```

Purpose:

- Review the first filled batch before import.
- Check required fields, slugs, contact channels, visibility, verification, and source tracking.
- Decide whether the first batch is ready for a future import-planning task.
- Continue avoiding import until QA passes and owner approval is explicit.

Task 184 was not created as part of this task.

---

## Scope Confirmation

For Task 183:

- Only `docs/CodexTask-183-RealProviderDataFirstBatchPreparation.md` was updated.
- No source code was modified.
- No UI copy was modified.
- No test data was deleted.
- No real provider data was inserted.
- No spreadsheet data was imported.
- No SQL was modified.
- No RLS was modified.
- No schema was modified.
- No migrations were modified.
- No static data was modified.
- No routes were changed.
- No probes were modified.
- No package scripts were modified.
- Task 184 was not created.

---

## Preparation Summary

Task 183 defines a 10-provider first batch with 4 facilities, 2 pharmacies, 2 diagnostics providers, and 2 doctors. The project owner should prepare the batch in a copied workbook, keep rows pending/hidden until review, complete contact channels, verification notes, source tracking, and import QA preparation, and avoid any import or deletion work until a future QA task passes.
