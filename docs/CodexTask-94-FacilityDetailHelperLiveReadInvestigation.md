# Codex Task 94: Facility Detail Helper Live Read Investigation

## Goal

Investigate why the temporary runner could not confirm live Supabase facility detail helper reads.

Do not wire detail routes yet.

## Context

Read:

- docs/FacilityDetailReadPlanning.md
- docs/FacilityDetailReadHelperQA.md
- docs/CodexTask-92-FacilityDetailSupabaseReadHelperImplementation.md
- docs/CodexTask-93-FacilityDetailReadHelperQA.md

Inspect:

- src/lib/supabase/facilities-public-read.ts
- src/lib/supabase/public-client.ts
- src/lib/supabase/env.ts
- src/lib/public-listing-source.ts
- src/types/public-listings.ts

## Investigate

Find why:

- list read works on /facilities
- but temporary detail helper invocation returned generic error

Check:

- helper query syntax
- `.single()` vs `.maybeSingle()` behavior
- selected fields
- mapper/type assumptions
- public client availability in test/runtime
- whether table data supports requested slugs
- whether raw error is being safely hidden too aggressively

Do not print env values.
Do not expose keys.
Do not use service role key.
Do not add SQL/RLS/test data.
Do not modify UI.
Do not wire routes.

## Allowed

A tiny safe fix is allowed if the issue is obvious, for example:

- use `.maybeSingle()` instead of `.single()`
- adjust safe error handling
- fix mapper issue
- fix return shape bug

## QA

If safe, run a temporary local test, not committed.

Test positive slugs:

- test-facility-alpha
- test-facility-eta-minimal
- test-facility-zeta-disputed

Test blocked slugs:

- test-facility-beta-pending
- test-facility-gamma-archived
- test-facility-delta-hidden
- test-facility-epsilon-internal

Expected:

- positive slugs return success/detail
- blocked slugs return not-found/null
- unknown slug returns not-found/null

Run:

```bash
npm.cmd run lint
npm.cmd run build