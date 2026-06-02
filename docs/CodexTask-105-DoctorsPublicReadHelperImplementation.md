# Codex Task 105: Doctors Public Read Helper Implementation

## Goal

Implement a safe Supabase public doctors list read helper.

Do not wire the doctors page yet.

## Context

Read:

- docs/DoctorsSchemaSQLPlanning.md
- docs/DoctorsSQLManualExecutionQARecord.md
- docs/FacilitiesSupabasePreviewStabilizationQA.md
- docs/CodexTask-104-DoctorsSQLManualExecutionQARecord.md

Inspect:

- src/lib/supabase/public-client.ts
- src/lib/supabase/facilities-public-read.ts
- src/lib/public-listing-mappers.ts
- src/types/public-listings.ts
- src/lib/public-listing-source.ts
- supabase/migrations_draft/004_create_doctors_table.sql
- supabase/migrations_draft/005_doctors_rls_policy.sql
- supabase/migrations_draft/006_doctors_test_data.sql

## Implement

Add a safe public doctors list read helper, likely:

```ts
getSupabasePublicDoctorCards()