# Codex Task 83: Facilities Supabase Preview Mode Implementation

## Project

DigitalDirectory-v2

## Goal

Enable Supabase preview mode only for the `/facilities` list page by using the existing public listing source wrapper’s controlled Supabase facilities mode.

This task should make `/facilities` request Supabase-backed facility cards through the source wrapper, while preserving static fallback, keeping the UI visually unchanged, and avoiding any broader route wiring.

Do not call the Supabase helper directly from the page.

Do not wire search.

Do not wire nearby.

Do not wire facility detail pages.

Do not wire doctors, pharmacies, or diagnostics pages.

Do not modify frontend UI styling.

Do not add authentication.

Do not add backend functionality.

Do not add protected routes.

Do not add SQL.

Do not add migrations.

Do not add RLS policies.

Do not insert test data.

Do not add patient data.

Do not add booking/payment/document/admin workflows.

---

## Important Context

Before making changes, read:

- docs/ProductVision.md
- docs/Architecture.md
- docs/DevelopmentRoadmap.md
- docs/SupabaseBackendPlanning.md
- docs/SupabaseIntegrationPhase1.md
- docs/SupabaseEnvironmentSetupGuide.md
- docs/SupabaseTestProjectManualSetupGuide.md
- docs/SupabaseLocalEnvSetupGuide.md
- docs/SupabaseLocalEnvManualSetupQA.md
- docs/PublicListingSchemaSQLPlanning.md
- docs/FacilitiesSQLManualExecutionQA.md
- docs/SupabasePublicListingReadPlanning.md
- docs/SupabasePublicListingTestDataSetupPlan.md
- docs/PublicListingSourceWrapperQAPass.md
- docs/FacilitiesPublicReadQAPass.md
- docs/FacilitiesSourceWrapperControlledSwitchPlanning.md
- docs/FacilitiesSourceWrapperSwitchQAPass.md
- docs/FacilitiesPageControlledWiringPlanning.md
- docs/FacilitiesPageControlledWiringQAPass.md
- docs/FacilitiesSupabasePreviewModePlanning.md
- docs/CodexTask-80-FacilitiesPageControlledWiringImplementation.md
- docs/CodexTask-81-FacilitiesPageControlledWiringQAPass.md
- docs/CodexTask-82-FacilitiesSupabasePreviewModePlanning.md
- docs/CodexTask-83-FacilitiesSupabasePreviewModeImplementation.md

Also inspect these implementation files:

```text
src/app/facilities/page.tsx
src/components/facilities/FacilitiesPage.tsx
src/lib/public-listing-source.ts
src/lib/supabase/facilities-public-read.ts
src/lib/supabase/env.ts
src/lib/supabase/browser-client.ts
src/types/public-listings.ts
src/lib/public-listing-mappers.ts