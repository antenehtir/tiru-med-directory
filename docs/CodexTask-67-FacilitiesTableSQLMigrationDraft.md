# Codex Task 67: Facilities Table SQL Migration Draft

## Project

DigitalDirectory-v2

## Goal

Create a draft SQL migration file for the first Supabase public listing table: `facilities`.

This task may create a SQL draft file in the repository, but the SQL must not be run yet.

Do not run SQL.

Do not create tables manually in Supabase yet.

Do not add RLS policies yet.

Do not insert test data.

Do not add Supabase reads.

Do not modify source wrapper code.

Do not modify mapper code.

Do not add authentication.

Do not add backend functionality.

Do not add protected routes.

Do not modify frontend UI.

---

## Important Context

Before making changes, read:

- docs/ProductVision.md
- docs/Architecture.md
- docs/DevelopmentRoadmap.md
- docs/SupabaseBackendPlanning.md
- docs/SupabaseIntegrationPhase1.md
- docs/SupabaseEnvironmentSetupGuide.md
- docs/SupabaseTestProjectChecklist.md
- docs/SupabaseTestProjectManualSetupGuide.md
- docs/PublicListingSchemaDraft.md
- docs/PublicListingSchemaSQLPlanning.md
- docs/RLSPolicyPlanning.md
- docs/SupabaseClientSetupPlanning.md
- docs/PublicListingReadImplementationPrep.md
- docs/SupabasePublicListingReadPlanning.md
- docs/SupabasePublicListingTestDataSetupPlan.md
- docs/PublicListingDataMapperPlanning.md
- docs/StaticToSupabaseSourceSwitchPlanning.md
- docs/PublicListingSourceWrapperQAPass.md
- docs/SeedDataStructure.md
- docs/CodexTask-65-SupabaseTestProjectManualSetupGuide.md
- docs/CodexTask-66-PublicListingSchemaSQLPlanning.md
- docs/CodexTask-67-FacilitiesTableSQLMigrationDraft.md

Also inspect these implementation files only for context:

```text
src/types/public-listings.ts
src/lib/public-listing-mappers.ts
src/lib/public-listing-source.ts
src/lib/supabase/env.ts
src/lib/supabase/browser-client.ts