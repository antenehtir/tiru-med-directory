# Codex Task 139: Pharmacies SQL Execution QA Record

## Purpose

This document is a manual QA record template for the pharmacy discovery SQL execution flow. It is intended to record the outcome after the pharmacy table, RLS policy, and fictional test data drafts have been reviewed and manually executed in a Supabase test project.

Do not execute SQL from this document. Do not paste Supabase keys, project URLs, screenshots containing secrets, private pharmacy contacts, patient data, prescription data, payment data, or service-role key values into this record.

## Execution Metadata

| Field | Manual QA Entry |
| --- | --- |
| QA status | Not run / Passed / Passed with notes / Blocked / Failed |
| QA owner | To be completed manually |
| Execution date | To be completed manually |
| Supabase environment | Test project only |
| Supabase project label | Non-secret project name only |
| SQL execution method | Supabase SQL Editor, manual execution after review |
| Table SQL source | `supabase/migrations_draft/010_create_pharmacies_table.sql` |
| RLS SQL source | `docs/CodexTask-136-PharmaciesRLSPolicySQLDraft.md` |
| Test data SQL source | `docs/CodexTask-137-PharmaciesTestDataSQLDraft.md` |
| Execution guide | `docs/CodexTask-138-PharmaciesManualSQLExecutionGuide.md` |
| Secrets reviewed? | Confirm no keys or env values are recorded here |

## Table Creation QA Checklist

Record the manual result after running the reviewed pharmacy table SQL draft.

- [ ] `public.pharmacies` table was created successfully.
- [ ] `id uuid primary key default gen_random_uuid()` exists.
- [ ] `slug text unique not null` exists.
- [ ] `display_name text not null` exists.
- [ ] Public discovery fields exist: `pharmacy_type`, `description`, `city`, `area`, `address_public`, `landmark_public`.
- [ ] Public service-preview fields exist: `service_modes`, `opening_hours_public`, `delivery_available`, `pickup_available`, `accepts_prescription_upload_preview`.
- [ ] Status fields exist with expected defaults: `listing_status`, `visibility_status`, `verification_status`.
- [ ] Timestamp fields exist: `last_confirmed_at`, `created_at`, `updated_at`.
- [ ] `pharmacy_type` constraint allows only the planned public discovery values.
- [ ] `listing_status` constraint uses: `draft`, `pending`, `active`, `rejected`, `archived`, `suspended`.
- [ ] `visibility_status` constraint uses: `public`, `hidden`, `internal`.
- [ ] `verification_status` constraint uses: `unverified`, `pending`, `verified`, `disputed`, `expired`.
- [ ] Helpful indexes exist for `slug`, status filters, `pharmacy_type`, city/area, `delivery_available`, and `pickup_available`.
- [ ] No medicine inventory fields were added.
- [ ] No medicine price fields were added.
- [ ] No prescription upload storage fields were added.
- [ ] No patient address fields were added.
- [ ] No payment, ordering, or controlled medication workflow fields were added.

## RLS QA Checklist

Record the manual result after running the reviewed pharmacy RLS SQL draft.

- [ ] RLS is enabled on `public.pharmacies`.
- [ ] `anon` has usage on schema `public`.
- [ ] `anon` has select permission on `public.pharmacies`.
- [ ] Public read policy exists for `anon`.
- [ ] Public read policy allows only rows where `listing_status = 'active'`.
- [ ] Public read policy allows only rows where `visibility_status = 'public'`.
- [ ] No `anon` insert policy exists.
- [ ] No `anon` update policy exists.
- [ ] No `anon` delete policy exists.
- [ ] No frontend service-role logic is included.
- [ ] No provider/admin policy was implemented yet.
- [ ] No private or patient-sensitive data is made readable through this policy.

## Test Data QA Checklist

Record the manual result after running the reviewed pharmacy fictional test data SQL draft.

- [ ] Fictional pharmacy test data inserted successfully.
- [ ] Full verification query returned the expected total row count: `8`.
- [ ] Active/public verification query returned the expected row count: `3`.
- [ ] Public active pharmacy row exists: `test-pharmacy-alpha`.
- [ ] Public active pharmacy row exists: `test-pharmacy-eta-minimal`.
- [ ] Public active pharmacy row exists: `test-pharmacy-zeta-disputed`.
- [ ] Blocked pending pharmacy row exists for later RLS/filter testing: `test-pharmacy-beta-pending`.
- [ ] Blocked archived pharmacy row exists for later RLS/filter testing: `test-pharmacy-gamma-archived`.
- [ ] Blocked hidden pharmacy row exists for later RLS/filter testing: `test-pharmacy-delta-hidden`.
- [ ] Blocked internal pharmacy row exists for later RLS/filter testing: `test-pharmacy-epsilon-internal`.
- [ ] Blocked suspended pharmacy row exists for later RLS/filter testing: `test-pharmacy-theta-suspended`.
- [ ] Minimal optional-field example remains valid.
- [ ] No real pharmacy names were used.
- [ ] No real phone numbers, emails, websites, maps links, or private contacts were used.
- [ ] No patient, prescription, booking, payment, admin, or license data was used.

## Public Read Verification

Use a public-read verification query after table creation, RLS, grants, and test data have been manually executed. Do not record keys or raw secret-bearing output.

Expected active/public rows:

| Expected slug | Expected display name | Expected listing/visibility | Expected verification |
| --- | --- | --- | --- |
| `test-pharmacy-alpha` | Test Pharmacy Alpha | active/public | verified |
| `test-pharmacy-eta-minimal` | Test Pharmacy Eta Minimal | active/public | unverified |
| `test-pharmacy-zeta-disputed` | Test Pharmacy Zeta Disputed | active/public | disputed |

Expected blocked rows that must not appear in the active/public read:

| Blocked slug | Reason |
| --- | --- |
| `test-pharmacy-beta-pending` | Pending listing |
| `test-pharmacy-gamma-archived` | Archived listing |
| `test-pharmacy-delta-hidden` | Hidden visibility |
| `test-pharmacy-epsilon-internal` | Internal visibility |
| `test-pharmacy-theta-suspended` | Suspended listing |

Manual verification notes:

- Active/public query result count: To be completed manually.
- Blocked rows excluded from active/public query: To be completed manually.
- No raw Supabase errors exposed: To be completed manually.
- No service-role key used: To be completed manually.

## Error Log

Use this table only for safe, non-secret debugging notes. Do not paste raw keys, full connection strings, project URLs, stack traces containing secrets, or screenshots with credentials.

| Time | Step | Error observed | Safe category | Action taken | Status | Follow-up notes |
| --- | --- | --- | --- | --- | --- | --- |
| To be completed manually | Table creation | None / summary only | table / constraint / index / unknown | To be completed manually | open / resolved | To be completed manually |
| To be completed manually | RLS policy | None / summary only | grant / policy / permission / unknown | To be completed manually | open / resolved | To be completed manually |
| To be completed manually | Test data | None / summary only | insert / constraint / data-shape / unknown | To be completed manually | open / resolved | To be completed manually |
| To be completed manually | Public read | None / summary only | empty-result / blocked-row-visible / permission / unknown | To be completed manually | open / resolved | To be completed manually |

## Final QA Result

Complete this section after manual execution and verification.

| Area | Result | Notes |
| --- | --- | --- |
| Table creation | Not run / Passed / Passed with notes / Blocked / Failed | To be completed manually |
| RLS policy | Not run / Passed / Passed with notes / Blocked / Failed | To be completed manually |
| Test data | Not run / Passed / Passed with notes / Blocked / Failed | To be completed manually |
| Public active/read verification | Not run / Passed / Passed with notes / Blocked / Failed | To be completed manually |
| Blocked row exclusion | Not run / Passed / Passed with notes / Blocked / Failed | To be completed manually |
| Secret safety | Not run / Passed / Passed with notes / Blocked / Failed | Confirm no keys, env values, or service-role values were exposed |

Final QA decision:

- [ ] Passed and ready for pharmacy public read helper implementation.
- [ ] Passed with notes; review notes before implementation.
- [ ] Blocked; resolve SQL, RLS, grant, or data issues first.
- [ ] Failed; do not continue to application read helpers yet.

Manual sign-off:

- QA owner: To be completed manually.
- Date: To be completed manually.
- Notes: To be completed manually.

## Assumptions

- Pharmacy discovery remains public listing discovery only.
- `public.pharmacies` is the only pharmacy table in scope for this QA record.
- RLS should expose only active/public pharmacy rows to `anon`.
- The expected fictional test data set contains eight total rows and three active/public rows.
- Backend order processing, inventory, prescriptions, payments, patient addresses, and controlled medication workflows are out of scope.

## Items Needing Manual Confirmation

- Confirm the table draft was reviewed before execution.
- Confirm RLS and anon grants were applied in the intended test project.
- Confirm row counts from full and active/public verification queries.
- Confirm blocked rows are present in the table but excluded from public reads.
- Confirm no secrets, real pharmacy data, private contact data, or patient data were recorded.

## Next Recommended Task

`CodexTask-140-PharmaciesPublicReadHelperImplementation.md`
