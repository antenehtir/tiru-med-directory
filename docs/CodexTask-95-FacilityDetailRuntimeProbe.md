# Codex Task 95: Facility Detail Runtime Probe

## Goal

Create a temporary internal runtime probe to test the facility detail helper inside the real Next app runtime before wiring public detail pages.

## Context

Read:

- docs/FacilityDetailReadPlanning.md
- docs/FacilityDetailReadHelperQA.md
- docs/FacilityDetailHelperLiveReadInvestigation.md
- docs/CodexTask-92-FacilityDetailSupabaseReadHelperImplementation.md
- docs/CodexTask-94-FacilityDetailHelperLiveReadInvestigation.md

Inspect:

- src/lib/supabase/facilities-public-read.ts
- src/lib/supabase/public-client.ts
- src/app/facilities/page.tsx

## Implement

Add a temporary internal probe route such as:

```text
src/app/internal/facility-detail-probe/page.tsx