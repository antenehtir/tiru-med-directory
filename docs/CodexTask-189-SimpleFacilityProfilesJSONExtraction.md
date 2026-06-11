# Codex Task 189: Simple Facility Profiles JSON Extraction

## Project

DigitalDirectory-v2

## Goal

Extract the source Word document containing the Tiru MedDirectory facility profiles into a simple MVP-ready JSON file.

This task follows:

* CodexTask-186-SimplifyRealProviderDataIntakeAroundFacilityProfilesDocument.md
* CodexTask-187-SimpleFacilityProfilesExtractionPlanning.md
* CodexTask-188-SimpleFacilityProfilesExtractionSourceSetup.md

This is a real-data extraction task, but not a database import task.

Do not import data into Supabase in this task.

---

## Important Context

The source document is located at:

```text
docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx
```

It contains the Tiru MedDirectory full facility profiles database with:

```text
99 total facility/provider profiles in Addis Ababa
```

Known source category summary:

```text
General Hospital: 25
Specialty Center: 60
Diagnostic Center: 7
Ambulance Service: 1
Home Care: 2
Telemedicine: 1
Pharmacy: 1
Medical Plaza: 1
Healthcare Financing: 1
Total: 99
```

The goal is to extract the document into a simple JSON structure that can later be QA-reviewed and then wired into the app.

---

## Main Objective

Create this JSON output file:

```text
docs/data-intake/simple-facility-profiles/tiru-med-directory-facility-profiles.simple.json
```

Create the folder if needed:

```text
docs/data-intake/simple-facility-profiles/
```

---

## Required JSON Shape

Use this structure:

```json
{
  "meta": {
    "source_file": "docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx",
    "source_name": "Tiru MedDirectory Facility Profiles",
    "expected_record_count": 99,
    "extraction_status": "extracted",
    "notes": "Simple MVP extraction from source Word document. Not imported to Supabase."
  },
  "records": []
}
```

Each item inside `records` should use:

```json
{
  "record_number": 1,
  "name": "",
  "category": "",
  "specialty_or_services": "",
  "special_services": "",
  "sub_city": "",
  "area": "",
  "address": "",
  "phone": "",
  "hours": "",
  "email": "",
  "website": "",
  "telegram": "",
  "whatsapp": "",
  "booking": "",
  "facebook": "",
  "instagram": "",
  "tiktok": "",
  "linkedin": "",
  "google_maps": "",
  "raw_text": "",
  "extraction_notes": ""
}
```

Use empty strings for missing fields. Do not invent missing values.

---

## Field Mapping

Map document labels to JSON fields:

```text
Numbered heading -> record_number and name
Category line under heading -> category
Specialty / Services -> specialty_or_services
Special Services -> special_services
Sub-City -> sub_city
Area -> area
Address -> address
Phone -> phone
Hours -> hours
Email -> email
Website -> website
Telegram -> telegram
WhatsApp -> whatsapp
Booking -> booking
Facebook -> facebook
Instagram -> instagram
TikTok -> tiktok
LinkedIn -> linkedin
Google Maps -> google_maps
```

---

## Extraction Requirements

Extract all 99 provider/facility profiles.

Preserve:

```text
facility names
categories
specialty/services
special services
sub-city
area
address
phone numbers
hours
email
website
Telegram links
WhatsApp links
booking links
Facebook links
Instagram links
TikTok links
LinkedIn links
Google Maps links
```

Do not normalize phone numbers yet.

Do not split phone numbers into separate rows yet.

Do not generate slugs yet.

Do not assign listing_status, visibility_status, or verification_status yet.

Do not import to Supabase.

---

## QA Checks To Run

After extraction, verify:

```text
JSON file exists
records array exists
record count is 99
all records have record_number
all records have name
categories are preserved
phone/address/hours fields are preserved when present
URLs are preserved when present
missing optional fields remain blank strings
no Supabase import was created
no source app data file was modified
```

If exact 99 extraction is blocked, do not guess. Record the issue clearly in this Task 189 file and report the blocker.

---

## Scope

Allowed:

* Create `docs/data-intake/simple-facility-profiles/tiru-med-directory-facility-profiles.simple.json`.
* Create `docs/data-intake/simple-facility-profiles/` if needed.
* Update this Task 189 markdown with extraction results.
* Use the source DOCX for extraction.

Not allowed:

* Do not modify source code.
* Do not modify UI copy.
* Do not modify `src/data`.
* Do not modify Supabase SQL.
* Do not modify RLS, schema, or migrations.
* Do not import to Supabase.
* Do not delete test rows.
* Do not delete fallback data.
* Do not modify package scripts.
* Do not modify probes.
* Do not create Task 190.

---

## Validation

Recommended checks:

```bash
git status
```

Also verify:

```text
JSON file exists
records count = 99
no source code files changed
no SQL files changed
no Supabase files changed
```

No lint/build is required unless source code is modified, which it must not be.

---

## Acceptance Criteria

* Simple JSON extraction file exists.
* JSON contains `meta`.
* JSON contains `records`.
* Records count is 99.
* Simplified MVP fields are used.
* Missing optional fields are left blank, not invented.
* Source DOCX remains unchanged.
* No source code is modified.
* No SQL/RLS/migration/schema files are modified.
* No Supabase import is created.
* No real data is imported to database.
* Task 190 is not created.

---

## Deliverable

A simple MVP-ready JSON extraction of the 99 Tiru MedDirectory facility profiles.

Do not proceed beyond Task 189.
