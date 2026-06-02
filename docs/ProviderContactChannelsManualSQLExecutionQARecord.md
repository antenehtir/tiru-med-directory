# DigitalDirectory-v2 Provider Contact Channels Manual SQL Execution QA Record

## Purpose

This document records the confirmed manual QA result for the provider contact channels SQL drafts executed in the Supabase test project.

This is a documentation-only QA record. Codex did not run SQL, modify Supabase, modify app code, modify frontend UI, add new SQL, expose environment values, expose keys, or use a service-role key.

## Manual QA Purpose

The QA purpose is to capture what was manually executed and verified before any future app-facing provider contact channel read implementation begins.

This QA pass checks that:

- The provider contact channels table draft can be applied successfully in the test project.
- The provider contact channels RLS draft can be applied successfully after table creation.
- Fictional provider contact channel test rows can be inserted successfully after RLS is enabled.
- Active/public contact channel rows are identifiable for future public read testing.
- Blocked contact channel rows exist for later negative RLS and public read QA.
- No real contact data, patient data, private provider data, keys, or app behavior changes are part of this step.

## Supabase Test Project Execution Summary

The provider contact channels SQL manual execution was confirmed as successful in the Supabase test project.

Codex did not run SQL for this record. This document records the confirmed manual result supplied after execution.

## SQL Files Executed

The following draft SQL files were confirmed as executed manually:

1. `supabase/migrations_draft/007_create_provider_contact_channels_table.sql`
2. `supabase/migrations_draft/008_provider_contact_channels_rls_policy.sql`
3. `supabase/migrations_draft/009_provider_contact_channels_test_data.sql`

## Execution Order Used

The confirmed execution order was:

1. Provider contact channels table draft
2. Provider contact channels RLS policy draft
3. Provider contact channels test data draft

This matches `docs/ProviderContactChannelsManualSQLExecutionGuide.md`.

## Table Creation Result

Confirmed result:

- `007_create_provider_contact_channels_table.sql` ran successfully.
- `public.provider_contact_channels` was created in the Supabase test project.
- The table draft included public-safe contact/action channel fields only.
- The table draft included provider type constraints, channel type constraints, status constraints, lookup indexes, and the `updated_at` trigger helper.
- No RLS policies, test inserts, private owner contacts, private staff contacts, patient data, booking data, payment data, admin notes, license data, or real contact data were part of the table draft.

## RLS Execution Result

Confirmed result:

- `008_provider_contact_channels_rls_policy.sql` ran successfully.
- Row level security was enabled on `public.provider_contact_channels`.
- The anon SELECT grant was included.
- The anon SELECT policy was applied for active/public rows only.

The public read rule remains:

```sql
listing_status = 'active'
and visibility_status = 'public'
```

No insert, update, delete, authenticated, provider, admin, reviewer, super-admin, or service-role policies were added by this draft.

## Test Data Insertion Result

Confirmed result:

- `009_provider_contact_channels_test_data.sql` ran successfully.
- Fictional provider contact channel test rows were inserted.
- Full verification returned 17 fictional contact channel rows.
- Active/public verification returned 13 rows.
- The test data included readable active/public rows and blocked rows for later public read and RLS testing.
- No real contact data, private owner contacts, private doctor contacts, private staff contacts, patient data, booking data, payment data, admin data, license data, or RLS changes were added by the test data draft.

## Active/Public Verification Result

The active/public verification returned 13 rows for these fictional public providers:

- `test-facility-alpha`
- `test-facility-eta-minimal`
- `test-facility-zeta-disputed`
- `test-doctor-alpha`
- `test-doctor-eta-minimal`
- `test-doctor-zeta-disputed`

These providers are the expected future public read candidates under the current RLS draft.

## Channel Type Verification

Confirmed active/public channel types included:

- `phone`
- `whatsapp`
- `website`
- `maps`
- `social` with label `LinkedIn`
- `appointment`

LinkedIn is represented as:

```text
channel_type = social
label = LinkedIn
```

This matches the current SQL constraint, which allows `social` and does not require a separate `linkedin` channel type.

## Blocked Rows Excluded

Confirmed blocked contact rows did not appear in the active/public query.

Blocked categories covered:

- Pending contact channel rows
- Archived contact channel rows
- Hidden contact channel rows
- Internal contact channel rows

These rows should not appear in anon public read results under the current RLS rule because they are not both `active` and `public`.

## Safety Confirmation

This QA record confirms the intended safety boundary for this phase:

- No SQL was run by Codex for this documentation update.
- No Supabase project was modified by Codex.
- No app source wrapper or mapper code was changed.
- No frontend UI was changed.
- No backend functionality was added.
- No authentication or protected routes were added.
- No real keys were added to the repository.
- No real phone numbers were used.
- No real WhatsApp links were used.
- No real websites were used.
- No real maps links were used.
- No real emails were used.
- No private owner contacts were used.
- No private doctor contacts were used.
- No private staff contacts were used.
- No patient data was used.
- No booking data was used.
- No payment data was used.
- No admin data was used.
- No license data was used.
- No service-role key was exposed.

## Remaining Limitations

This QA record does not prove app-level public reads yet.

Remaining limitations:

- The app does not yet read `public.provider_contact_channels`.
- Facility detail pages do not yet compose provider contact channels from Supabase.
- Doctor detail pages do not yet compose provider contact channels from Supabase.
- Contact channel mapping into `PublicContactChannel` is not yet implemented.
- The current `PublicContactChannelType` app type may need future expansion before all planned channel types are consumed.
- Pharmacy, diagnostics, telemedicine, ambulance, and home care contact channels are not yet represented in app reads.
- Provider ownership, admin review, authenticated write policies, and audit logs remain intentionally out of scope.

## Recommended Next Task

Recommended next task:

```text
Provider Contact Channels Public Read Helper Implementation
```

That task should add a safe public read helper only, avoid wiring public pages at first, select public-safe fields only, filter active/public rows, avoid raw Supabase error exposure, avoid service-role key usage, and preserve all route isolation rules.

## Summary

Provider contact channels SQL was manually executed and verified in the Supabase test project.

The table was created, RLS was applied, anon SELECT was granted, fictional test data was inserted, full verification returned 17 rows, active/public verification returned 13 rows, expected active/public facility and doctor provider slugs were present, blocked hidden/internal/pending/archived rows were excluded from active/public results, no real contact or private data was used, and the recommended next task is Provider Contact Channels Public Read Helper Implementation.
