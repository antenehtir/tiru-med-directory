# Codex Task 156: Diagnostics SQL Execution QA Record

## Project

DigitalDirectory-v2

## Goal

Create a QA record for the diagnostics SQL setup after manual execution.

This task follows:

- CodexTask-152-DiagnosticsTableSQLDraft.md
- CodexTask-153-DiagnosticsRLSPolicySQLDraft.md
- CodexTask-154-DiagnosticsTestDataSQLDraft.md
- CodexTask-155-DiagnosticsManualSQLExecutionGuide.md

The purpose is to document whether the diagnostics table SQL, RLS policy SQL, and test data SQL were executed successfully in Supabase.

This is a documentation-only QA record task.

Do not execute SQL in this task unless the project owner explicitly does it manually outside Codex.

---

## Important Context

Before writing the QA record, read:

- docs/CodexTask-152-DiagnosticsTableSQLDraft.md
- docs/CodexTask-153-DiagnosticsRLSPolicySQLDraft.md
- docs/CodexTask-154-DiagnosticsTestDataSQLDraft.md
- docs/CodexTask-155-DiagnosticsManualSQLExecutionGuide.md
- docs/CodexTask-139-PharmaciesSQLExecutionQARecord.md
- docs/CodexTask-104-DoctorsSQLManualExecutionQA.md
- docs/CodexTask-71-FacilitiesSQLManualExecutionQA.md
- docs/DataModelContentStructure.md
- docs/DevelopmentRoadmap.md

Use the existing facilities, doctors, and pharmacies SQL execution QA record patterns as the main guide.

---

## Main Objective

Create a structured QA record for manual diagnostics SQL execution.

The QA record should document:

1. Whether the table SQL was executed.
2. Whether the RLS SQL was executed.
3. Whether the test data SQL was executed.
4. Whether verification queries were run.
5. Expected public-visible rows.
6. Expected RLS-blocked rows.
7. Any errors encountered.
8. Any fixes required before public read helper work.
9. Whether the project is ready for Task 157.

---

## QA Status Options

Use clear status labels such as:

```text
Not executed
Executed
Partially executed
Blocked
Needs review
Passed
Failed