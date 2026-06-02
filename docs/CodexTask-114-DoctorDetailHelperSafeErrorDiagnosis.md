# Codex Task 114: Doctor Detail Helper Safe Error Diagnosis

## Goal

Diagnose why `getSupabasePublicDoctorDetailBySlug()` returns safe `error` for all slugs in the internal doctor detail runtime probe, while `getSupabasePublicDoctorCards()` works.

Do not wire `/doctors/[slug]` yet.

## Context

Read:

- docs/DoctorDetailReadPlanning.md
- docs/DoctorsPageSupabaseWiringQARecord.md
- docs/CodexTask-112-DoctorDetailSupabaseReadHelperImplementation.md
- docs/CodexTask-113-DoctorDetailRuntimeProbe.md

Inspect:

- src/app/internal/doctor-detail-probe/page.tsx
- src/lib/supabase/doctors-public-read.ts
- src/lib/supabase/public-client.ts
- src/lib/public-listing-mappers.ts
- src/types/public-listings.ts
- supabase/migrations_draft/004_create_doctors_table.sql

## Investigate

Compare the working doctors list helper and failing doctor detail helper.

Check:

- selected columns in list helper vs detail helper
- whether detail helper selects a column not present in `public.doctors`
- whether detail helper uses the same public client path as list helper
- mapper expectations
- return shape
- `maybeSingle()` usage
- whether safe error handling hides a useful safe category
- whether `PublicProviderDetail` requires fields not available from doctor rows

## Allowed Fix

A small safe fix is allowed if obvious.

Examples:

- remove non-existent selected column
- align detail select fields with actual doctors table
- fix doctor detail mapper
- add safe error code/category without exposing raw secrets
- adjust return shape
- reuse the working list-row mapping pattern where appropriate

## Safety Rules

Do not:

- expose env values
- expose keys
- use service role key
- add SQL/RLS/test data
- modify public UI
- wire `/doctors/[slug]`
- add auth/backend/protected routes

## QA

Use existing probe:

```text
/internal/doctor-detail-probe