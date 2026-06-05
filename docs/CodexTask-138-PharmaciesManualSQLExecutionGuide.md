# Codex Task 138: Pharmacies Manual SQL Execution Guide

## Safety Warning

Do not execute SQL from this task yet.

This document is a manual execution guide only. It does not run SQL, connect to Supabase, modify application code, install packages, commit changes, or push changes.

Only execute the referenced pharmacy SQL drafts manually after they have been reviewed, after the target Supabase project is confirmed to be a safe test project, and after rollback expectations are understood.

Never paste real service-role keys, project secrets, private pharmacy data, patient data, prescription data, inventory data, payment/order data, license documents, private contacts, or admin notes into SQL drafts, documentation, chat, screenshots, or frontend code.

## Purpose

This guide explains the safe manual order for running the pharmacy SQL drafts in Supabase SQL Editor.

The pharmacy setup is for public pharmacy discovery only. It should create a public-safe `public.pharmacies` table, enable public read-only RLS for active/public pharmacy rows, and insert fictional test rows that verify allowed and blocked visibility behavior.

This guide follows the same disciplined sequence used for facilities and doctors:

1. Create the table.
2. Add RLS and public read policy.
3. Insert fictional test data.
4. Verify full rows and active/public rows.
5. Confirm blocked rows remain hidden from public reads.

## Pre-Execution Checklist

Before any manual SQL execution:

1. Confirm this is a Supabase test project, not production.
2. Confirm the project URL and keys are not pasted into documentation, chat, screenshots, or source files.
3. Confirm no service-role key is needed for frontend/public reads.
4. Confirm the pharmacy table draft has been reviewed.
5. Confirm the pharmacy RLS draft has been reviewed.
6. Confirm the pharmacy test data draft has been reviewed.
7. Confirm rollback notes are understood.
8. Confirm no real pharmacy data is included.
9. Confirm no patient data is included.
10. Confirm no medicine inventory, prices, prescription upload data, delivery order data, payment data, private contacts, license documents, or admin notes are included.
11. Confirm the SQL Editor is open in the intended test project.
12. Confirm facilities/doctors setup does not need to be modified for this pharmacy task.

## Required Pharmacy SQL Docs To Review

Review these documents before manual execution:

- `docs/CodexTask-131-PharmaciesTableSQLDraft.md`
- `docs/CodexTask-136-PharmaciesRLSPolicySQLDraft.md`
- `docs/CodexTask-137-PharmaciesTestDataSQLDraft.md`

Also review the actual table draft file:

- `supabase/migrations_draft/010_create_pharmacies_table.sql`

Related execution patterns:

- `docs/CodexTask-70-FacilitiesSQLManualExecutionGuide.md`
- `docs/CodexTask-103-DoctorsSQLManualExecutionGuide.md`

## Recommended Execution Order

Recommended manual execution order:

1. `supabase/migrations_draft/010_create_pharmacies_table.sql`
2. Pharmacy RLS SQL draft from `docs/CodexTask-136-PharmaciesRLSPolicySQLDraft.md`
3. Pharmacy test data SQL draft from `docs/CodexTask-137-PharmaciesTestDataSQLDraft.md`

Do not insert test data before the table exists.

Do not rely on public read behavior until RLS and anon grants are reviewed and applied.

Do not create application reads until table, RLS, test data, and manual QA are confirmed.

## Manual Execution Steps In Supabase SQL Editor

### Step 1: Confirm Project Safety

In Supabase:

1. Open the intended test project.
2. Confirm the project is not production.
3. Open SQL Editor.
4. Do not paste or reveal service-role keys.
5. Do not include screenshots showing keys, secrets, or project credentials.

### Step 2: Run Pharmacies Table Draft

Manual source:

```text
supabase/migrations_draft/010_create_pharmacies_table.sql
```

Expected result:

- `public.pharmacies` table is created.
- Public-safe pharmacy discovery columns exist.
- Status constraints exist.
- Helpful indexes exist.
- Updated-at trigger helper exists or is replaced safely.
- No RLS policies are created by this step.
- No test data is inserted by this step.

Immediate table check:

```sql
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'pharmacies'
order by ordinal_position;
```

Confirm expected columns include:

- `id`
- `slug`
- `display_name`
- `pharmacy_type`
- `description`
- `city`
- `area`
- `address_public`
- `landmark_public`
- `service_modes`
- `opening_hours_public`
- `delivery_available`
- `pickup_available`
- `accepts_prescription_upload_preview`
- `listing_status`
- `visibility_status`
- `verification_status`
- `last_confirmed_at`
- `created_at`
- `updated_at`

### Step 3: Run Pharmacies RLS Draft

Manual source:

```text
docs/CodexTask-136-PharmaciesRLSPolicySQLDraft.md
```

Run only the reviewed SQL draft block from that document.

Expected result:

- RLS is enabled on `public.pharmacies`.
- `anon` receives `usage` on schema `public`.
- `anon` receives `select` on table `public.pharmacies`.
- One anon SELECT policy exists:

```text
Allow anon read active public pharmacies
```

The policy should allow only:

```text
listing_status = 'active'
visibility_status = 'public'
```

No insert, update, or delete policies should be created.

### Step 4: Run Pharmacies Test Data Draft

Manual source:

```text
docs/CodexTask-137-PharmaciesTestDataSQLDraft.md
```

Run only the reviewed SQL draft block from that document.

Expected inserted rows:

Public/active rows:

- `test-pharmacy-alpha`
- `test-pharmacy-eta-minimal`
- `test-pharmacy-zeta-disputed`

Blocked rows:

- `test-pharmacy-beta-pending`
- `test-pharmacy-gamma-archived`
- `test-pharmacy-delta-hidden`
- `test-pharmacy-epsilon-internal`
- `test-pharmacy-theta-suspended`

Expected total:

```text
8 rows
```

## Post-Execution Checks

### Full Verification Query

Run:

```sql
select
  slug,
  display_name,
  pharmacy_type,
  listing_status,
  visibility_status,
  verification_status
from public.pharmacies
where slug like 'test-pharmacy-%'
order by display_name;
```

Expected:

```text
8 rows
```

Expected rows:

- `test-pharmacy-alpha`
- `test-pharmacy-beta-pending`
- `test-pharmacy-delta-hidden`
- `test-pharmacy-epsilon-internal`
- `test-pharmacy-eta-minimal`
- `test-pharmacy-gamma-archived`
- `test-pharmacy-theta-suspended`
- `test-pharmacy-zeta-disputed`

### Public-Eligible Verification Query

Run:

```sql
select
  slug,
  display_name,
  pharmacy_type,
  listing_status,
  visibility_status,
  verification_status
from public.pharmacies
where listing_status = 'active'
  and visibility_status = 'public'
order by display_name;
```

Expected:

```text
3 rows
```

Expected rows:

- `test-pharmacy-alpha` - `Test Pharmacy Alpha` - `active/public` - `verified`
- `test-pharmacy-eta-minimal` - `Test Pharmacy Eta Minimal` - `active/public` - `unverified`
- `test-pharmacy-zeta-disputed` - `Test Pharmacy Zeta Disputed` - `active/public` - `disputed`

## RLS Verification Checks

Confirm RLS is enabled:

```sql
select
  relname,
  relrowsecurity
from pg_class
where relname = 'pharmacies';
```

Expected:

```text
relrowsecurity = true
```

Confirm policy exists:

```sql
select
  policyname,
  cmd,
  roles,
  qual
from pg_policies
where schemaname = 'public'
  and tablename = 'pharmacies'
order by policyname;
```

Expected:

- Policy name: `Allow anon read active public pharmacies`
- Command: `SELECT`
- Role includes `anon`
- Qual includes `listing_status = 'active'` and `visibility_status = 'public'`

Confirm no public write policies exist:

```sql
select
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename = 'pharmacies'
  and cmd in ('INSERT', 'UPDATE', 'DELETE');
```

Expected:

```text
0 rows
```

## Test Data Verification Checks

### Expected Public Read Results

Expected public read rows:

- `test-pharmacy-alpha`
- `test-pharmacy-eta-minimal`
- `test-pharmacy-zeta-disputed`

These are public because:

```text
listing_status = active
visibility_status = public
```

### Expected Hidden Or Blocked Records

Expected blocked rows:

- `test-pharmacy-beta-pending`
- `test-pharmacy-gamma-archived`
- `test-pharmacy-delta-hidden`
- `test-pharmacy-epsilon-internal`
- `test-pharmacy-theta-suspended`

Reasons:

- `test-pharmacy-beta-pending`: `listing_status = pending`
- `test-pharmacy-gamma-archived`: `listing_status = archived`
- `test-pharmacy-delta-hidden`: `visibility_status = hidden`
- `test-pharmacy-epsilon-internal`: `visibility_status = internal`
- `test-pharmacy-theta-suspended`: `listing_status = suspended`

### Minimal Row Check

Confirm the minimal public row remains readable:

```sql
select
  slug,
  display_name,
  description,
  address_public,
  landmark_public,
  opening_hours_public
from public.pharmacies
where slug = 'test-pharmacy-eta-minimal';
```

Expected:

- Row exists.
- Optional public fields may be `null`.
- Future mappers and UI should handle missing optional fields safely.

## Rollback Notes

Use rollback only in a reviewed test-project context.

### Roll Back Test Data Only

```sql
-- DRAFT ROLLBACK ONLY. REVIEW BEFORE RUNNING.

delete from public.pharmacies
where slug in (
  'test-pharmacy-alpha',
  'test-pharmacy-eta-minimal',
  'test-pharmacy-zeta-disputed',
  'test-pharmacy-beta-pending',
  'test-pharmacy-gamma-archived',
  'test-pharmacy-delta-hidden',
  'test-pharmacy-epsilon-internal',
  'test-pharmacy-theta-suspended'
);
```

### Roll Back Pharmacy RLS Policy Only

```sql
-- DRAFT ROLLBACK ONLY. REVIEW BEFORE RUNNING.

drop policy if exists "Allow anon read active public pharmacies" on public.pharmacies;

revoke select on table public.pharmacies from anon;
```

Only disable RLS if returning the test project to a pre-RLS state is explicitly intended:

```sql
-- DRAFT ONLY. REVIEW BEFORE RUNNING.
-- alter table public.pharmacies disable row level security;
```

### Roll Back Pharmacy Table

Do not drop `public.pharmacies` as part of ordinary RLS or test data rollback.

Only drop the table if a separate schema rollback is reviewed and approved.

## Clear Safety Warnings

Do not execute SQL until reviewed.

Do not run these drafts in production.

Do not connect application code to pharmacy Supabase reads as part of this manual setup.

Do not add pharmacy backend helpers as part of this task.

Do not add RLS write policies yet.

Do not add authenticated/provider/admin policies yet.

Do not add service-role logic.

Do not expose service-role keys.

Do not paste environment values, keys, or project secrets into documentation, chat, screenshots, or frontend code.

Do not use real pharmacy data.

Do not include patient data.

Do not include medicine inventory, medicine prices, prescription uploads, patient addresses, delivery orders, payment/order workflows, controlled medication workflows, private owner/staff contacts, license documents, or admin/reviewer notes.

## Assumptions And Items Needing Confirmation

Assumptions:

- `supabase/migrations_draft/010_create_pharmacies_table.sql` is the current reviewed table draft.
- The RLS SQL block in `docs/CodexTask-136-PharmaciesRLSPolicySQLDraft.md` is the current reviewed RLS draft.
- The test data SQL block in `docs/CodexTask-137-PharmaciesTestDataSQLDraft.md` is the current reviewed test data draft.
- Public read eligibility is `listing_status = 'active'` and `visibility_status = 'public'`.
- `verification_status` is a trust label and does not by itself determine public visibility.

Items to confirm before manual execution:

- The target project is a test project.
- The table name is exactly `public.pharmacies`.
- `service_modes` is still `text[]`.
- `pharmacy_type` constraints still match the drafted test values.
- Status constraints still match the drafted test values.
- `accepts_prescription_upload_preview` remains only a preview boolean and does not imply upload functionality.
- No private/workflow columns have been added to the public pharmacies table.

## Summary

The recommended manual execution order is:

1. Run `supabase/migrations_draft/010_create_pharmacies_table.sql`.
2. Run the RLS SQL draft from `docs/CodexTask-136-PharmaciesRLSPolicySQLDraft.md`.
3. Run the test data SQL draft from `docs/CodexTask-137-PharmaciesTestDataSQLDraft.md`.

After execution in a reviewed test project, the full verification query should return 8 fictional pharmacy rows, and the active/public verification query should return exactly 3 rows: `test-pharmacy-alpha`, `test-pharmacy-eta-minimal`, and `test-pharmacy-zeta-disputed`.
