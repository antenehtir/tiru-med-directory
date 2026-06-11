# Codex Task 188: Simple Facility Profiles Extraction Source Setup

## Project

DigitalDirectory-v2

## Goal

Record that the Tiru MedDirectory facility profiles Word document is available at a stable project path for future JSON-first extraction.

This is a documentation and source setup record. No source code, UI copy, test data, real app/database data, spreadsheet data, SQL, RLS, schema, migrations, static app data, routes, probes, package scripts, extraction JSON/CSV outputs, or Task 189 file were created or modified.

---

## Source Setup Status

```text
Source setup complete.
```

The source DOCX exists at the expected project path and is ready for a future extraction task.

---

## Context Reviewed

Planning references:

- `docs/CodexTask-186-SimplifyRealProviderDataIntakeAroundFacilityProfilesDocument.md`
- `docs/CodexTask-187-SimpleFacilityProfilesExtractionPlanning.md`

Source file verified:

```text
docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx
```

---

## Source File Verification

Verified source path:

```text
docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx
```

Expected local file size:

```text
51998 bytes
```

Observed local file size:

```text
51998 bytes
```

Verification result:

```text
Source DOCX exists and matches the expected local file size.
```

The source document is the MVP source document for real provider data and contains the Tiru MedDirectory full facility profiles database with `99` total facility/provider profiles in Addis Ababa.

No real provider data was extracted from the document in this task.

---

## Future Extraction Direction

Future extraction direction:

```text
JSON first, CSV later if needed.
```

Reason:

- JSON can preserve optional and missing fields safely.
- JSON can preserve multi-value contact and social fields as arrays.
- JSON can preserve `raw_text` and `extraction_notes` for QA.
- CSV can be generated later after JSON extraction QA if spreadsheet review is needed.

Future output folder:

```text
docs/data-intake/simple-facility-profiles/
```

Do not create this folder or any extraction output in Task 188 unless a future task explicitly approves it.

Planned future JSON output:

```text
docs/data-intake/simple-facility-profiles/tiru-med-directory-facility-profiles.simple.json
```

Optional future CSV output:

```text
docs/data-intake/simple-facility-profiles/TiruMedDirectoryFacilityProfiles_Simple.csv
```

No extraction JSON or CSV output files were created in Task 188.

---

## Future Simplified Extraction Fields

Future extraction should target these simplified fields:

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

Field handling notes:

- `record_number` should preserve profile order from the Word document.
- `raw_text` should preserve the original profile block for QA comparison.
- `extraction_notes` should record extraction uncertainty only and should not be public UI data.
- Missing source fields should remain blank, `null`, or empty arrays; do not invent values.

---

## Generated Fields To Handle Later

Generated/default fields should be handled in later extraction QA, import planning, or import execution tasks.

Do not generate these in Task 188:

```text
slug
listing_status
visibility_status
verification_status
last_confirmed_at
source_note
```

Later handling:

| Field | Later handling |
| --- | --- |
| `slug` | Generate from `name`; resolve duplicates using area/category suffixes. |
| `listing_status` | Apply after product decision: `active` or `pending`. |
| `visibility_status` | Apply after product decision: `public` or `hidden`. |
| `verification_status` | Apply after product decision: `unverified` or `pending`. |
| `last_confirmed_at` | Assign only after extraction QA or review date is approved. |
| `source_note` | Use a safe source note such as `Imported from Tiru MedDirectory Facility Profiles document`. |

---

## Product Decision Still Needed

The active/public versus pending/hidden decision remains open for a later task.

Option A:

```text
listing_status = active
visibility_status = public
verification_status = unverified
```

Use only if the project owner accepts the source DOCX as public MVP source data.

Option B:

```text
listing_status = pending
visibility_status = hidden
verification_status = pending
```

Use if additional row-level verification is required before public display.

Recommended timing:

```text
Extract JSON, run extraction QA, then record the visibility/import decision before any import planning.
```

---

## No Extraction Outputs Created

Confirmed for Task 188:

- No JSON extraction output was created.
- No CSV extraction output was created.
- No app seed file was created.
- No Supabase insert SQL was created.
- No import file was created.
- No source-code data file was created.

Planned future output folder remains only a future path:

```text
docs/data-intake/simple-facility-profiles/
```

---

## Recommended Next Task

Recommended next task:

```text
Task 189 - Simple Facility Profiles JSON Extraction
```

Purpose:

- Extract the verified source Word document into a simple JSON file.
- Preserve all `99` provider records.
- Preserve public contact, social, booking, and Google Maps fields.
- Preserve raw text and extraction notes for QA.
- Avoid importing to Supabase until extraction QA passes and the product visibility decision is recorded.

Task 189 was not created as part of this task.

---

## Scope Confirmation

For Task 188:

- Only `docs/CodexTask-188-SimpleFacilityProfilesExtractionSourceSetup.md` was updated.
- The source DOCX was verified but not modified.
- No source code was modified.
- No UI copy was modified.
- No test data was deleted.
- No real data was inserted into the app or database.
- No spreadsheet data was imported.
- No SQL was modified.
- No RLS was modified.
- No schema was modified.
- No migrations were modified.
- No static app data was modified.
- No routes were changed.
- No probes were modified.
- No package scripts were modified.
- No extraction JSON or CSV outputs were created.
- Task 189 was not created.

---

## Setup Summary

The source setup is complete. `docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx` exists, has the expected local size of `51998` bytes, and is ready for a future JSON-first extraction task. Generated fields, product visibility decisions, extraction outputs, and any import work remain deferred.
