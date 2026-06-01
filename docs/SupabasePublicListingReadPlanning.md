# DigitalDirectory-v2 Supabase Public Listing Read Planning

## Purpose

This document plans the first future Supabase public listing read implementation for DigitalDirectory-v2.

It is documentation-only. It does not add Supabase reads, database queries, source wrapper changes, mapper changes, public listing behavior changes, SQL, migrations, RLS policies, authentication, backend functionality, protected routes, or frontend UI changes.

The goal is to define a safe, narrow, read-only path before any Supabase data is connected to live public pages.

---

## Core Principle

The first Supabase public read should be boring, narrow, and reversible.

Static seed data should remain the default public source until the test project, public schema, RLS expectations, mapper output, source wrapper behavior, fallback behavior, and QA checklists are ready.

---

## Supabase Public Read Purpose

Future Supabase public listing reads should eventually:

- Replace selected static seed reads with reviewed public database records.
- Keep public browsing open and login-free.
- Read only published public-safe listing data.
- Use only public anon credentials protected by RLS.
- Preserve existing public routes and page behavior.
- Pass data through mapper DTOs before UI use.
- Keep static fallback available during rollout.
- Avoid service role access for public pages.

The first read should prove that one public listing slice can work safely before broader provider coverage is added.

---

## First Tables to Read

Recommended first implementation target:

```text
facilities
```

Why facilities first:

- Facility cards and detail previews already exist.
- Addis Health Center has a stable known detail route.
- Facility data is less provider-personal than doctor profile data.
- Facility fields align well with current static card/detail DTOs.

Likely first table group:

| Table | Purpose |
| --- | --- |
| `facilities` | Primary public facility records |
| `locations` | Public location labels |
| `facility_services` | Public facility/service relationship |
| `services` | Public service labels |
| `contact_channels` | Reviewed public contact/action labels later |
| `working_hours` | Reviewed public hours later |

Tables to defer:

- `doctors`
- `pharmacies`
- `diagnostics_providers`
- provider ownership tables
- request/review tables
- patient, booking, payment, document, notification, chatbot, and community tables

---

## Allowed Public Fields

Allowed first facility fields should be limited to public display needs.

Recommended facility fields:

- `id`
- `slug`
- `name`
- `facility_type`
- `summary`
- `description`
- `location_id`
- public address display, if reviewed
- `verification_status`
- `listing_status`
- `visibility_status`
- public service relationship IDs or labels
- public working hours summary, if reviewed
- public contact/action label, if reviewed

Recommended location fields:

- `id`
- `slug`
- `name`
- `display_name`
- `location_type`
- `parent_location_id`
- `is_public`

Recommended service fields:

- `id`
- `slug`
- `name`
- `category`
- public description
- active/public status

Allowed fields should map into the existing `PublicProviderCard` and `PublicProviderDetail` DTOs, not directly into UI components.

---

## Required Public Filters

Public reads must use eligibility filters before mapping records.

Required filters in plain language:

```text
Read only records where listing status is published and visibility status is public.
```

Additional recommended filters:

- Location records must be public/active.
- Service records must be public/active.
- Relationship rows must be reviewed or active.
- Contact channels must be reviewed and public.
- Working hours must be reviewed and public.
- Archived, hidden, rejected, draft, duplicate, private, or deleted records must be excluded.

Actual query syntax should be implemented only in a later code task.

---

## Public and Private Field Exclusions

Public reads must not select or expose private/internal fields.

Never select for public UI:

- Admin notes.
- Reviewer notes.
- Verification evidence.
- Private phone numbers.
- Private emails.
- Submitter contact details.
- Provider owner account IDs.
- Organization membership IDs.
- Source confidence.
- Review assignments.
- Audit logs.
- Request payloads.
- Patient identity data.
- Booking data.
- Payment or wallet data.
- Document vault data.
- Notification history.
- Chatbot logs.
- Private community memberships or posts.

If a field is not needed for the public card/detail DTO, it should not be selected in the first read.

---

## Missing Environment Variable Behavior

The current Supabase env helper returns a safe unavailable state when public env vars are missing.

Future read behavior should follow this rule:

```text
Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY means use static source fallback.
```

Required behavior:

- Do not crash during import.
- Do not crash during build.
- Do not render blank public pages.
- Do not attempt Supabase reads when env vars are missing.
- Do not print secret values.
- Do not require service role keys.
- Do not require authentication.

Relevant current files:

- `src/lib/supabase/env.ts`
- `src/lib/supabase/browser-client.ts`

---

## Source Wrapper Integration Plan

Current source wrapper:

- `src/lib/public-listing-source.ts`

Current source mode:

```text
static
```

Future integration plan:

1. Keep static source as default.
2. Add a future internal Supabase read helper outside public page components.
3. Keep Supabase availability behind the source wrapper.
4. Return the same public DTO shape from static and Supabase sources.
5. Fall back to static data when Supabase is unavailable or unsafe.
6. Keep public pages unchanged during the first query-helper task.
7. Wire one public surface only after mapper/source output is QA-approved.

Do not change the source wrapper in this planning task.

---

## Mapper Integration Plan

Current mapper files:

- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`

Future mapper plan:

- Add row-to-DTO mapping functions only after first row shapes are approved.
- Keep seed mappers intact.
- Map Supabase rows into `PublicProviderCard` and `PublicProviderDetail`.
- Normalize categories before UI use.
- Preserve known routes.
- Drop private/internal fields.
- Use missing-field fallbacks consistently.
- Do not pass raw Supabase rows into components.

Likely first future mapper:

```text
mapSupabaseFacilityRowToPublicCard
```

This function should not be created in this planning task.

---

## Static Fallback Behavior

Static fallback should remain available through the first Supabase read rollout.

Fallback should activate when:

- Public Supabase environment variables are missing.
- Supabase client is unavailable.
- A public read fails.
- RLS blocks data unexpectedly.
- Returned rows are empty during a controlled test.
- Mapper validation rejects unsafe or incomplete rows.

Fallback rules:

- Static fallback must preserve current public page behavior.
- Fallback must not merge unsafe partial data with static data without explicit rules.
- Fallback should be visible to developers through future diagnostics, not public UI.
- Fallback should not hide repeated staging failures from review.

---

## Error and Empty State Behavior

Future public read errors should be public-safe.

Error behavior:

- Do not show raw Supabase errors to public users.
- Do not expose table names, SQL-like details, policy names, keys, or internal IDs.
- Use static fallback where allowed.
- Log or surface developer-safe diagnostics only in future internal tooling.

Empty state behavior:

- If Supabase returns no rows during development, static fallback should protect public pages.
- If Supabase returns no rows in a deliberate test, QA should verify empty state handling separately.
- Public pages should not become blank because one provider type has no rows.

No error or empty-state code is added in this task.

---

## Test Data Requirements

First Supabase test data should be safe, fictional, and minimal.

Required test records:

- One published/public facility matching current card needs.
- One hidden or draft facility to confirm it is excluded.
- One archived or rejected facility to confirm it is excluded.
- One public location.
- One non-public location to confirm it is excluded.
- One active public service.
- One inactive/private service to confirm it is excluded.
- One public relationship between facility and service.

Rules:

- Do not use real patient data.
- Do not use real verification documents.
- Do not use real private provider contacts.
- Mark records clearly as test/mock.
- Keep data reversible and easy to delete.

---

## RLS Expectations

RLS must protect public read access before production use.

Expected plain-language policies:

- Anonymous users can read published public-safe facility records.
- Anonymous users can read active public location records.
- Anonymous users can read active public service records.
- Anonymous users can read reviewed public relationship rows.
- Anonymous users cannot read private/internal request, review, ownership, audit, patient, booking, payment, document, notification, chatbot, or community data.

RLS expectations:

- RLS should be enabled on all tables before testing public access.
- Public reads should work with anon credentials only.
- Service role key must not be used for public listing reads.
- Negative access tests should be performed before page wiring.

No RLS policies are added in this task.

---

## First Implementation Recommendation

Recommended first implementation slice:

```text
Read published public facilities from the Supabase test project into public DTOs, without wiring live pages yet.
```

Recommended steps:

1. Confirm test project and env setup.
2. Confirm facility table fields and RLS behavior.
3. Add a narrow read helper for facilities only.
4. Add a facility row mapper.
5. Keep source wrapper static by default.
6. Compare Supabase-mapped output with static-mapped output.
7. Run lint and build.
8. Do not wire public pages until output and fallback are QA-approved.

---

## QA Checklist Before Implementation

Before writing read code, confirm:

1. Test Supabase project exists.
2. Public anon key and URL are available locally outside git.
3. No service role key is needed.
4. No `.env` file is committed.
5. Public listing schema fields are approved for first facility slice.
6. RLS expectations are implemented and testable.
7. Static fallback expectations are clear.
8. Mapper output shape is reviewed.
9. Source wrapper remains static default.
10. Known routes are documented.
11. Private fields are listed and excluded.
12. QA owner knows the manual checks.

---

## QA Checklist After Implementation Later

After a future read implementation, verify:

1. Missing env vars still fall back safely.
2. Public reads use anon credentials only.
3. No service role key is referenced in browser code.
4. Facility query selects only allowed public fields.
5. Facility query filters published/public records.
6. Draft, hidden, archived, rejected, duplicate, and private records are excluded.
7. Mapper output matches `PublicProviderCard` and `PublicProviderDetail`.
8. Known static routes still work.
9. Static fallback still works.
10. Public pages are unchanged if not wired.
11. Lint passes.
12. Build passes.
13. Manual QA confirms no blank cards, blank buttons, or broken routes.

---

## What Must Not Be Implemented Yet

Do not implement the following in this planning task:

- Supabase reads.
- Database queries.
- Source wrapper changes.
- Mapper changes.
- Public page wiring.
- Public listing behavior changes.
- Frontend UI changes.
- SQL.
- Migrations.
- RLS policies.
- Authentication.
- Backend functionality.
- Protected routes.
- Data writes.
- Real provider data migration.

---

## Relationship to Existing Files

Current implementation files:

- `src/types/public-listings.ts` defines public DTO shapes.
- `src/lib/public-listing-mappers.ts` maps static seed records into public DTOs.
- `src/lib/public-listing-source.ts` keeps static data as the active source.
- `src/lib/supabase/env.ts` safely detects public Supabase env availability.
- `src/lib/supabase/browser-client.ts` returns a nullable browser client.

Current planning and QA files:

- `docs/PublicListingDataMapperPlanning.md` defines mapper strategy.
- `docs/StaticToSupabaseSourceSwitchPlanning.md` defines source-switch strategy.
- `docs/PublicListingSourceQAReadiness.md` defines QA readiness checks.
- `docs/PublicListingSourceWrapperQAPass.md` records the current source-wrapper QA pass.
- `docs/PublicListingReadImplementationPrep.md` defines rollout preparation.
- `docs/RLSPolicyPlanning.md` defines access policy expectations.

This document bridges those files into the next future read-only implementation step.

---

## MVP Recommendation

Current MVP recommendation:

- Keep public pages static.
- Do not add Supabase reads yet.
- Do not wire the source wrapper into pages.
- Do not modify mappers until row shapes are approved.
- Use a test Supabase project only.
- Start with facilities only.
- Keep static fallback active.
- Treat all seed trust labels as sample-only.
- Avoid auth, backend writes, SQL, migrations, and RLS code in frontend tasks.

---

## Risks

Key risks:

- Reading from Supabase before RLS is ready.
- Selecting private/internal fields by accident.
- Passing raw rows into UI components.
- Making public browsing depend on auth.
- Breaking static fallback.
- Breaking known routes.
- Displaying draft or hidden records publicly.
- Showing raw errors to public users.
- Using service role credentials in browser code.
- Treating test data or sample labels as real verification.
- Expanding to too many provider types in the first read task.

Mitigations:

- Start with one provider type.
- Select only allowed fields.
- Filter published/public records.
- Map rows into public DTOs.
- Keep static fallback.
- Use anon credentials only.
- Run negative RLS tests.
- Keep page wiring for a later task.

---

## Recommended Next Development Order

1. Keep current public pages static.
2. Confirm Supabase test project readiness.
3. Confirm `.env.local` values exist locally but are not committed.
4. Confirm public facility table fields.
5. Confirm RLS public read behavior.
6. Create a future facility read helper without page wiring.
7. Create a future facility row mapper.
8. Compare mapped Supabase output against static source output.
9. Run lint and build.
10. Perform QA using `PublicListingSourceQAReadiness.md`.
11. Update QA pass notes after implementation.
12. Wire one low-risk public page only after approval.

---

## Summary

The first Supabase public listing read should be a read-only, facility-only, test-project-backed implementation that keeps static data as the default source and never exposes private data.

This planning task adds no reads, queries, code changes, UI changes, SQL, migrations, RLS policies, auth, backend functionality, protected routes, or data writes. It defines the rules and checkpoints needed before the first real Supabase read implementation begins.
