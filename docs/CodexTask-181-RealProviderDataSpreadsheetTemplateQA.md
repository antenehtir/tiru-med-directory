# Codex Task 181: Real Provider Data Spreadsheet Template QA

## Project

DigitalDirectory-v2

## Goal

Create a QA record for the Excel real provider data intake spreadsheet template created in Task 180.

This task verifies that the workbook exists, includes all required sheets, contains required headers, includes allowed values and instructions, and contains template/example rows only with no real provider data.

This was a documentation-only QA task. No source code, UI copy, SQL, RLS, schema, migrations, static data, routes, probes, package scripts, test data, or real provider data were modified.

---

## QA Status

```text
Passed
```

All required workbook, sheet, header, allowed-value, instruction, template-row, and safety checks were satisfied.

---

## Workbook Reviewed

Workbook path:

```text
docs/data-intake/exports/TiruMedicalDirectory_RealProviderDataIntake_Template.xlsx
```

CSV companion files were intentionally skipped in Task 180. This remains acceptable because CSV companions were optional and the Excel workbook is the primary template deliverable.

---

## Sheet Verification

All 10 required sheets exist.

| Sheet | Exists | Header check | Row/template check |
| --- | --- | --- | --- |
| `01_Facilities` | Passed | Passed - 28 required headers present | One example-only row is marked as not real provider data |
| `02_Doctors` | Passed | Passed - 23 required headers present | One example-only row is marked as not real provider data |
| `03_Pharmacies` | Passed | Passed - 24 required headers present | One example-only row is marked as not real provider data |
| `04_Diagnostics` | Passed | Passed - 24 required headers present | One example-only row is marked as not real provider data |
| `05_Contact_Channels` | Passed | Passed - 13 required headers present | One example-only row is marked as not real contact data |
| `06_Verification_Notes` | Passed | Passed - 10 required headers present | One example-only row is marked as template guidance |
| `07_Source_Tracking` | Passed | Passed - 10 required headers present | One example-only row is marked as template guidance |
| `08_Import_QA_Checklist` | Passed | Passed - 4 required headers present | Required checklist rows are present |
| `09_Allowed_Values` | Passed | Passed - 4 required headers present | Controlled values reference is present |
| `10_Instructions` | Passed | Passed - 3 required headers present | Data-entry and safety guidance is present |

Required sheets verified:

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

## Allowed Values Verification

The `09_Allowed_Values` sheet exists and includes controlled values for:

- `provider_category`
- `listing_status`
- `visibility_status`
- `verification_status`
- `boolean_values`
- `diagnostic_provider_type`
- `channel_type`
- `review_status`
- `source_type`

Allowed-values QA status:

```text
Passed
```

---

## Instructions Verification

The `10_Instructions` sheet exists and includes data-entry guidance covering:

- Fill one row per provider in the relevant provider sheet.
- Use one row per contact method in Contact Channels.
- Do not include private contact details unless approved for public display.
- Use `active` and `public` only when a row is ready for public display.
- Use `pending`, `hidden`, or `internal` for rows still under review.
- Use stable slugs.
- Do not delete QA/test rows until real data is reviewed and import-ready.
- Do not import spreadsheet data until the spreadsheet passes QA.
- Treat examples as template examples only, not real provider data.

Instructions QA status:

```text
Passed
```

---

## Safety Verification

| Safety check | Result |
| --- | --- |
| Workbook exists | Passed |
| Example/template rows are clearly marked as template guidance | Passed |
| No real provider data is included | Passed |
| Do-not-delete/import warning is present | Passed |
| No source code was modified | Passed |
| No UI copy was modified | Passed |
| No SQL files were modified | Passed |
| No RLS files were modified | Passed |
| No schema files were modified | Passed |
| No migration files were modified | Passed |
| No static data was modified | Passed |
| No test data was deleted | Passed |
| No real data was inserted | Passed |
| No package scripts were modified | Passed |
| No probes were modified | Passed |
| No routes were changed | Passed |
| Task 182 was not created | Passed |

The instructions sheet includes these required safety notes:

```text
Do not insert real data yet.
Do not delete diagnostics test rows yet.
Do not delete fallback data yet.
Do not remove QA fixtures yet.
Do not import spreadsheet data until the template is QA-reviewed.
```

---

## Usability Verification

| Usability check | Result |
| --- | --- |
| Bold header rows | Passed |
| Frozen header rows where possible | Passed |
| Readable column widths | Passed |
| Wrapped text for notes/guidance columns where useful | Passed |
| Clear sheet ordering | Passed |
| Allowed values reference | Passed |
| Instructions for project-owner data entry | Passed |
| Workbook sheets render for inspection | Passed |

---

## Remaining Issues

```text
None for Task 181.
```

Real provider data filling is still pending and should occur only after owner guidance and review.

---

## Recommended Next Task

Recommended next task:

```text
Task 182 - Real Provider Data Filling Guidance
```

Purpose:

- Explain how the project owner should fill the Excel template.
- Define which provider categories to fill first.
- Recommend a small first batch for QA before large-scale real data entry.
- Clarify that real data should still not be imported until reviewed.

Task 182 was not created as part of this task.

---

## Scope Confirmation

For Task 181:

- Only `docs/CodexTask-181-RealProviderDataSpreadsheetTemplateQA.md` was updated.
- The Excel workbook was inspected but not modified.
- No source code was modified.
- No UI copy was modified.
- No test data was deleted.
- No real provider data was inserted.
- No SQL was modified.
- No RLS was modified.
- No schema was modified.
- No migrations were modified.
- No static data was modified.
- No routes were changed.
- No probes were modified.
- No package scripts were modified.
- Task 182 was not created.

---

## QA Summary

Task 181 passed. The Task 180 Excel workbook exists, all required sheets and headers are present, controlled values and instructions are included, example rows are marked as template guidance, no real provider data is included, and the workbook is ready for a future filling-guidance task.
