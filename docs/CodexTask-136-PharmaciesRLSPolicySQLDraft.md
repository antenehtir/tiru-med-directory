# Codex Task 136: Pharmacies RLS Policy SQL Draft

## Project

DigitalDirectory-v2

## Goal

Continue the pharmacy workflow by drafting Row Level Security policies for the `pharmacies` table.

This follows:

- CodexTask-130-PharmacyDiscoverySchemaPlanning.md
- CodexTask-131-PharmaciesTableSQLDraft.md

Task 136 should create a clear SQL draft for pharmacy public read access and future controlled write workflows.

This task is planning/draft only.

Do not execute SQL.

Do not connect to Supabase.

Do not modify application code.

---

## Important Context

Before making changes, read:

- docs/CodexTask-130-PharmacyDiscoverySchemaPlanning.md
- docs/CodexTask-131-PharmaciesTableSQLDraft.md
- docs/DevelopmentRoadmap.md
- docs/DataModelContentStructure.md
- docs/DesignSystem.md

Also inspect related facility and doctor RLS examples:

- docs/CodexTask-68-FacilitiesRLSPolicyDraft.md
- docs/CodexTask-101-DoctorsRLSPolicySQLDraft.md

Use the same disciplined style and safety approach.

---

## Main Objective

Create a markdown document containing SQL draft policies for the `pharmacies` table.

The policies should support:

1. Public read access for approved/public pharmacy records
2. No public insert/update/delete access
3. Future admin/provider controlled workflows
4. Clear QA notes before manual execution

---

## Expected Output File

Create this file:

```text
docs/CodexTask-136-PharmaciesRLSPolicySQLDraft.md