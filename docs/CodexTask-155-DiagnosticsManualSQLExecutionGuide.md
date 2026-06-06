# Codex Task 155: Diagnostics Manual SQL Execution Guide

## Project

DigitalDirectory-v2

## Goal

Create a manual SQL execution guide for the diagnostics discovery table, RLS policy, and test data drafts.

This task follows:

- CodexTask-152-DiagnosticsTableSQLDraft.md
- CodexTask-153-DiagnosticsRLSPolicySQLDraft.md
- CodexTask-154-DiagnosticsTestDataSQLDraft.md

The purpose is to guide safe manual execution of the diagnostics SQL drafts in Supabase SQL Editor.

This is a documentation-only task.

Do not execute SQL in this task.

---

## Important Context

Before writing the guide, read:

- docs/CodexTask-152-DiagnosticsTableSQLDraft.md
- docs/CodexTask-153-DiagnosticsRLSPolicySQLDraft.md
- docs/CodexTask-154-DiagnosticsTestDataSQLDraft.md
- docs/CodexTask-138-PharmaciesManualSQLExecutionGuide.md
- docs/CodexTask-103-DoctorsSQLManualExecutionGuide.md
- docs/CodexTask-70-FacilitiesSQLManualGuide.md
- docs/DataModelContentStructure.md
- docs/DevelopmentRoadmap.md

Use the existing facilities, doctors, and pharmacies manual SQL execution guide patterns as the main guide.

---

## Main Objective

Create a step-by-step manual execution guide for Supabase SQL Editor.

The guide should cover the safe order of execution:

```text
1. Diagnostics table SQL draft
2. Diagnostics RLS policy SQL draft
3. Diagnostics test data SQL draft
4. Manual verification queries