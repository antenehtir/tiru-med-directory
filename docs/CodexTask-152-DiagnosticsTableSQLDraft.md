# Codex Task 152: Diagnostics Table SQL Draft

## Project

DigitalDirectory-v2

## Goal

Create a SQL draft for the diagnostics discovery table based on the planning completed in Task 151.

This task follows:

- CodexTask-151-DiagnosticsDiscoverySchemaPlanning.md

The purpose is to draft the public-safe diagnostics provider discovery table only.

This task should create a SQL draft document.

Do not execute SQL in this task.

---

## Important Context

Before writing the SQL draft, read:

- docs/CodexTask-151-DiagnosticsDiscoverySchemaPlanning.md
- docs/CodexTask-131-PharmaciesTableSQLDraft.md
- docs/CodexTask-100-DoctorsTableSQLDraft.md
- docs/CodexTask-67-FacilitiesTableSQLMigrations.md
- docs/DataModelContentStructure.md
- docs/DevelopmentRoadmap.md

Use the existing facilities, doctors, and pharmacies SQL/table patterns as the main guide.

---

## Main Objective

Create a SQL draft for:

```text
public.diagnostic_providers