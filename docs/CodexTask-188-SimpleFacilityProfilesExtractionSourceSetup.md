# Codex Task 188: Simple Facility Profiles Extraction Source Setup

## Project

DigitalDirectory-v2

## Goal

Create a source setup record for the uploaded Tiru MedDirectory Facility Profiles Word document so it can be used later for simple MVP data extraction.

This task follows:

* CodexTask-186-SimplifyRealProviderDataIntakeAroundFacilityProfilesDocument.md
* CodexTask-187-SimpleFacilityProfilesExtractionPlanning.md

This is a documentation and source setup task.

Do not extract, import, insert, delete, or modify real provider data in this task.

---

## Important Context

The project owner placed the source Word document into the project folder:

```text
docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx
```

This document is the MVP source document for real provider data.

It contains the Tiru MedDirectory full facility profiles database with:

```text
99 total facility/provider profiles in Addis Ababa
```

The source document includes provider categories such as:

```text
General Hospital
Specialty Center
Diagnostic Center
Ambulance Service
Home Care
Telemedicine
Pharmacy
Medical Plaza
Healthcare Financing
```

The source document includes practical public fields such as:

```text
facility name
category
specialty / services
special services
sub-city
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
google maps
```

---

## Main Objective

Record that the source document is now available in a stable project path for future extraction.

Recommended target file:

```text
docs/CodexTask-188-SimpleFacilityProfilesExtractionSourceSetup.md
```

---

## Source File To Verify

Verify that this file exists:

```text
docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx
```

Expected file size from local check:

```text
51998 bytes
```

---

## Source Setup Status

The setup record should state:

```text
Source setup complete.
```

if the file exists at the expected path.

---

## Future Extraction Direction

The next task should use this source file to plan or perform extraction into simple structured output.

Preferred future extraction output format:

```text
JSON first
CSV later if needed
```

Recommended future output folder:

```text
docs/data-intake/simple-facility-profiles/
```

Potential future JSON output:

```text
docs/data-intake/simple-facility-profiles/tiru-med-directory-facility-profiles.simple.json
```

Potential future CSV output:

```text
docs/data-intake/simple-facility-profiles/TiruMedDirectoryFacilityProfiles_Simple.csv
```

Do not create these extraction output files in Task 188.

---

## Simplified Extraction Fields For Future Task

Future extraction should target:

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

Generated fields such as slug, listing_status, visibility_status, verification_status, last_confirmed_at, and source_note should be handled later, not in Task 188.

---

## What Not To Do Yet

Do not:

```text
extract real data
create JSON output
create CSV output
create Supabase insert SQL
import to Supabase
delete diagnostics test rows
delete fallback data
modify app source code
modify UI copy
modify package scripts
create Task 189
```

---

## Recommended Next Task

The recommended next task should be:

```text
Task 189 — Simple Facility Profiles JSON Extraction
```

Purpose:

* Extract the source Word document into a simple JSON file.
* Preserve all 99 provider records.
* Preserve public contact and map fields.
* Avoid import to Supabase until extraction QA passes.

---

## Scope

Allowed:

* Create/update this Task 188 setup record.
* Verify that the source DOCX exists in `docs/data-intake/source/`.
* Commit the source DOCX into the repository if approved.
* Document future extraction direction.

Not allowed:

* Do not modify source code.
* Do not modify UI copy.
* Do not delete test data.
* Do not insert real data into app/database.
* Do not import spreadsheet data.
* Do not modify SQL, RLS, schema, or migrations.
* Do not modify static app data.
* Do not change routes.
* Do not modify probes.
* Do not modify package scripts.
* Do not create extraction JSON/CSV outputs.
* Do not create Task 189.

---

## Validation

No code validation is required.

Recommended checks:

```bash
git status
Get-ChildItem .\docs\data-intake\source | Format-List Name,Length
```

Expected source file:

```text
Tiru_MedDirectory_Facility_Profiles.docx
```

Expected size:

```text
51998
```

---

## Acceptance Criteria

* Task 188 setup record exists.
* Source DOCX path is documented.
* Source DOCX existence is verified.
* Source file size is documented.
* Future extraction direction is documented.
* Simplified future extraction fields are documented.
* Recommended next task is identified.
* No source code is modified.
* No SQL/RLS/migration/schema files are modified.
* No real provider data is inserted into app/database.
* No extraction JSON/CSV output is created.
* Task 189 is not created.

---

## Deliverable

A focused source setup record confirming the facility profiles Word document is ready for future simple extraction.

Do not proceed beyond Task 188.
