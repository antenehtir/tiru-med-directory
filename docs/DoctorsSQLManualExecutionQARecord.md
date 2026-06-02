# DigitalDirectory-v2 Doctors SQL Manual Execution QA Record

## Purpose

This document records the confirmed manual QA result for the doctors SQL drafts executed in the Supabase test project.

This is documentation-only. Codex did not run SQL, modify Supabase, modify app code, modify frontend UI, add new SQL, expose environment values, expose keys, or commit changes.

## SQL Drafts Manually Run

The following SQL drafts were manually run in Supabase SQL Editor:

1. `supabase/migrations_draft/004_create_doctors_table.sql`
2. `supabase/migrations_draft/005_doctors_rls_policy.sql`
3. `supabase/migrations_draft/006_doctors_test_data.sql`

## Execution Result

Confirmed manual result:

- `public.doctors` table was created.
- Doctors RLS policy was applied.
- Anon select grant was included.
- Fictional doctors test data was inserted.
- No app code was changed.
- No frontend UI was changed.
- No new SQL was created or run by Codex.

## Full Verification Result

The full verification query returned 7 fictional doctors.

Expected fictional test rows:

- Test Doctor Alpha
- Test Doctor Beta Pending
- Test Doctor Gamma Archived
- Test Doctor Delta Hidden
- Test Doctor Epsilon Internal
- Test Doctor Eta Minimal
- Test Doctor Zeta Disputed

## Active/Public Verification Result

The active/public verification query returned 3 rows:

| Display name | Expected behavior |
| --- | --- |
| Test Doctor Alpha | Active/public row appears |
| Test Doctor Eta Minimal | Active/public row appears with minimal optional fields |
| Test Doctor Zeta Disputed | Active/public row appears; disputed is verification status, not visibility status |

These are the expected future public read candidates under the current doctors RLS draft.

## Blocked Doctors Excluded

The following blocked doctors were excluded from the active/public verification query:

| Display name | Why excluded |
| --- | --- |
| Test Doctor Beta Pending | Pending/hidden |
| Test Doctor Gamma Archived | Archived/public |
| Test Doctor Delta Hidden | Active/hidden |
| Test Doctor Epsilon Internal | Active/internal |

This matches the intended public read boundary:

```sql
listing_status = 'active'
and visibility_status = 'public'
```

## RLS Confirmation

The doctors RLS draft confirmed the intended first public access model:

- `anon` can select active/public doctor rows.
- `anon` cannot insert rows by policy omission.
- `anon` cannot update rows by policy omission.
- `anon` cannot delete rows by policy omission.
- No authenticated/provider/admin/reviewer/super-admin policies were added.
- No service-role logic was added.

## Data Safety Confirmation

Confirmed:

- No real doctor data was used.
- No private phone numbers were used.
- No private email addresses were used.
- No license documents were used.
- No uploaded certificates were used.
- No patient data was used.
- No booking data was used.
- No payment data was used.
- No review data was used.
- No rating data was used.
- No service-role key was exposed.
- No environment values or keys are recorded in this document.

## Remaining Limitations

This QA record confirms the database-side doctors drafts only.

Still not implemented:

- Supabase doctor public read helper.
- Doctor row-to-public-card mapper.
- Controlled doctor source wrapper mode.
- `/doctors` Supabase wiring.
- `/doctors/[slug]` dynamic detail route.
- Doctor detail backend reads.
- Search, nearby, pharmacies, diagnostics, auth, booking, payment, review, or dashboard wiring.

## Recommended Next Task

Recommended next task:

```text
Doctors public read helper planning/implementation
```

The next task should:

- Select only public-safe doctor fields.
- Use only the public anon Supabase client.
- Filter `listing_status = 'active'`.
- Filter `visibility_status = 'public'`.
- Map rows safely toward `PublicProviderCard`.
- Avoid raw Supabase error exposure.
- Preserve static fallback.
- Avoid wiring public pages until helper QA passes.

## Summary

The doctors SQL drafts were manually executed and verified. The table was created, RLS was applied, anon select access was included, fictional test data was inserted, full verification returned 7 fictional doctors, and active/public verification returned only Test Doctor Alpha, Test Doctor Eta Minimal, and Test Doctor Zeta Disputed.

Blocked pending, archived, hidden, and internal doctors were excluded from active/public results, and no real doctor data or private/sensitive healthcare data was used.
