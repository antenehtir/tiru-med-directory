# Codex Task 186: Simplify Real Provider Data Intake Around Facility Profiles Document

## Project

DigitalDirectory-v2

## Goal

Create a simplified MVP planning record for real provider data intake using the uploaded Tiru MedDirectory facility profiles document as the MVP source structure.

This is a documentation-only planning task. No source code, UI copy, test data, real provider data, spreadsheet data, SQL, RLS, schema, migrations, static data, routes, probes, package scripts, or Excel template files were modified.

---

## Planning Status

```text
Planning complete.
```

The MVP intake direction is simplified around the uploaded Word document rather than the heavier Excel intake workbook.

---

## Source Document Decision

The project owner uploaded a structured Word document named:

```text
Tiru_MedDirectory_Facility_Profiles(1).docx
```

This document is now identified as the MVP source data document for first real provider preparation.

Owner-provided document context:

- It contains `99` total facility/provider profiles in Addis Ababa.
- It includes these category groups:
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

This task does not include, paste, transform, import, or insert any real provider rows from the document.

---

## Why The Excel Intake Template Is Too Heavy For Immediate MVP Import

The current Excel workbook remains useful, but it is too detailed for immediate MVP extraction from the uploaded 99-profile document.

Current workbook path:

```text
docs/data-intake/exports/TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx
```

Reasons the workbook is too heavy for this immediate MVP stage:

- It is optimized for controlled provider-submitted or reviewer-prepared data, not quick extraction from an already structured source document.
- It expects multiple workflow concepts such as provider sheets, contact-channel rows, verification notes, source tracking, allowed values, and import QA.
- It asks the project owner to provide or normalize fields that can be generated later, such as slugs, listing statuses, visibility statuses, verification statuses, and import notes.
- It introduces category-specific detail that is valuable later but slows the first MVP pass.
- It requires manual row splitting across multiple sheets, which is heavier than extracting the document's already practical profile fields.
- It is better suited to later self-claim, profile update, verification, and provider-submitted detail workflows.

Planning decision:

```text
Do not force the uploaded Word document into the full Excel intake template for immediate MVP extraction.
```

---

## Simplified MVP Fields

Use a simplified, document-shaped field set for the MVP extraction plan.

Recommended MVP fields:

| Simplified field | Source meaning |
| --- | --- |
| `name` | Facility/provider name from the uploaded profile document. |
| `category` | Document category, such as General Hospital, Specialty Center, Diagnostic Center, Pharmacy, or related category. |
| `specialty_or_services` | Main specialty, services, or service grouping listed in the document. |
| `special_services` | Any special services noted in the document. |
| `sub_city` | Addis Ababa sub-city from the document. |
| `area` | Neighborhood/area from the document. |
| `address` | Public address text from the document. |
| `phone` | Public phone contact values from the document. |
| `hours` | Public hours text from the document. |
| `email` | Public email value if present in the document. |
| `website` | Public website URL if present in the document. |
| `telegram` | Public Telegram value if present in the document. |
| `whatsapp` | Public WhatsApp value if present in the document. |
| `booking` | Public booking link or booking contact if present in the document. |
| `facebook` | Public Facebook link if present in the document. |
| `instagram` | Public Instagram link if present in the document. |
| `tiktok` | Public TikTok link if present in the document. |
| `linkedin` | Public LinkedIn link if present in the document. |
| `google_maps` | Public Google Maps link if present in the document. |

Recommended extraction shape:

```text
One row per facility/provider profile.
One column per simplified MVP field.
No provider self-claim fields.
No import status fields required from the project owner.
No SQL-ready transformation during extraction planning.
```

---

## Fields Deferred For Later Provider Self-Claim Or Profile Update Workflows

Do not require these fields for the immediate MVP extraction from the uploaded Word document:

```text
ownership_type
provider_owner_name
provider_owner_contact
claim_status
claimed_by_user_id
claim_review_status
appointment_required
walk_in_available
home_service_available
emergency_available
inpatient_available
outpatient_available
delivery_available
pickup_available
accepts_prescription_upload_preview
home_sample_collection_preview
result_turnaround_public
reviewed_by
review_status
verification_notes_sheet
source_tracking_sheet
internal_review_note
import_qa_checklist
provider_self_claim_fields
profile_update_request_fields
document_upload_fields
payment_or_order_workflow_fields
patient_data_fields
```

Reason:

- These fields are useful later, but they are not necessary to extract and QA a simple MVP directory profile from the existing document.
- Some fields imply workflows that should not exist yet, such as provider ownership, profile claim, booking, orders, uploads, payments, patient records, or diagnostics result delivery.
- The MVP goal is public directory discovery, not provider account management.

---

## Default And Internal Fields Generated Later

The project owner should not manually fill these values for all 99 profiles during the simplified MVP extraction stage.

These can be generated or assigned later during extraction QA, import planning, or actual import:

| Generated/internal field | Suggested default or generation rule |
| --- | --- |
| `slug` | Generate from `name`; resolve duplicates with area/category suffixes. |
| `provider_type` | Derive from `category` during mapping. |
| `listing_status` | Product decision required: `active` or `pending`. |
| `visibility_status` | Product decision required: `public` or `hidden`. |
| `verification_status` | Likely `unverified` or `pending` unless owner approves verified source status. |
| `last_confirmed_at` | Use extraction/review/import date only after approved. |
| `source_note` | `Imported from Tiru MedDirectory Facility Profiles document`. |
| `source_document_name` | `Tiru_MedDirectory_Facility_Profiles(1).docx`. |
| `source_batch` | Future generated batch label for the extracted file. |
| `internal_review_note` | Add only during review when a row needs correction or product decision. |
| `display_order` | Generate later if needed; not required for MVP extraction. |
| `contact_channel_rows` | Generate later from phone/email/website/social/map fields if the target model needs normalized contact rows. |

---

## Product Decision Needed

Before any import planning or public display, the project owner must decide how the first extracted 99 profiles should enter the system.

### Option A: Public MVP Import

```text
listing_status = active
visibility_status = public
verification_status = unverified
```

Use this only if the project owner accepts the uploaded Word document as a public MVP source document.

Pros:

- Fastest route to visible real provider profiles.
- Replaces sample/fallback provider content sooner.
- Supports MVP review with real directory coverage.

Risks:

- Public users may treat all 99 records as current.
- Contact details may need additional confirmation.
- Category and service wording may need public trust review.

### Option B: Review-First Import

```text
listing_status = pending
visibility_status = hidden
verification_status = pending
```

Use this if the project owner wants review before public display.

Pros:

- Safer for contact accuracy and public trust.
- Prevents accidental public display before QA.
- Aligns with the earlier Excel first-batch guidance.

Risks:

- Slower MVP visibility.
- Requires an additional approval step before replacing public sample/fallback content.

### Decision Record Needed

Required product decision:

```text
Should the 99 uploaded facility profiles be treated as public MVP source data immediately, or as pending/hidden records until a row-level review passes?
```

Recommended default if uncertain:

```text
Option B - pending / hidden / pending
```

Recommended fast MVP option if owner approves public use:

```text
Option A - active / public / unverified
```

---

## Relationship To Existing Excel Template

The existing Excel template must not be deleted.

Keep this file:

```text
docs/data-intake/exports/TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx
```

Updated planning relationship:

| Artifact | MVP role |
| --- | --- |
| Uploaded Word document | MVP source document for initial real provider profile extraction. |
| Simplified CSV or JSON extraction | Best near-term working format for the 99 facility/provider profiles. |
| Existing Excel intake template | Later detailed intake format for provider-submitted updates, profile claims, source tracking, verification notes, and import QA. |

The Excel workbook remains useful for:

- provider-submitted detailed updates
- future provider self-claim workflows
- reviewer-prepared corrections
- contact-channel normalization
- source tracking
- verification notes
- import QA checklists
- later structured batch imports

The immediate MVP path should not require the project owner to manually re-enter all 99 document profiles into the workbook.

---

## Recommended Simplified Extraction Outputs For Next Planning

Task 186 does not create any extraction files, but the next planning task should decide between simple formats.

Potential future CSV:

```text
docs/data-intake/simple-facility-profiles/TiruMedDirectoryFacilityProfiles_Simple.csv
```

Potential future JSON:

```text
docs/data-intake/simple-facility-profiles/tiru-med-directory-facility-profiles.simple.json
```

Potential future app seed only after extraction QA:

```text
src/data/real-facility-profiles.ts
```

Do not create these files in Task 186.

---

## Recommended Next Task

Recommended next task:

```text
Task 187 - Simple Facility Profiles Extraction Planning
```

Purpose:

- Define how to extract the 99 uploaded facility/provider profiles into a simple CSV or JSON structure.
- Confirm the exact simplified columns.
- Decide whether extraction starts with all 99 records or a smaller review batch.
- Define QA checks for the extracted file.
- Preserve the existing Excel template for later detailed/provider-submitted workflows.
- Avoid importing to Supabase until extracted data is QA-reviewed and product visibility decisions are made.

Task 187 was not created as part of this task.

---

## Scope Confirmation

For Task 186:

- Only `docs/CodexTask-186-SimplifyRealProviderDataIntakeAroundFacilityProfilesDocument.md` was updated.
- No source code was modified.
- No UI copy was modified.
- No test data was deleted.
- No real provider data was inserted.
- No spreadsheet data was imported.
- No uploaded document data was extracted into project data files.
- No SQL was modified.
- No RLS was modified.
- No schema was modified.
- No migrations were modified.
- No static data was modified.
- No routes were changed.
- No probes were modified.
- No package scripts were modified.
- The existing Excel template was not deleted.
- Task 187 was not created.

---

## Planning Summary

The uploaded `Tiru_MedDirectory_Facility_Profiles(1).docx` document is the MVP source data reference for the next real provider data step. The MVP intake path should use the document's practical public fields in a simplified extraction format, defer provider self-claim and detailed workflow fields, generate internal/default fields later, keep the Excel workbook for future detailed updates, and require a product decision before choosing active/public versus pending/hidden import behavior.
