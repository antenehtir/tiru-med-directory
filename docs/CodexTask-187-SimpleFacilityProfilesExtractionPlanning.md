# Codex Task 187: Simple Facility Profiles Extraction Planning

## Project

DigitalDirectory-v2

## Goal

Plan how to extract the uploaded Tiru MedDirectory facility profiles Word document into a simple MVP-ready structured format.

This is a documentation-only extraction planning task. No source code, UI copy, test data, real provider data, spreadsheet data, SQL, RLS, schema, migrations, static data, routes, probes, package scripts, extraction outputs, or Task 188 file were created or modified.

---

## Planning Status

```text
Planning complete.
```

This task defines the future extraction approach only. It does not include or insert real provider data.

---

## Source Document

The source document for future extraction is the uploaded structured Word document:

```text
Tiru_MedDirectory_Facility_Profiles(1).docx
```

Owner-provided source context:

- The document contains `99` total facility/provider profiles in Addis Ababa.
- It includes these categories:
  - General Hospital
  - Specialty Center
  - Diagnostic Center
  - Ambulance Service
  - Home Care
  - Telemedicine
  - Pharmacy
  - Medical Plaza
  - Healthcare Financing
- It contains practical public fields:
  - facility name
  - category
  - specialty/services
  - special services
  - sub-city
  - area
  - address
  - phone
  - hours
  - email
  - website
  - Telegram
  - WhatsApp
  - booking
  - Facebook
  - Instagram
  - TikTok
  - LinkedIn
  - Google Maps

The document is the MVP source data reference identified in Task 186.

---

## Recommended Output Format

Recommended extraction format:

```text
JSON first
```

Reason:

- JSON can preserve optional and missing fields without awkward blank spreadsheet columns.
- JSON can preserve multiple values for phone numbers, social links, and URLs as arrays if needed.
- JSON can preserve raw extracted text alongside normalized fields for QA.
- JSON is easier to validate before any import planning.
- CSV can be generated later from reviewed JSON if a spreadsheet-style review is needed.

CSV remains useful later for manual review or spreadsheet sharing, but should not be the first extraction target.

---

## Future Output Paths

Do not create these files in Task 187. These are planned future paths only.

Recommended source placement path for Task 188:

```text
docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx
```

Recommended JSON-first output path:

```text
docs/data-intake/simple-facility-profiles/tiru-med-directory-facility-profiles.simple.json
```

Recommended QA summary output path:

```text
docs/data-intake/simple-facility-profiles/tiru-med-directory-facility-profiles.qa-summary.md
```

Optional CSV output path after JSON QA:

```text
docs/data-intake/simple-facility-profiles/TiruMedDirectoryFacilityProfiles_Simple.csv
```

Optional later app seed path only after extraction QA and product approval:

```text
src/data/real-facility-profiles.ts
```

---

## Simplified Extraction Fields

Future extraction should target this simplified MVP field set:

```text
record_number
name
category
specialty_or_services
special_services
sub_city
area
address
phone
hours
email
website
telegram
whatsapp
booking
facebook
instagram
tiktok
linkedin
google_maps
raw_text
extraction_notes
```

Field guidance:

- `record_number` should preserve the profile order from the source document.
- `raw_text` should preserve the original profile text for QA comparison.
- `extraction_notes` should be used only for extraction uncertainty, not public display.
- Contact/link fields should remain blank, `null`, or empty arrays when missing. Do not invent values.

---

## Document Label Mapping

Map uploaded document labels into simplified extraction fields as follows:

| Document label or source pattern | Simplified field |
| --- | --- |
| Numbered facility/profile heading | `record_number` and `name` |
| Facility name / provider name | `name` |
| Category / facility category | `category` |
| Specialty / Services | `specialty_or_services` |
| Specialty/Services | `specialty_or_services` |
| Services | `specialty_or_services` |
| Special Services | `special_services` |
| Sub-City | `sub_city` |
| Sub City | `sub_city` |
| Sub-city | `sub_city` |
| Area | `area` |
| Address | `address` |
| Phone | `phone` |
| Phone number | `phone` |
| Hours | `hours` |
| Opening Hours | `hours` |
| Email | `email` |
| Website | `website` |
| Telegram | `telegram` |
| WhatsApp | `whatsapp` |
| Whatsapp | `whatsapp` |
| Booking | `booking` |
| Facebook | `facebook` |
| Instagram | `instagram` |
| TikTok | `tiktok` |
| Tiktok | `tiktok` |
| LinkedIn | `linkedin` |
| Linkedin | `linkedin` |
| Google Maps | `google_maps` |
| Maps / Map link | `google_maps` |
| Unmapped profile body text | `raw_text` |
| Extraction ambiguity or missing expected label | `extraction_notes` |

---

## Recommended JSON Shape

Future JSON should use a simple top-level structure:

```json
{
  "sourceDocument": "Tiru_MedDirectory_Facility_Profiles(1).docx",
  "expectedRecordCount": 99,
  "records": []
}
```

Each future record should use the simplified fields:

```json
{
  "record_number": null,
  "name": "",
  "category": "",
  "specialty_or_services": [],
  "special_services": [],
  "sub_city": "",
  "area": "",
  "address": "",
  "phone": [],
  "hours": "",
  "email": [],
  "website": [],
  "telegram": [],
  "whatsapp": [],
  "booking": [],
  "facebook": [],
  "instagram": [],
  "tiktok": [],
  "linkedin": [],
  "google_maps": [],
  "raw_text": "",
  "extraction_notes": []
}
```

This JSON example is a schema-style placeholder only. It does not contain real provider data.

---

## Staged Extraction Strategy

### Stage 1: Source Setup

Place or reference the uploaded Word document in a stable project-accessible location.

Planned path:

```text
docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx
```

Do not edit the source document during setup.

### Stage 2: Raw Profile Segmentation

Split the document into `99` raw profile blocks.

Each raw block should preserve:

```text
record_number
raw heading
raw category text
raw labeled fields
raw body text
source section/page context if available
```

### Stage 3: Label-Based Field Extraction

Extract labeled values using the mapping table in this plan.

Do not normalize aggressively in this stage. Preserve original values as much as possible.

### Stage 4: Normalize To Simplified JSON

Normalize each raw block into the simplified JSON record shape.

Rules:

- Preserve missing values as blank, `null`, or empty arrays.
- Preserve multiple phone/link/contact values as arrays.
- Preserve raw text for QA.
- Preserve extraction uncertainty in `extraction_notes`.
- Do not generate public statuses in this stage.
- Do not create SQL-ready records in this stage.

### Stage 5: Generate Draft QA Summary

Create a future QA summary that reports:

```text
record count
category counts
missing name count
missing category count
missing location fields
missing contact fields
unmapped labels
duplicate names
possible duplicate phone numbers
records with extraction_notes
```

### Stage 6: Product Decision Before Import Planning

After extraction QA, decide whether the extracted 99 profiles are:

```text
active / public / unverified
```

or:

```text
pending / hidden / pending
```

No import planning should proceed until this decision is recorded.

---

## Generated Defaults For Later

Do not generate or apply these defaults in Task 187. They are for future extraction QA, import planning, or import execution.

| Generated field | Later rule |
| --- | --- |
| `slug` | Generate from `name`; resolve duplicates using area/category suffixes. |
| `provider_type` | Derive from `category` using an approved category mapping. |
| `listing_status` | Use product decision: `active` or `pending`. |
| `visibility_status` | Use product decision: `public` or `hidden`. |
| `verification_status` | Use product decision: `unverified` or `pending`. |
| `last_confirmed_at` | Use extraction QA date or later review date only after approval. |
| `source_note` | `Imported from Tiru MedDirectory Facility Profiles document`. |
| `source_document_name` | `Tiru_MedDirectory_Facility_Profiles(1).docx`. |
| `source_record_number` | Copy from `record_number`. |
| `import_batch` | Assign a future batch id during import planning. |
| `contact_channel_rows` | Generate later from phone/email/website/social/map fields if normalized contact rows are needed. |

---

## QA Checks

Future extraction QA should include these checks.

### Count Checks

- Confirm exactly `99` extracted records.
- Confirm every extracted record has a `record_number`.
- Confirm record numbers are unique.
- Confirm record numbers are sequential or explain any gaps.

### Required Field Checks

- Confirm every record has `name`.
- Confirm every record has `category`.
- Confirm every record has at least one location clue among `sub_city`, `area`, or `address`.
- Confirm every record has `raw_text`.

### Category Checks

- Confirm categories map to the expected category set:
  - General Hospital
  - Specialty Center
  - Diagnostic Center
  - Ambulance Service
  - Home Care
  - Telemedicine
  - Pharmacy
  - Medical Plaza
  - Healthcare Financing
- Flag unknown or misspelled categories.
- Produce category counts for owner review.

### Contact And Link Checks

- Confirm phone values are preserved exactly enough for review.
- Confirm email values remain in `email`.
- Confirm website values remain in `website`.
- Confirm Telegram values remain in `telegram`.
- Confirm WhatsApp values remain in `whatsapp`.
- Confirm booking values remain in `booking`.
- Confirm Facebook, Instagram, TikTok, and LinkedIn values remain in their matching fields.
- Confirm Google Maps links remain in `google_maps`.
- Flag broken, truncated, or suspicious URLs for review.

### Data Integrity Checks

- Do not invent missing fields.
- Do not silently drop unmapped labels.
- Preserve multi-value fields as arrays.
- Preserve raw profile text for QA comparison.
- Flag duplicate names for owner review.
- Flag likely duplicate contact values for owner review.
- Flag rows with extraction uncertainty.

### Safety Checks

- Confirm no patient data is introduced.
- Confirm no private notes are placed in public fields.
- Confirm no SQL insert file is created.
- Confirm no Supabase import is attempted.
- Confirm no static app data is modified.
- Confirm the existing Excel template remains unchanged.

---

## Product Decision Needed

Before import planning, the project owner must choose one import visibility path.

### Option A: Public MVP Source

```text
listing_status = active
visibility_status = public
verification_status = unverified
```

Use only if the project owner accepts the uploaded document as public MVP source data.

### Option B: Review-First Source

```text
listing_status = pending
visibility_status = hidden
verification_status = pending
```

Use if additional row-level verification is required before public display.

Recommended decision timing:

```text
Extract and QA the 99 records first, then choose Option A or Option B before import planning.
```

---

## What Not To Do In Task 187

Do not:

```text
modify source code
modify UI copy
delete test data
insert real data
import spreadsheet data
modify SQL
modify RLS
modify schema
modify migrations
modify static data
change routes
modify probes
modify package scripts
create extraction outputs
create JSON output
create CSV output
create source DOCX copy
create Task 188
```

---

## Recommended Next Task

Recommended next task:

```text
Task 188 - Simple Facility Profiles Extraction Source Setup
```

Purpose:

- Place or reference the uploaded DOCX source in a stable project-accessible location.
- Confirm the exact source file path.
- Create only the source/extraction folder structure if approved.
- Confirm JSON-first extraction is approved.
- Confirm output paths for future extraction.
- Continue avoiding import, source-code changes, static-data changes, SQL changes, and real provider data insertion.

Task 188 was not created as part of this task.

---

## Scope Confirmation

For Task 187:

- Only `docs/CodexTask-187-SimpleFacilityProfilesExtractionPlanning.md` was updated.
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
- No extraction outputs were created.
- Task 188 was not created.

---

## Planning Summary

Task 187 defines a JSON-first extraction plan for the uploaded `Tiru_MedDirectory_Facility_Profiles(1).docx` source document. The future extraction should preserve 99 records, map document labels into simplified MVP fields, retain raw text for QA, generate defaults only later, perform count/category/contact/link/safety checks, and defer import visibility decisions until after extraction QA.
