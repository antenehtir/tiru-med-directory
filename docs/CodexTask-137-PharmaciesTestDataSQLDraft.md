# Codex Task 137: Pharmacies Test Data SQL Draft

## Warning

Do not execute this SQL yet.

This document is a planning and SQL draft artifact only. It has not been run against Supabase. It must be reviewed alongside the pharmacy schema planning document, pharmacies table draft, pharmacies RLS draft, and the facilities/doctors test data patterns before any manual execution.

This task does not connect to Supabase, does not execute SQL, does not modify application code, does not install packages, and does not commit or push changes.

## Purpose

The purpose of this draft is to define safe fictional pharmacy test data for the future `public.pharmacies` table.

The test rows are intended to verify:

- public pharmacy discovery reads
- RLS visibility rules
- active/public filtering
- hidden, internal, pending, archived, and suspended exclusion behavior
- pharmacy listing UI and future search/category behavior
- public-safe pharmacy fields only

This draft is for pharmacy discovery only. It does not add medicine inventory, medicine prices, prescription upload processing, patient addresses, delivery orders, payments, controlled medication workflows, private pharmacy contacts, staff contacts, admin notes, license documents, or real pharmacy data.

## Assumptions

This draft assumes:

- `public.pharmacies` exists from `supabase/migrations_draft/010_create_pharmacies_table.sql`.
- The RLS draft in `docs/CodexTask-136-PharmaciesRLSPolicySQLDraft.md` will later allow public anon reads only when:
  - `listing_status = 'active'`
  - `visibility_status = 'public'`
- `slug` is unique and not null.
- `display_name` is not null.
- `pharmacy_type` allows:
  - `retail`
  - `hospital_pharmacy`
  - `compounding`
  - `specialty`
  - `wholesale_preview`
  - `online_preview`
- `listing_status` allows:
  - `draft`
  - `pending`
  - `active`
  - `rejected`
  - `archived`
  - `suspended`
- `visibility_status` allows:
  - `public`
  - `hidden`
  - `internal`
- `verification_status` allows:
  - `unverified`
  - `pending`
  - `verified`
  - `disputed`
  - `expired`
- `service_modes` is a `text[]` column.
- `delivery_available`, `pickup_available`, and `accepts_prescription_upload_preview` are boolean preview/discovery fields only.
- `created_at` and `updated_at` use table defaults and do not need to be inserted manually.
- `id` uses `gen_random_uuid()` by default and does not need to be inserted manually.

Columns that need confirmation before manual execution:

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

## SQL Draft

```sql
-- DigitalDirectory-v2 pharmacies test data draft.
-- DRAFT ONLY. DO NOT RUN UNTIL REVIEWED AND APPROVED.
-- This file is a planning artifact for a future Supabase test project.
-- It has not been executed against Supabase.
--
-- Scope:
-- - Inserts fictional pharmacy discovery rows only.
-- - Includes active/public rows for public read testing.
-- - Includes blocked rows for RLS and filtering tests.
-- - Uses public-safe pharmacy discovery fields only.
--
-- Out of scope:
-- - No real pharmacy data.
-- - No medicine inventory.
-- - No medicine prices.
-- - No prescription uploads.
-- - No patient addresses.
-- - No delivery order processing.
-- - No payment/order workflow data.
-- - No controlled medication workflow.
-- - No private owner/staff contacts.
-- - No license documents.
-- - No admin/reviewer notes.

insert into public.pharmacies (
  slug,
  display_name,
  pharmacy_type,
  description,
  city,
  area,
  address_public,
  landmark_public,
  service_modes,
  opening_hours_public,
  delivery_available,
  pickup_available,
  accepts_prescription_upload_preview,
  listing_status,
  visibility_status,
  verification_status,
  last_confirmed_at
) values
  (
    'test-pharmacy-alpha',
    'Test Pharmacy Alpha',
    'retail',
    'Fictional retail pharmacy discovery row for public read testing.',
    'Addis Ababa',
    'Bole',
    'Fictional Bole public address',
    'Near fictional Alpha landmark',
    array['in_store', 'pickup_preview', 'phone_inquiry'],
    'Mon-Sat, 8:00 AM-8:00 PM',
    false,
    true,
    false,
    'active',
    'public',
    'verified',
    now()
  ),
  (
    'test-pharmacy-eta-minimal',
    'Test Pharmacy Eta Minimal',
    'hospital_pharmacy',
    null,
    'Addis Ababa',
    'Kazanchis',
    null,
    null,
    array['in_store'],
    null,
    false,
    true,
    false,
    'active',
    'public',
    'unverified',
    null
  ),
  (
    'test-pharmacy-zeta-disputed',
    'Test Pharmacy Zeta Disputed',
    'specialty',
    'Fictional specialty pharmacy discovery row with disputed verification status.',
    'Addis Ababa',
    'Megenagna',
    'Fictional Megenagna public address',
    'Near fictional Zeta landmark',
    array['in_store', 'pickup_preview', 'delivery_preview'],
    'Daily, 9:00 AM-7:00 PM',
    true,
    true,
    false,
    'active',
    'public',
    'disputed',
    now()
  ),
  (
    'test-pharmacy-beta-pending',
    'Test Pharmacy Beta Pending',
    'retail',
    'Fictional pending pharmacy row that should not be publicly readable.',
    'Addis Ababa',
    'Piassa',
    'Fictional Piassa public address',
    'Near fictional Beta landmark',
    array['in_store', 'phone_inquiry'],
    'Mon-Fri, 9:00 AM-5:00 PM',
    false,
    true,
    false,
    'pending',
    'public',
    'pending',
    null
  ),
  (
    'test-pharmacy-gamma-archived',
    'Test Pharmacy Gamma Archived',
    'online_preview',
    'Fictional archived pharmacy row that should not be publicly readable.',
    'Addis Ababa',
    'Arat Kilo',
    'Fictional Arat Kilo public address',
    'Near fictional Gamma landmark',
    array['online_preview'],
    'Hours archived',
    false,
    false,
    false,
    'archived',
    'public',
    'expired',
    null
  ),
  (
    'test-pharmacy-delta-hidden',
    'Test Pharmacy Delta Hidden',
    'compounding',
    'Fictional hidden pharmacy row that should not be publicly readable.',
    'Addis Ababa',
    'Mexico',
    'Fictional Mexico public address',
    'Near fictional Delta landmark',
    array['in_store', 'pickup_preview'],
    'Mon-Sat, 10:00 AM-6:00 PM',
    false,
    true,
    false,
    'active',
    'hidden',
    'verified',
    now()
  ),
  (
    'test-pharmacy-epsilon-internal',
    'Test Pharmacy Epsilon Internal',
    'wholesale_preview',
    'Fictional internal pharmacy row that should not be publicly readable.',
    'Addis Ababa',
    'Lideta',
    'Fictional Lideta public address',
    'Near fictional Epsilon landmark',
    array['in_store'],
    'Internal preview hours',
    false,
    false,
    false,
    'active',
    'internal',
    'unverified',
    null
  ),
  (
    'test-pharmacy-theta-suspended',
    'Test Pharmacy Theta Suspended',
    'retail',
    'Fictional suspended pharmacy row that should not be publicly readable.',
    'Addis Ababa',
    'Saris',
    'Fictional Saris public address',
    'Near fictional Theta landmark',
    array['in_store', 'phone_inquiry'],
    'Hours suspended',
    false,
    false,
    false,
    'suspended',
    'public',
    'expired',
    null
  );

-- Expected public read rows after RLS:
-- - test-pharmacy-alpha
-- - test-pharmacy-eta-minimal
-- - test-pharmacy-zeta-disputed
--
-- Expected blocked rows:
-- - test-pharmacy-beta-pending
-- - test-pharmacy-gamma-archived
-- - test-pharmacy-delta-hidden
-- - test-pharmacy-epsilon-internal
-- - test-pharmacy-theta-suspended
```

## Public/Active Examples

The active/public rows are:

- `test-pharmacy-alpha` - verified retail pharmacy discovery example
- `test-pharmacy-eta-minimal` - minimal active/public row with optional fields intentionally missing
- `test-pharmacy-zeta-disputed` - active/public row with `verification_status = 'disputed'`

These rows should be visible through the future public read path because they use:

```text
listing_status = active
visibility_status = public
```

## Hidden, Internal, Or Inactive Examples

The blocked rows are:

- `test-pharmacy-beta-pending` - pending listing
- `test-pharmacy-gamma-archived` - archived listing
- `test-pharmacy-delta-hidden` - active but hidden
- `test-pharmacy-epsilon-internal` - active but internal
- `test-pharmacy-theta-suspended` - suspended listing

These rows should not appear in public anonymous reads.

The term "private" is intentionally represented through `visibility_status = 'hidden'` or `visibility_status = 'internal'`. The `public.pharmacies` table should not contain private contact details, patient data, internal notes, or private workflow fields.

## Expected Public Read Results

After the table, RLS policy, and test data are reviewed and manually executed in a test project, this public-eligible query should return exactly three rows:

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

Expected rows:

- `test-pharmacy-alpha` - `Test Pharmacy Alpha` - `active/public` - `verified`
- `test-pharmacy-eta-minimal` - `Test Pharmacy Eta Minimal` - `active/public` - `unverified`
- `test-pharmacy-zeta-disputed` - `Test Pharmacy Zeta Disputed` - `active/public` - `disputed`

## Expected Hidden Records

The following rows should exist for negative QA but should not appear in active/public reads:

- `test-pharmacy-beta-pending`
- `test-pharmacy-gamma-archived`
- `test-pharmacy-delta-hidden`
- `test-pharmacy-epsilon-internal`
- `test-pharmacy-theta-suspended`

Suggested full verification query:

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

Expected full verification count:

```text
8 rows
```

Expected active/public verification count:

```text
3 rows
```

## Manual QA Checklist

Before running this draft manually:

1. Confirm this is a test Supabase project, not production.
2. Confirm `public.pharmacies` exists.
3. Confirm `public.pharmacies` has the columns used in the insert draft.
4. Confirm `pharmacy_type` constraints include all drafted values.
5. Confirm `listing_status`, `visibility_status`, and `verification_status` constraints match the drafted values.
6. Confirm `service_modes` accepts `text[]` values.
7. Confirm no real pharmacy names, addresses, phone numbers, websites, patient details, prescription data, inventory, payment/order data, license documents, private contacts, or admin notes are included.
8. Confirm RLS is reviewed before relying on anon public read behavior.
9. Confirm no service-role key is pasted into SQL, docs, screenshots, chat, or frontend code.

After running in a reviewed test project:

1. Run the full verification query and confirm 8 test rows exist.
2. Run the active/public verification query and confirm 3 rows appear.
3. Confirm pending, archived, hidden, internal, and suspended rows do not appear in public read results.
4. Confirm the minimal row does not break future mapper or UI assumptions.
5. Confirm `accepts_prescription_upload_preview` is treated only as a public preview flag and does not create upload functionality.
6. Confirm pickup/delivery booleans are treated only as discovery preview fields.

## Rollback Notes

If this draft is manually executed in a reviewed test project and needs to be reversed, use a reviewed rollback plan before running anything.

Possible rollback draft:

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

Do not drop the `public.pharmacies` table as part of a test data rollback.

## Summary

This Task 137 document drafts eight fictional pharmacy test rows:

- three active/public rows expected to appear in future public reads
- five blocked rows for pending, archived, hidden, internal, and suspended cases

The draft uses only public-safe pharmacy discovery fields and intentionally excludes real pharmacy data, medicine inventory, prices, prescription uploads, patient addresses, payment/order workflows, controlled medication workflows, private contacts, license documents, and admin/reviewer notes.

Do not execute this SQL until it has been reviewed against the final pharmacies table draft, RLS draft, and manual QA plan.
