# Codex Task 75: Facilities Public Read QA Pass

## Project

DigitalDirectory-v2

## Goal

Perform a controlled QA pass on the facilities public Supabase read helper before wiring it into any public page or source switch.

This task should verify that the helper is safe, public-field-only, active/public-filtered, fallback-safe, and does not change current public listing behavior.

Do not wire public pages to Supabase.

Do not change current public listing behavior.

Do not modify frontend UI.

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
- docs/PublicListingDataMapperPlanning.md
- docs/StaticToSupabaseSourceSwitchPlanning.md
- docs/CodexTask-73-SupabaseLocalEnvManualSetupQA.md
- docs/CodexTask-74-FacilitiesPublicReadFunctionImplementation.md
- docs/CodexTask-75-FacilitiesPublicReadQAPass.md

Also inspect these implementation files:

```text
src/lib/supabase/env.ts
src/lib/supabase/browser-client.ts
src/lib/supabase/facilities-public-read.ts
src/types/public-listings.ts
src/lib/public-listing-mappers.ts
src/lib/public-listing-source.ts