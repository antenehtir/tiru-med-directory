# Codex Task 90: Facilities Supabase Preview Stabilization QA

## Project

DigitalDirectory-v2

## Goal

Create a controlled stabilization QA record for the now-working `/facilities` Supabase preview mode.

This task should verify and document that `/facilities` continues to render active/public Supabase facility rows, blocked rows remain hidden, static fallback remains available, and no unrelated routes or private data flows were affected.

This task is documentation-first.

Do not redesign UI.

Do not expand route wiring.

Do not wire search.

Do not wire nearby.

Do not wire facility detail pages.

Do not wire doctors, pharmacies, or diagnostics pages.

Do not add authentication.

Do not add backend functionality.

Do not add protected routes.

Do not add SQL migrations.

Do not insert test data.

Do not add patient data.

Do not add booking/payment/document/admin workflows.

Do not use service role key.

Do not print real environment variable values.

Do not expose keys.

---

## Important Context

Before making changes, read:

- docs/FacilitiesSupabasePreviewSuccessQARecord.md
- docs/FacilitiesSupabasePreviewFallbackInvestigation.md
- docs/FacilitiesSupabasePreviewManualQAResultRecord.md
- docs/FacilitiesSupabasePreviewManualBrowserQA.md
- docs/FacilitiesSupabasePreviewModeQA.md
- docs/FacilitiesSupabasePreviewModePlanning.md
- docs/FacilitiesPageControlledWiringQAPass.md
- docs/FacilitiesSourceWrapperSwitchQAPass.md
- docs/FacilitiesPublicReadQAPass.md
- docs/FacilitiesSQLManualExecutionQA.md
- docs/SupabaseLocalEnvManualSetupQA.md
- docs/SupabasePublicListingReadPlanning.md
- docs/PublicListingSourceWrapperQAPass.md
- docs/CodexTask-88-FacilitiesSupabasePreviewServerSafeReadFix.md
- docs/CodexTask-89-FacilitiesSupabasePreviewSuccessQARecord.md
- docs/CodexTask-90-FacilitiesSupabasePreviewStabilizationQA.md

Also inspect these implementation files:

```text
src/app/facilities/page.tsx
src/components/facilities/FacilitiesPage.tsx
src/lib/public-listing-source.ts
src/lib/supabase/facilities-public-read.ts
src/lib/supabase/public-client.ts
src/lib/supabase/env.ts
src/lib/supabase/browser-client.ts
src/types/public-listings.ts
src/lib/public-listing-mappers.ts