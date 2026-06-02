# DigitalDirectory-v2 Provider Contact Channels Manual SQL Execution Guide

## Purpose

This guide explains how to manually run the provider contact channels SQL drafts in a Supabase test project after review.

This is documentation-only. Codex does not run SQL, modify Supabase, modify app code, modify frontend UI, add new SQL, expose keys, expose environment values, or use a service-role key.

## Required Pre-Checks

Before running any SQL manually:

- Confirm the Supabase project is a test project, not production.
- Confirm the facilities and doctors SQL drafts have already been executed and verified if you want provider slugs to align with existing fictional providers.
- Confirm all three provider contact channel SQL drafts have been reviewed.
- Confirm the test data draft uses fictional contact data only.
- Confirm no real phone numbers, WhatsApp links, websites, maps links, emails, provider owner contacts, doctor contacts, staff contacts, patient data, booking data, payment data, admin data, license data, or verification evidence is present.
- Confirm you are not pasting keys, project URLs, or screenshots containing secrets into chat or documentation.

## Safe Execution Order

Run the provider contact channels SQL drafts manually in this order:

1. `supabase/migrations_draft/007_create_provider_contact_channels_table.sql`
2. `supabase/migrations_draft/008_provider_contact_channels_rls_policy.sql`
3. `supabase/migrations_draft/009_provider_contact_channels_test_data.sql`

Do not run the test data draft before the table draft.

Do not run the RLS draft before the table exists.

Do not add extra SQL while executing these drafts.

## Manual Supabase SQL Editor Steps

1. Open the Supabase test project.
2. Open the SQL Editor.
3. Create a new query tab.
4. Paste the full contents of `007_create_provider_contact_channels_table.sql`.
5. Review the pasted SQL one more time.
6. Run the table draft.
7. Confirm it completes successfully.
8. Create a new query tab.
9. Paste the full contents of `008_provider_contact_channels_rls_policy.sql`.
10. Review the anon grant and active/public policy.
11. Run the RLS draft.
12. Confirm it completes successfully.
13. Create a new query tab.
14. Paste the full contents of `009_provider_contact_channels_test_data.sql`.
15. Review the fictional contact channel rows.
16. Run the test data draft.
17. Confirm it completes successfully.

## Full Verification Query

After the three drafts run successfully, use this query to review all fictional provider contact channel test rows:

```sql
select
  provider_type,
  provider_slug,
  channel_type,
  label,
  value_public,
  url_public,
  is_primary,
  display_order,
  listing_status,
  visibility_status,
  verification_status
from public.provider_contact_channels
where provider_slug like 'test-facility-%'
   or provider_slug like 'test-doctor-%'
order by
  provider_type,
  provider_slug,
  display_order,
  channel_type;
```

Expected provider slugs in the full verification result:

- `test-facility-alpha`
- `test-facility-beta-pending`
- `test-facility-eta-minimal`
- `test-facility-gamma-archived`
- `test-facility-zeta-disputed`
- `test-doctor-alpha`
- `test-doctor-delta-hidden`
- `test-doctor-epsilon-internal`
- `test-doctor-eta-minimal`
- `test-doctor-zeta-disputed`

## Active/Public-Only Verification Query

Use this query to verify which contact channel rows should be publicly readable through the active/public rule:

```sql
select
  provider_type,
  provider_slug,
  channel_type,
  label,
  value_public,
  url_public,
  is_primary,
  display_order,
  listing_status,
  visibility_status,
  verification_status
from public.provider_contact_channels
where listing_status = 'active'
  and visibility_status = 'public'
order by
  provider_type,
  provider_slug,
  display_order,
  channel_type;
```

## Expected Active/Public Provider Contact Rows

The active/public verification query should return contact channel rows for these fictional public providers:

- `test-facility-alpha`
- `test-facility-eta-minimal`
- `test-facility-zeta-disputed`
- `test-doctor-alpha`
- `test-doctor-eta-minimal`
- `test-doctor-zeta-disputed`

Expected active/public channel types include:

- `phone`
- `whatsapp`
- `website`
- `maps`
- `social` with label `LinkedIn`

The test data also includes an `appointment` preview row for `test-doctor-alpha`. It is active/public in the draft, but it is not part of the core channel-type checklist above.

## Expected Active/Public Row Details

Expected readable rows:

| Provider slug | Expected channel examples |
| --- | --- |
| `test-facility-alpha` | `phone`, `whatsapp`, `maps` |
| `test-facility-eta-minimal` | `website`, `social` with label `LinkedIn` |
| `test-facility-zeta-disputed` | `phone`, `maps` |
| `test-doctor-alpha` | `social` with label `LinkedIn`, `appointment` |
| `test-doctor-eta-minimal` | `website`, `phone` |
| `test-doctor-zeta-disputed` | `social` with label `LinkedIn`, `whatsapp` |

All values are fictional and for test planning only.

## Blocked Contact Rows

The following blocked contact rows should exist for negative RLS/public-read testing but should not appear in the active/public-only query:

| Provider slug | Why blocked |
| --- | --- |
| `test-facility-beta-pending` | Pending/hidden |
| `test-facility-gamma-archived` | Archived/public |
| `test-doctor-delta-hidden` | Active/hidden |
| `test-doctor-epsilon-internal` | Active/internal |

These rows should not be publicly readable because they are not both `active` and `public`.

## RLS Behavior To Confirm Later

The provider contact channels RLS draft allows anon reads only when:

```sql
listing_status = 'active'
and visibility_status = 'public'
```

The RLS draft intentionally does not include:

- Anon insert policy
- Anon update policy
- Anon delete policy
- Authenticated provider policy
- Admin policy
- Reviewer policy
- Super Admin policy
- Service-role logic

## Safety Reminders

Use fictional contact data only.

Do not insert:

- Real phone numbers
- Real WhatsApp links
- Real websites
- Real maps links
- Real email addresses
- Private owner contacts
- Private doctor contacts
- Private staff contacts
- Patient data
- Booking data
- Payment data
- Admin notes
- License data
- Verification evidence

Do not expose:

- Service-role key
- Project URL
- Anon key
- Screenshots containing keys
- SQL Editor result panes that reveal sensitive project details

SQL should be run manually only after review.

## What Not To Do

Do not:

- Run these drafts against production.
- Add real contact channels.
- Add private contact fields to `public.provider_contact_channels`.
- Add patient, booking, payment, admin, license, or verification fields.
- Add RLS write policies during this step.
- Add app code that reads provider contact channels.
- Wire facility or doctor detail pages to contact channels yet.
- Use a service-role key in frontend code.

## Manual Checklist Before Continuing

Before moving to app read planning, confirm:

- `007_create_provider_contact_channels_table.sql` ran successfully.
- `008_provider_contact_channels_rls_policy.sql` ran successfully.
- `009_provider_contact_channels_test_data.sql` ran successfully.
- Full verification query returns fictional provider contact channel rows.
- Active/public verification query returns only rows for the expected active/public providers.
- Blocked contact rows exist for later negative testing.
- Blocked contact rows do not appear in the active/public-only query.
- No real contact data was inserted.
- No private/sensitive data was inserted.
- No service-role key was exposed.

## Relationship To Future App Reads

This guide prepares the database side only.

Future app work should be separate and should include:

- Provider contact channel public read planning.
- Contact channel row-to-`PublicContactChannel` mapper planning.
- Safe type expansion for channel types if needed.
- Static fallback planning.
- Facility detail contact-channel composition planning.
- Doctor detail contact-channel composition planning.
- Public read QA before UI wiring.

Do not skip directly from SQL execution to broad app wiring.

## Recommended Next Development Order

1. Manually execute the provider contact channel SQL drafts in the order listed here after review.
2. Record a provider contact channels SQL manual execution QA result.
3. Plan a public provider contact channels read helper.
4. Implement a safe public provider contact channels read helper.
5. QA the helper without wiring public pages.
6. Plan controlled facility detail contact-channel composition.
7. Plan controlled doctor detail contact-channel composition.
8. Keep pharmacies, diagnostics, telemedicine, ambulance, home care, auth, bookings, payments, admin workflows, and provider dashboards out of scope until later tasks.

## Summary

Run the provider contact channel SQL drafts manually in this order: create table, apply RLS, insert fictional test data.

The active/public verification query should return fictional contact/action rows for `test-facility-alpha`, `test-facility-eta-minimal`, `test-facility-zeta-disputed`, `test-doctor-alpha`, `test-doctor-eta-minimal`, and `test-doctor-zeta-disputed`.

Blocked pending, archived, hidden, and internal rows should remain excluded from active/public reads.

No real contact data, private provider contacts, patient data, booking/payment/admin/license data, or service-role keys should be used or exposed.
