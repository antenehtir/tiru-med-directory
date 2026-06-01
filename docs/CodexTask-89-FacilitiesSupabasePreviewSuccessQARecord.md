# Codex Task 89: Facilities Supabase Preview Success QA Record

## Project

DigitalDirectory-v2

## Goal

Create a documentation-only QA success record confirming that the `/facilities` page now successfully renders Supabase active/public facility rows after the Task 88 server-safe public read fix and Supabase anon grant correction.

This task is documentation-only.

Do not modify app code.

Do not modify frontend UI.

Do not add authentication.

Do not add backend functionality.

Do not add protected routes.

Do not add SQL migrations.

Do not insert test data.

Do not add patient data.

Do not add booking/payment/document/admin workflows.

Do not wire search, nearby, detail, doctors, pharmacies, or diagnostics pages.

---

## Important Context

Before making changes, read:

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

Also inspect these implementation files only for context:

```text
src/app/facilities/page.tsx
src/components/facilities/FacilitiesPage.tsx
src/lib/public-listing-source.ts
src/lib/supabase/facilities-public-read.ts
src/lib/supabase/public-client.ts
src/lib/supabase/env.ts
src/lib/supabase/browser-client.ts