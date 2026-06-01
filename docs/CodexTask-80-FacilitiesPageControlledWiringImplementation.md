# Codex Task 80: Facilities Page Controlled Wiring Implementation

## Project

DigitalDirectory-v2

## Goal

Wire only the `/facilities` list page to the controlled public listing source wrapper so it can use the optional Supabase facilities source path with static fallback, while keeping the UI visually unchanged and avoiding broader page wiring.

This is the first controlled visible page connection step.

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
- docs/PublicListingDataMapperPlanning.md
- docs/StaticToSupabaseSourceSwitchPlanning.md
- docs/CodexTask-77-FacilitiesSourceWrapperControlledSwitchImplementation.md
- docs/CodexTask-78-FacilitiesSourceWrapperSwitchQAPass.md
- docs/CodexTask-79-FacilitiesPageControlledWiringPlanning.md
- docs/CodexTask-80-FacilitiesPageControlledWiringImplementation.md

Also inspect these implementation files:

```text
src/app/facilities/page.tsx
src/components/facilities/FacilitiesPage.tsx
src/lib/public-listing-source.ts
src/lib/supabase/facilities-public-read.ts
src/types/public-listings.ts
src/lib/public-listing-mappers.ts