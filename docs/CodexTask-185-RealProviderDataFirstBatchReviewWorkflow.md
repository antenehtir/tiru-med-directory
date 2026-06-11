# Codex Task 185: Real Provider Data First Batch Review Workflow

## Project

DigitalDirectory-v2

## Goal

Create a review workflow for the first real provider data batch before any import or replacement work begins.

This task follows:

* CodexTask-182-RealProviderDataFillingGuidance.md
* CodexTask-183-RealProviderDataFirstBatchPreparation.md
* CodexTask-184-RealProviderDataFirstBatchQAChecklist.md

This is a documentation-only review workflow task.

Do not insert, delete, import, or modify real provider data in this task.

---

## Important Context

Task 183 defined the first real-data batch as:

```text
10 providers total:
4 facilities
2 pharmacies
2 diagnostics providers
2 doctors
```

Task 184 created the QA checklist for reviewing that first batch.

The first filled spreadsheet should be reviewed before any import or replacement work.

Recommended filled draft file name:

```text
TiruMedicalDirectory_RealProviderDataIntake_FirstBatch_DRAFT.xlsx
```

---

## Main Objective

Create a first-batch review workflow that explains how the filled spreadsheet should be reviewed, who/what should review each part, and what decisions are possible before import planning.

Recommended target file:

```text
docs/CodexTask-185-RealProviderDataFirstBatchReviewWorkflow.md
```

---

## Review Workflow Stages

The review workflow should include these stages:

1. File intake check.
2. Provider row review.
3. Contact channel review.
4. Source tracking review.
5. Verification review.
6. Privacy/safety review.
7. Public visibility review.
8. Import readiness decision.
9. Correction loop.
10. Import planning readiness.

---

## Stage 1: File Intake Check

Confirm:

```text
The filled file is a copy of the approved template.
The original blank template remains unchanged.
The file name clearly indicates first-batch draft.
No import has been run.
No test rows have been deleted.
No fallback data has been deleted.
```

Recommended file name:

```text
TiruMedicalDirectory_RealProviderDataIntake_FirstBatch_DRAFT.xlsx
```

---

## Stage 2: Provider Row Review

Review provider sheets:

```text
01_Facilities
02_Doctors
03_Pharmacies
04_Diagnostics
```

Confirm expected count:

```text
4 facilities
2 pharmacies
2 diagnostics providers
2 doctors
```

For every provider row, review:

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
internal_review_note
```

Rows with missing required fields should be returned for correction.

---

## Stage 3: Contact Channel Review

Review:

```text
05_Contact_Channels
```

Confirm:

```text
provider_category is valid
provider_slug matches a provider row
channel_type is valid
is_public is true only for approved public contact details
no private staff phone numbers are included
no personal doctor numbers are included unless explicitly approved
unverified WhatsApp numbers are not public
href values are safe and correct
display_order is reasonable
```

---

## Stage 4: Source Tracking Review

Review:

```text
07_Source_Tracking
```

Confirm:

```text
each provider has at least one source row
source_type is valid
source_name or source_note is present
review_status is present
unknown sources are flagged for correction
provider_slug matches an existing provider row
```

---

## Stage 5: Verification Review

Review:

```text
06_Verification_Notes
```

Confirm:

```text
verification_status is valid
verified rows have last_confirmed_at
verified rows have reliable source evidence
pending rows are not public
disputed rows are not public
unverified rows are reviewed before publication
```

Allowed verification statuses:

```text
verified
unverified
pending
disputed
```

---

## Stage 6: Privacy And Safety Review

Confirm:

```text
no private staff phone numbers are included
no private emails are included
no personal doctor contact details are included unless approved
no internal notes appear in public fields
no sensitive patient information is included
no unsupported private data is included
no unverified data is marked active/public
```

---

## Stage 7: Public Visibility Review

Before import planning, default safe status should be:

```text
listing_status = pending
visibility_status = hidden
```

Only use:

```text
listing_status = active
visibility_status = public
```

when the provider row and contact channels have passed review.

Flag any active/public row that lacks:

```text
minimum required fields
source tracking
verification review
safe public contact review
```

---

## Stage 8: Import Readiness Decision

Each first-batch review should end with one of:

```text
Ready for import planning
Needs correction before import planning
Blocked
Needs product decision
```

Decision guidance:

### Ready for import planning

Use only if:

```text
all required fields are present
slugs are valid
contact channels are safe
source tracking is adequate
privacy checks pass
visibility statuses are appropriate
```

### Needs correction before import planning

Use if:

```text
some fields are missing
slugs need cleanup
source notes are weak
contact channels need verification
```

### Blocked

Use if:

```text
private data is included
sources are unreliable
provider identity is unclear
data conflicts are serious
```

### Needs product decision

Use if:

```text
category/subtype is unclear
visibility decision is unclear
provider should maybe be excluded
public contact display needs owner approval
```

---

## Stage 9: Correction Loop

If the batch needs correction:

1. Record issues in the spreadsheet or review notes.
2. Return the file to the project owner for correction.
3. Do not import.
4. Re-run first-batch QA checklist after corrections.
5. Only proceed when decision becomes `Ready for import planning`.

---

## Stage 10: Import Planning Readiness

Only after the batch is marked:

```text
Ready for import planning
```

should the project proceed to import planning.

Import planning should still not import data immediately. It should define:

```text
target tables
field mappings
safe dry-run approach
rollback approach
RLS expectations
post-import QA
```

---

## What Not To Do Yet

Do not:

```text
import real data yet
delete diagnostics test rows yet
delete fallback data yet
remove QA fixtures yet
commit a filled real-data spreadsheet unless approved
mark unverified rows as active/public
bulk-import rows before first-batch QA passes
```

---

## Recommended Next Task

The recommended next task should be:

```text
Task 186 — Real Provider Data First Batch Review QA Record
```

Purpose:

* Create a record format for reviewing the actual filled first-batch spreadsheet.
* Capture review outcome, issues, corrections needed, and import planning readiness.
* Still avoid importing data until review passes.

---

## Scope

Allowed:

* Create/update `docs/CodexTask-185-RealProviderDataFirstBatchReviewWorkflow.md`.
* Document review workflow stages.
* Document import readiness decision logic.
* Recommend next task.

Not allowed:

* Do not modify source code.
* Do not modify UI copy.
* Do not delete test data.
* Do not insert real data.
* Do not import spreadsheet data.
* Do not modify SQL, RLS, schema, or migrations.
* Do not modify static data.
* Do not change routes.
* Do not modify probes.
* Do not modify package scripts.
* Do not create Task 186.

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

* First-batch review workflow document exists.
* Review workflow stages are documented.
* Provider row review is documented.
* Contact channel review is documented.
* Source tracking review is documented.
* Verification review is documented.
* Privacy/safety review is documented.
* Public visibility review is documented.
* Import readiness decision labels are documented.
* Correction loop is documented.
* Recommended next task is identified.
* No source code is modified.
* No SQL/RLS/migration/schema files are modified.
* No real provider data is inserted.
* Task 186 is not created.

---

## Deliverable

A focused review workflow for the first real provider data batch.

Do not proceed beyond Task 185.
