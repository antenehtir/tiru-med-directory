# Codex Task 181: Real Provider Data Spreadsheet Template QA

## Project

DigitalDirectory-v2

## Goal

Create a QA record for the Excel real provider data intake spreadsheet template created in Task 180.

This task verifies that the workbook exists, includes all required sheets, contains required headers, includes allowed values and instructions, and contains template/example rows only with no real provider data.

This is a documentation-only QA task.

Do not insert, delete, import, or modify real provider data in this task.

---

## Important Context

Task 180 created:

```text
docs/data-intake/exports/TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx
```

Task 180 also updated:

```text
docs/CodexTask-180-RealProviderDataSpreadsheetTemplateExport.md
```

CSV companion files were intentionally skipped to keep Task 180 focused.

---

## Required Workbook QA Checks

Verify and document that the workbook exists and contains these sheets:

```text
01_Facilities
02_Doctors
03_Pharmacies
04_Diagnostics
05_Contact_Channels
06_Verification_Notes
07_Source_Tracking
08_Import_QA_Checklist
09_Allowed_Values
10_Instructions
```

---

## Required Header QA Checks

Verify and document that each sheet contains the required column headers from Task 180.

Check at minimum:

* Facilities headers are present.
* Doctors headers are present.
* Pharmacies headers are present.
* Diagnostics headers are present.
* Contact Channels headers are present.
* Verification Notes headers are present.
* Source Tracking headers are present.
* Import QA Checklist headers are present.
* Allowed Values sheet exists and includes controlled values.
* Instructions sheet exists and includes data-entry guidance.

---

## Required Safety QA Checks

Verify and document:

1. No real provider data is included.
2. Example/template rows are clearly marked as example/template guidance.
3. Do-not-delete/import warning is present.
4. No source code was modified.
5. No SQL, RLS, schema, or migration files were modified.
6. No test data was deleted.
7. No real data was inserted.
8. No package scripts or probes were modified.
9. Task 182 was not created.

---

## Usability QA Checks

Document whether the workbook includes:

* Bold header rows.
* Frozen header rows where possible.
* Readable column widths.
* Wrapped text for notes/guidance columns where useful.
* Clear sheet ordering.
* Allowed values reference.
* Instructions for project-owner data entry.

---

## QA Status

The QA record should state one of:

```text
Passed
Passed with minor follow-up
Blocked
```

Expected status:

```text
Passed
```

if all sheets, headers, instructions, and safety checks are present.

---

## Recommended Next Task

The recommended next task should be:

```text
Task 182 — Real Provider Data Filling Guidance
```

Purpose:

* Explain how the project owner should fill the Excel template.
* Define which provider categories to fill first.
* Recommend a small first batch for QA before large-scale real data entry.
* Clarify that real data should still not be imported until reviewed.

---

## Scope

Allowed:

* Create/update `docs/CodexTask-181-RealProviderDataSpreadsheetTemplateQA.md`.
* Inspect the Excel workbook template.
* Record QA findings.
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
* Do not create Task 182.

---

## Validation

No code validation is required.

Recommended checks:

```bash
git status
```

Workbook QA should confirm:

```text
Workbook exists
All 10 required sheets exist
Required headers are present
Allowed values sheet exists
Instructions sheet exists
No real provider data is included
```

No lint/build is required unless Codex modifies source code, which it must not do.

---

## Acceptance Criteria

* QA markdown record exists.
* Workbook path is documented.
* All 10 sheets are verified.
* Required headers are verified.
* Allowed Values sheet is verified.
* Instructions sheet is verified.
* Safety checks are documented.
* Usability checks are documented.
* QA status is clear.
* Recommended next task is identified.
* No source code is modified.
* No SQL/RLS/migration/schema files are modified.
* No real provider data is inserted.
* Task 182 is not created.

---

## Deliverable

A focused QA record for the real provider data spreadsheet template.

Do not proceed beyond Task 181.
