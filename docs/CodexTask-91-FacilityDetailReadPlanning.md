# Codex Task 91: Facility Detail Read Planning

## Project

DigitalDirectory-v2

## Goal

Create a documentation-only plan for safely adding Supabase-backed facility detail reads by slug after the `/facilities` list page has successfully rendered Supabase active/public rows.

This task is documentation-only.

Do not implement facility detail reads yet.

Do not modify app code.

Do not modify frontend UI.

Do not add authentication.

Do not add backend functionality.

Do not add protected routes.

Do not add SQL migrations.

Do not insert test data.

Do not add patient data.

Do not add booking/payment/document/admin workflows.

Do not wire search, nearby, doctors, pharmacies, or diagnostics pages.

---

## Important Context

Before making changes, read:

- docs/FacilitiesSupabasePreviewStabilizationQA.md
- docs/FacilitiesSupabasePreviewSuccessQARecord.md
- docs/FacilitiesSupabasePreviewFallbackInvestigation.md
- docs/FacilitiesSupabasePreviewManualBrowserQA.md
- docs/FacilitiesSupabasePreviewModeQA.md
- docs/FacilitiesPageControlledWiringQAPass.md
- docs/FacilitiesSourceWrapperSwitchQAPass.md
- docs/FacilitiesPublicReadQAPass.md
- docs/FacilitiesSQLManualExecutionQA.md
- docs/SupabaseLocalEnvManualSetupQA.md
- docs/SupabasePublicListingReadPlanning.md
- docs/PublicListingSourceWrapperQAPass.md
- docs/PublicListingDataMapperPlanning.md
- docs/CodexTask-88-FacilitiesSupabasePreviewServerSafeReadFix.md
- docs/CodexTask-89-FacilitiesSupabasePreviewSuccessQARecord.md
- docs/CodexTask-90-FacilitiesSupabasePreviewStabilizationQA.md
- docs/CodexTask-91-FacilityDetailReadPlanning.md

Also inspect these implementation files:

```text
src/app/facilities/page.tsx
src/app/facilities/[slug]
src/components/facilities/FacilitiesPage.tsx
src/lib/public-listing-source.ts
src/lib/supabase/facilities-public-read.ts
src/lib/supabase/public-client.ts
src/types/public-listings.ts
src/lib/public-listing-mappers.ts# Codex Task 91: Facility Detail Read Planning

## Project

DigitalDirectory-v2

## Goal

Create a documentation-only plan for safely adding Supabase-backed facility detail reads by slug after the `/facilities` list page has successfully rendered Supabase active/public rows.

This task is documentation-only.

Do not implement facility detail reads yet.

Do not modify app code.

Do not modify frontend UI.

Do not add authentication.

Do not add backend functionality.

Do not add protected routes.

Do not add SQL migrations.

Do not insert test data.

Do not add patient data.

Do not add booking/payment/document/admin workflows.

Do not wire search, nearby, doctors, pharmacies, or diagnostics pages.

---

## Important Context

Before making changes, read:

- docs/FacilitiesSupabasePreviewStabilizationQA.md
- docs/FacilitiesSupabasePreviewSuccessQARecord.md
- docs/FacilitiesSupabasePreviewFallbackInvestigation.md
- docs/FacilitiesSupabasePreviewManualBrowserQA.md
- docs/FacilitiesSupabasePreviewModeQA.md
- docs/FacilitiesPageControlledWiringQAPass.md
- docs/FacilitiesSourceWrapperSwitchQAPass.md
- docs/FacilitiesPublicReadQAPass.md
- docs/FacilitiesSQLManualExecutionQA.md
- docs/SupabaseLocalEnvManualSetupQA.md
- docs/SupabasePublicListingReadPlanning.md
- docs/PublicListingSourceWrapperQAPass.md
- docs/PublicListingDataMapperPlanning.md
- docs/CodexTask-88-FacilitiesSupabasePreviewServerSafeReadFix.md
- docs/CodexTask-89-FacilitiesSupabasePreviewSuccessQARecord.md
- docs/CodexTask-90-FacilitiesSupabasePreviewStabilizationQA.md
- docs/CodexTask-91-FacilityDetailReadPlanning.md

Also inspect these implementation files:

```text
src/app/facilities/page.tsx
src/app/facilities/[slug]
src/components/facilities/FacilitiesPage.tsx
src/lib/public-listing-source.ts
src/lib/supabase/facilities-public-read.ts
src/lib/supabase/public-client.ts
src/types/public-listings.ts
src/lib/public-listing-mappers.ts