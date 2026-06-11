# Codex Task 173: Public-Facing Placeholder Copy Cleanup Planning

## Project

DigitalDirectory-v2

## Goal

Create a focused planning document for cleaning public-facing placeholder, demo, sample, preview-only, fallback, and trust-reducing copy before MVP review.

This task follows:

* CodexTask-170-PlaceholderAndTestDataCleanupPlanning.md
* CodexTask-171-PlaceholderAndTestDataInventory.md
* CodexTask-172-PlaceholderAndTestDataClassificationDecisions.md

This is a documentation-only planning task.

Do not modify UI, source code, static data, routes, SQL, or real data in this task.

---

## Important Context

Task 172 identified the highest-priority cleanup decisions:

* Hide preview-only routes from public navigation, especially footer links.
* Replace homepage and search-results sample/mock wording with production-safe copy.
* Replace static seed/fallback provider records with real data when ready.
* Treat static sample detail routes as removal candidates after real data import.
* Keep diagnostics test rows, probe fixtures, and QA docs for internal QA until replacement QA data exists.

The next step is to plan public-facing copy cleanup before editing code.

---

## Main Objective

Create a planning record that identifies public-facing copy areas to clean first and recommends production-safe wording direction.

Recommended target file:

```text
docs/CodexTask-173-PublicFacingPlaceholderCopyCleanupPlanning.md
```

---

## Public-Facing Areas To Review

The planning document should focus on visible user-facing areas:

```text
src/components/layout/Footer.tsx
src/components/home/*
src/components/search-results/*
src/app/*
src/components/* detail/action panels
provider card components
empty-state components
correction request / add facility request UI
contact / feedback UI
```

---

## Copy Terms To Replace Or Review

Search for and classify public-facing wording such as:

```text
test
demo
sample
fictional
placeholder
preview
mock
static
fallback
coming soon
not listed yet
example
dummy
```

Also review copy that sounds too technical for public users, such as:

```text
fallback
runtime
probe
static data
seed data
Supabase
RLS
safe error
query failed
```

These should not appear in public user-facing UI during MVP review.

---

## Recommended Production-Safe Copy Direction

The plan should recommend replacing technical/demo wording with trust-building wording.

Examples:

### Instead of

```text
Not listed yet
```

Consider:

```text
Contact details are being verified.
```

or:

```text
Contact information will be added after verification.
```

### Instead of

```text
Sample provider
```

Use real provider names only, or hide until real provider data is ready.

### Instead of

```text
Preview
```

Consider:

```text
Service information
```

or remove the label if unnecessary.

### Instead of

```text
Fallback data
```

Do not show this to users. Use normal provider cards or hide the section.

---

## Required Planning Sections

The document should include:

1. Public-facing copy cleanup goal.
2. High-priority files/areas.
3. Terms to search and review.
4. Public trust risk levels.
5. Recommended wording principles.
6. Suggested replacements for common placeholder phrases.
7. What should be hidden versus rewritten.
8. What should remain internal QA only.
9. Validation plan for the future implementation task.
10. Recommended next task.

---

## Public Trust Risk Levels

Use these levels:

```text
High
Medium
Low
Internal only
Unknown
```

Examples:

* High: visible homepage/footer/search/detail copy that says demo, sample, fictional, placeholder, fallback.
* Medium: empty-state wording visible only when data is missing.
* Low: non-prominent UI labels that are not misleading.
* Internal only: docs, probes, scripts, QA records.
* Unknown: needs manual UI verification.

---

## Required Decision Table

Use a markdown table with columns:

```text
Area/File
Copy issue or search term
Risk level
Recommended action
Suggested production-safe direction
Notes
```

Recommended actions:

```text
Rewrite
Hide from public UI
Keep internal only
Needs product decision
Review manually
```

---

## Suggested Cleanup Priority

### Priority 1: Public navigation and trust surfaces

Focus:

```text
Footer
Home page hero/sections
Search result cards
Provider cards
Provider detail action panels
```

Reason:

These are most likely to be seen first by MVP reviewers.

### Priority 2: Empty states and unavailable-contact copy

Focus:

```text
Contact empty states
Not-listed copy
Unavailable states
Correction/add facility flows
```

Reason:

These affect user trust when data is incomplete.

### Priority 3: Internal QA and developer wording

Focus:

```text
docs
scripts
probe output
SQL test records
QA records
```

Reason:

These can remain internal and do not need public cleanup before MVP review.

---

## Recommended Future Implementation Task

The recommended next task should be:

```text
Task 174 — Public-Facing Placeholder Copy Cleanup Implementation
```

But Task 174 should only modify copy in high-priority public-facing UI areas, not data rows or SQL.

---

## Scope

Allowed:

* Create/update `docs/CodexTask-173-PublicFacingPlaceholderCopyCleanupPlanning.md`.
* Inspect Task 171 and Task 172 docs.
* Inspect public-facing files if needed.
* Document cleanup plan and recommended wording direction.

Not allowed:

* Do not modify source code.
* Do not modify UI copy yet.
* Do not delete test data.
* Do not modify Supabase SQL.
* Do not modify RLS, schema, or migrations.
* Do not insert real data.
* Do not change static data yet.
* Do not change routes.
* Do not modify probe scripts.
* Do not modify package scripts.
* Do not create Task 174.

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

* Public-facing placeholder copy cleanup planning document exists.
* High-priority public-facing areas are identified.
* Copy terms to replace/review are listed.
* Production-safe wording direction is documented.
* Suggested replacements are included.
* Hide-versus-rewrite guidance is included.
* Internal QA-only content is separated from public UI content.
* Recommended next task is identified.
* No source code is modified.
* No SQL/RLS/migration/schema files are modified.
* No data is deleted or inserted.
* Task 174 is not created.

---

## Deliverable

A focused planning document for public-facing placeholder copy cleanup.

Do not proceed beyond Task 173.
