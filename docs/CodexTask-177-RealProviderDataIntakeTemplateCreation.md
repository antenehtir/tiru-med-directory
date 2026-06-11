# Codex Task 177: Real Provider Data Intake Template Creation

## Project

DigitalDirectory-v2

## Goal

Create a spreadsheet-ready real provider data intake template that the project owner can use to prepare real healthcare provider information for later review and replacement planning.

This task follows:

- `docs/CodexTask-176-RealProviderDataIntakeFormatAndReplacementPlanning.md`

This is a template creation task only. No source code, UI copy, test data, real data, SQL, RLS, schema, migrations, static data, routes, probes, or package scripts were modified for this task.

---

## Task Status

```text
Real provider data intake template created.
```

Created template:

```text
docs/data-intake/RealProviderDataIntakeTemplate.md
```

The template is spreadsheet-ready and contains field-level tables with:

- field name
- required or optional status
- example value
- notes/guidance

No real provider data was included.

---

## Context Reviewed

Required context reviewed:

- `docs/CodexTask-176-RealProviderDataIntakeFormatAndReplacementPlanning.md`
- `docs/CodexTask-177-RealProviderDataIntakeTemplateCreation.md`
- existing provider data structures in `src/data`
- existing Supabase helper patterns in `src/lib/supabase`
- existing public listing types in `src/types/public-listings.ts`

Template alignment notes:

- Provider categories align with current public listing patterns: `facility`, `doctor`, `pharmacy`, and `diagnostics`.
- Contact-channel provider type guidance includes singular `diagnostic` for diagnostics contact channels, matching helper patterns.
- Public-read status guidance keeps `listing_status = active` and `visibility_status = public` as the public-read requirement.
- Verification values align with helper patterns: `unverified`, `pending`, `verified`, `disputed`, and `expired`.

---

## Template Sections Included

The template includes these required sections:

| Section | Included | Notes |
| --- | --- | --- |
| Facilities | Yes | Facility-specific fields, examples, and guidance. |
| Doctors | Yes | Doctor-specific fields and privacy guidance. |
| Pharmacies | Yes | Pharmacy-specific fields and workflow caution. |
| Diagnostics | Yes | Diagnostic provider fields and provider type guidance. |
| Contact Channels | Yes | One-to-many provider contact format and public/private guidance. |
| Verification Notes | Yes | Review and verification tracking fields. |
| Source Tracking | Yes | Source and review provenance fields. |
| Import QA Checklist | Yes | Required pre-import checks and result tracking. |

The template also includes:

- allowed values reference
- slug rules
- contact channel guidance
- diagnostics provider type guidance
- do-not-delete/import warning
- recommended next task

---

## Do-Not-Delete/Import Warning Included

The template clearly records:

```text
Do not delete diagnostics test rows yet.
Do not delete fallback data yet.
Do not remove QA fixtures yet.
Do not insert real data until the intake template is reviewed and approved.
Do not modify SQL, RLS, schema, migrations, source code, routes, probes, package scripts, or static data from this template task.
```

---

## Files Created

```text
docs/data-intake/RealProviderDataIntakeTemplate.md
```

---

## Files Modified

```text
docs/CodexTask-177-RealProviderDataIntakeTemplateCreation.md
```

---

## Recommended Next Task

Recommended next task:

```text
Task 178 — Real Provider Data Intake Template QA
```

Purpose:

- Verify the template is complete.
- Confirm the project owner can use it to prepare real provider data.
- Decide whether to produce Excel/CSV files next.
- Prepare for real data collection/import planning.

Task 178 was not created as part of this task.

---

## Scope Confirmation

For Task 177:

- No source code was modified.
- No UI copy was modified.
- No test data was deleted.
- No real data was inserted.
- No SQL was modified.
- No RLS was modified.
- No schema was modified.
- No migrations were modified.
- No static data was modified.
- No routes were changed.
- No probes were modified.
- No package scripts were modified.
- Task 178 was not created.

---

## Completion Summary

Task 177 created a markdown-based, spreadsheet-ready real provider data intake template under `docs/data-intake/`. The template supports Facilities, Doctors, Pharmacies, Diagnostics, Contact Channels, Verification Notes, Source Tracking, and Import QA Checklist sections, and it includes allowed values, slug rules, contact guidance, diagnostics guidance, and import safety warnings.
