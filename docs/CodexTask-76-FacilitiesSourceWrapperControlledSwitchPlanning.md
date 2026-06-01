# Codex Task 76: Facilities Source Wrapper Controlled Switch Planning

## Project

DigitalDirectory-v2

## Goal

Create a documentation-only plan for safely switching the facilities source wrapper from static-only behavior toward a controlled Supabase-backed facilities source, while preserving static fallback and avoiding public UI breakage.

This task is documentation-only.

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
- docs/FacilitiesPublicReadQAPass.md
- docs/PublicListingDataMapperPlanning.md
- docs/StaticToSupabaseSourceSwitchPlanning.md
- docs/CodexTask-74-FacilitiesPublicReadFunctionImplementation.md
- docs/CodexTask-75-FacilitiesPublicReadQAPass.md
- docs/CodexTask-76-FacilitiesSourceWrapperControlledSwitchPlanning.md

Also inspect these implementation files:

```text
src/lib/public-listing-source.ts
src/lib/supabase/facilities-public-read.ts
src/lib/supabase/env.ts
src/lib/supabase/browser-client.ts
src/types/public-listings.ts
src/lib/public-listing-mappers.ts