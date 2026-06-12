# Codex Task 192: Real Facilities UI QA and Refinement Backlog

## Project

DigitalDirectory-v2

## Goal

Create a QA record for the first live app preview of real facility profiles after wiring the simple facility profiles JSON into the Facilities UI.

This task follows:

- `docs/CodexTask-189-SimpleFacilityProfilesJSONExtraction.md`
- `docs/CodexTask-190-SimpleFacilityProfilesJSONExtractionQA.md`
- `docs/CodexTask-191-WireSimpleFacilityProfilesJSONIntoFacilitiesUI.md`

This is a documentation-only QA and refinement-backlog task. No source code, UI copy, branding, extracted JSON, `src/data`, SQL, RLS, schema, migrations, probes, package scripts, or Supabase data were modified.

---

## QA Status

```text
Passed with known frontend/UI refinement backlog.
```

Real facility data is now visible in the app preview, and the remaining issues are recorded for the frontend/UI refinement phase.

---

## Local Preview Record

Local development server:

```text
npm.cmd run dev
```

Local app URL:

```text
http://localhost:3000
```

Facilities page checked:

```text
http://localhost:3000/facilities
```

Observed result:

```text
Real facilities are visible on /facilities.
Real facility names are displayed from the extracted facility profiles JSON.
Facility detail routes are available by slug.
```

---

## Data And Database Scope Confirmation

| Check | Result |
| --- | --- |
| No Supabase import was performed | Confirmed |
| No SQL changes were made | Confirmed |
| No RLS changes were made | Confirmed |
| No schema changes were made | Confirmed |
| No migration changes were made | Confirmed |
| Extracted JSON was not modified | Confirmed |
| `src/data` was not modified in Task 192 | Confirmed |
| No probes were modified | Confirmed |
| No package scripts were modified | Confirmed |
| No branding/logo/color changes were made | Confirmed |
| Task 193 was not created | Confirmed |

---

## Known Issue Recorded

Known issue:

```text
Some facility detail tabs or interactive sections are not working correctly.
```

Disposition:

```text
Deferred to the frontend/UI refinement phase.
```

Task 192 does not fix this issue. It records the issue so it can be planned alongside brand assets, layout polish, and interaction QA.

---

## Refinement Backlog

| Backlog area | Status | Notes |
| --- | --- | --- |
| Facility detail tabs/interactions | Deferred | Review tab behavior, active states, section switching, and broken interactions. |
| Facility detail action panels | Deferred | Review action layout, missing data behavior, and call-to-action consistency. |
| Contact link behavior | Deferred | Check phone, email, web, map, and social/booking links for safe behavior. |
| Mobile spacing | Deferred | Review real-data cards/detail pages on narrow screens. |
| Desktop spacing | Deferred | Review page density, section rhythm, and detail layout alignment. |
| Card height consistency | Deferred | Normalize listing-card height and content overflow where real data varies. |
| Facility category filters | Deferred | Review category filter values and filtering behavior with real facility categories. |
| Search/filter behavior | Deferred | Confirm search and filters work with real facility names, categories, areas, and services. |
| Missing-field display behavior | Deferred | Hide missing fields or show production-safe wording consistently. |
| Legacy sample route behavior | Deferred | Review how legacy/sample routes behave after real facility wiring. |
| Overall visual polish | Deferred | Address brand, spacing, alignment, visual hierarchy, and interaction polish. |

---

## Frontend Refinement Notes

The refinement phase should preserve the real facility data wiring and avoid database/import changes unless a later task explicitly authorizes them.

Recommended review surfaces:

- `/facilities`
- facility detail routes by slug
- facility listing cards
- facility detail tabs and interactive sections
- action/contact panels
- mobile viewport
- desktop viewport
- search and filtering controls
- missing-field states
- legacy/sample route behavior

---

## Recommended Next Task

Recommended next task:

```text
Task 193 - Brand Assets Upload and Frontend Refinement Planning
```

Purpose:

- Bring in the project owner's logo and brand guideline.
- Plan frontend refinement without changing source code during Task 192.
- Review colors, typography, spacing, cards, buttons, navigation, and facility UI polish in a dedicated planning task.
- Plan fixes for facility detail tabs/interactions and other deferred UI issues.

Task 193 was not created as part of this task.

---

## Scope Confirmation

For Task 192:

- Only `docs/CodexTask-192-RealFacilitiesUIQAAndRefinementBacklog.md` was updated.
- No source code was modified.
- No UI copy was modified.
- No branding, logo, or colors were modified.
- No SQL was modified.
- No RLS was modified.
- No schema was modified.
- No migrations were modified.
- No Supabase import was performed.
- Extracted JSON was not modified.
- `src/data` was not modified.
- Probes were not modified.
- Package scripts were not modified.
- Task 193 was not created.

---

## QA Summary

Real facilities are visible on `/facilities`, real facility names are displayed, and facility detail routes are available by slug. The known facility detail tab/interaction issue is recorded and deferred to frontend/UI refinement. The refinement backlog is ready for the branding and frontend refinement planning phase.
