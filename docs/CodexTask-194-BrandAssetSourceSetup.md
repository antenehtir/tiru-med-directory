# Codex Task 194: Brand Asset Source Setup

## Project

DigitalDirectory-v2

## Goal

Create a stable source folder and documentation record for Tiru MedDirectory brand assets before applying branding changes to the app UI.

This task follows:

* CodexTask-193-BrandAssetsUploadAndFrontendRefinementPlanning.md

This is a documentation and folder setup task.

Do not apply brand assets to the public app in this task.

---

## Important Context

Real facility profiles are now visible in the app.

The project is entering the branding and frontend refinement phase.

The next step is to create a safe location for brand source files such as logos, icons, color palette references, and brand guidelines.

---

## Main Objective

Create the brand source folder:

```text
docs/brand/source/
```

Because Git does not track empty folders, create a placeholder file:

```text
docs/brand/source/.gitkeep
```

Create or update this task record:

```text
docs/CodexTask-194-BrandAssetSourceSetup.md
```

---

## Brand Assets Expected Later

The project owner may later provide:

```text
primary logo SVG
primary logo PNG
icon-only SVG
icon-only PNG
dark logo variant
light logo variant
brand guideline document
color palette reference
typography notes
Figma export or screenshots
```

Do not invent or generate brand files in this task.

---

## Current Source Folder Status

Record that the brand source folder is prepared at:

```text
docs/brand/source/
```

Record that actual brand files are still pending unless already provided by the project owner.

---

## Future App Asset Direction

Later implementation tasks may copy reviewed brand assets into app/public folders such as:

```text
public/brand/
public/logos/
src/components/layout/
src/styles/
```

Do not create or modify these app/public asset folders in Task 194.

---

## Branding Safety Rules

Branding work must not break:

```text
/facilities
/facilities/[slug]
real facility profile data
pharmacy routes
diagnostics routes
doctor routes
```

Do not modify real facility JSON/data in this task.

---

## Recommended Next Task

The recommended next task should be:

```text
Task 195 — Brand Asset Intake and File Inventory
```

Purpose:

* Add the project owner’s actual logo/brand files into `docs/brand/source/`.
* Record the exact file names and types.
* Decide which files are suitable for app integration.
* Do not apply assets to the UI yet until reviewed.

---

## Scope

Allowed:

* Create `docs/brand/source/`.
* Create `docs/brand/source/.gitkeep`.
* Create/update this Task 194 markdown record.
* Document the expected brand files.
* Recommend next task.

Not allowed:

* Do not modify source code.
* Do not modify UI components.
* Do not modify CSS/theme files.
* Do not add logo to the app yet.
* Do not modify public app assets yet.
* Do not modify real facility JSON/data.
* Do not modify Supabase SQL, RLS, schema, or migrations.
* Do not import data to Supabase.
* Do not modify pharmacy, diagnostics, or doctors behavior.
* Do not create Task 195.

---

## Validation

Recommended checks:

```bash
git status
```

Confirm:

```text
docs/brand/source/.gitkeep exists
```

No lint/build is required because no app code should be modified.

---

## Acceptance Criteria

* Brand source folder exists.
* `.gitkeep` exists inside the brand source folder.
* Task 194 markdown record exists.
* Expected brand assets are documented.
* Brand safety rules are documented.
* Recommended next task is identified.
* No source code is modified.
* No UI/theme/app assets are modified.
* No real facility data is modified.
* Task 195 is not created.

---

## Deliverable

A safe brand source setup record and folder ready for future brand asset intake.

Do not proceed beyond Task 194.
