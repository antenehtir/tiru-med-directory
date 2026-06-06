# Codex Task 152: Diagnostics Table SQL Draft

## Project

DigitalDirectory-v2

## Goal

Create a SQL draft for the diagnostics discovery table based on the planning completed in Task 151.

This task follows:

- `docs/CodexTask-151-DiagnosticsDiscoverySchemaPlanning.md`

This is a SQL draft documentation task only. Do not execute this SQL. Do not modify Supabase directly. Do not create a migration file in this task. Do not modify source code, routes, UI, RLS policies, pharmacy files, doctor files, facility files, or brand/logo UI.

---

## Context Reviewed

Documents and patterns reviewed:

- `docs/CodexTask-151-DiagnosticsDiscoverySchemaPlanning.md`
- `docs/CodexTask-131-PharmaciesTableSQLDraft.md`
- `docs/CodexTask-100-DoctorsTableSQLDraft.md`
- `docs/CodexTask-67-FacilitiesTableSQLMigrations.md`
- `docs/DataModelContentStructure.md`
- `docs/DevelopmentRoadmap.md`
- Existing facilities, doctors, and pharmacies SQL draft patterns

The diagnostics table should follow the same public-safe provider discovery pattern already used for facilities, doctors, and pharmacies.

---

## Draft Scope

This draft defines the future table:

```text
public.diagnostic_providers
```

The table is for diagnostics provider discovery only.

It should support:

- public diagnostics provider cards
- future diagnostics provider detail pages
- public search/category/location filtering
- public verification labels
- future public contact channels through `provider_contact_channels`

It must not store:

- patient records
- lab results
- diagnostic reports
- uploaded files
- sample tracking
- private contacts
- staff schedules
- internal admin notes
- verification documents
- ordering workflows
- payments
- protected workflow data
- environment values
- secrets

---

## SQL Draft

Warning:

```text
DRAFT ONLY. DO NOT EXECUTE UNTIL REVIEWED AND APPROVED.
```

```sql
-- DigitalDirectory-v2 diagnostic providers table SQL draft.
-- DRAFT ONLY. DO NOT RUN UNTIL REVIEWED AND APPROVED.
-- This file is a documentation-only planning artifact.
--
-- Scope:
-- - Creates a draft public.diagnostic_providers table shape.
-- - Includes public-safe diagnostics discovery fields only.
-- - Adds public-safe status constraints and lookup indexes.
-- - Adds a simple updated_at trigger using the existing helper pattern.
--
-- Out of scope for this draft:
-- - No RLS policies.
-- - No test inserts.
-- - No patient records.
-- - No lab results.
-- - No diagnostic reports.
-- - No uploaded files.
-- - No sample tracking.
-- - No private contacts.
-- - No staff schedules.
-- - No internal admin notes.
-- - No verification documents or evidence.
-- - No ordering workflows.
-- - No payments.
-- - No protected workflow data.
-- - No service-role use from frontend.
--
-- Note:
-- Supabase projects commonly support gen_random_uuid().
-- Confirm extension availability before running this in a real project.

create table if not exists public.diagnostic_providers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  diagnostic_provider_type text not null,
  category text,
  description text,
  city text,
  area text,
  address_public text,
  landmark_public text,
  services_public text[] not null default '{}',
  sample_collection_modes text[] not null default '{}',
  opening_hours_public text,
  result_turnaround_public text,
  appointment_required_preview boolean not null default false,
  walk_in_available boolean not null default false,
  home_sample_collection_preview boolean not null default false,
  listing_status text not null default 'pending',
  visibility_status text not null default 'hidden',
  verification_status text not null default 'unverified',
  last_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint diagnostic_providers_slug_not_blank
    check (length(trim(slug)) > 0),
  constraint diagnostic_providers_display_name_not_blank
    check (length(trim(display_name)) > 0),
  constraint diagnostic_providers_type_not_blank
    check (length(trim(diagnostic_provider_type)) > 0),
  constraint diagnostic_providers_type_check
    check (
      diagnostic_provider_type in (
        'laboratory',
        'imaging_center',
        'pathology',
        'radiology',
        'mixed_diagnostic_center'
      )
    ),
  constraint diagnostic_providers_listing_status_check
    check (
      listing_status in (
        'draft',
        'pending',
        'active',
        'rejected',
        'archived',
        'suspended'
      )
    ),
  constraint diagnostic_providers_visibility_status_check
    check (
      visibility_status in (
        'public',
        'hidden',
        'internal'
      )
    ),
  constraint diagnostic_providers_verification_status_check
    check (
      verification_status in (
        'unverified',
        'pending',
        'verified',
        'disputed',
        'expired'
      )
    )
);

comment on table public.diagnostic_providers is
  'Draft public-safe diagnostics provider discovery table for DigitalDirectory-v2. Discovery only; do not use for patient records, lab results, diagnostic reports, uploads, ordering, payments, or protected workflows.';

comment on column public.diagnostic_providers.slug is
  'Stable public route slug for diagnostics discovery and future detail pages.';

comment on column public.diagnostic_providers.display_name is
  'Reviewed public diagnostics provider name only.';

comment on column public.diagnostic_providers.diagnostic_provider_type is
  'Reviewed public diagnostics provider type such as laboratory, imaging center, pathology, radiology, or mixed diagnostic center.';

comment on column public.diagnostic_providers.category is
  'Optional reviewed public category label for discovery and filtering.';

comment on column public.diagnostic_providers.description is
  'Reviewed public discovery summary only. Do not store internal notes, clinical interpretation, patient data, or verification evidence here.';

comment on column public.diagnostic_providers.address_public is
  'Reviewed public address text only. Do not store patient addresses or private owner/staff addresses here.';

comment on column public.diagnostic_providers.landmark_public is
  'Reviewed public landmark or directions hint only.';

comment on column public.diagnostic_providers.services_public is
  'Reviewed public diagnostics service labels only, such as lab tests, imaging, pathology, radiology, or screening. Do not store test orders or patient results here.';

comment on column public.diagnostic_providers.sample_collection_modes is
  'Reviewed public sample collection mode labels only, such as walk-in preview, appointment preview, or home sample collection preview. Do not store schedules, patient addresses, or order workflow data here.';

comment on column public.diagnostic_providers.opening_hours_public is
  'Reviewed public opening hours text only.';

comment on column public.diagnostic_providers.result_turnaround_public is
  'Reviewed public result turnaround estimate only. Do not store patient-specific result timing or report status here.';

comment on column public.diagnostic_providers.appointment_required_preview is
  'Public discovery preview flag only. This does not create appointment booking functionality.';

comment on column public.diagnostic_providers.walk_in_available is
  'Public discovery preview flag only. This does not guarantee live availability.';

comment on column public.diagnostic_providers.home_sample_collection_preview is
  'Public discovery preview flag only. This does not create sample pickup scheduling or patient address collection.';

comment on column public.diagnostic_providers.listing_status is
  'Diagnostics provider listing publication lifecycle. Active status is required before public exposure.';

comment on column public.diagnostic_providers.visibility_status is
  'Diagnostics provider visibility boundary. Public visibility is required before public exposure.';

comment on column public.diagnostic_providers.verification_status is
  'Review state for the diagnostics provider discovery listing. This is not verification evidence.';

comment on column public.diagnostic_providers.last_confirmed_at is
  'Optional public freshness signal for when diagnostics provider discovery details were last reviewed or confirmed.';

create index if not exists diagnostic_providers_slug_idx
  on public.diagnostic_providers (slug);

create index if not exists diagnostic_providers_listing_visibility_idx
  on public.diagnostic_providers (listing_status, visibility_status);

create index if not exists diagnostic_providers_type_idx
  on public.diagnostic_providers (diagnostic_provider_type);

create index if not exists diagnostic_providers_city_area_idx
  on public.diagnostic_providers (city, area);

create index if not exists diagnostic_providers_verification_status_idx
  on public.diagnostic_providers (verification_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists diagnostic_providers_set_updated_at
  on public.diagnostic_providers;

create trigger diagnostic_providers_set_updated_at
before update on public.diagnostic_providers
for each row
execute function public.set_updated_at();

-- No RLS policies are included in this draft.
-- No test data inserts are included in this draft.
-- Review schema, status values, indexes, trigger naming, and RLS plan before running.
-- Keep patient records, lab results, diagnostic reports, uploaded files,
-- sample tracking, private contacts, staff schedules, admin notes,
-- verification documents, ordering workflows, payments, protected workflow data,
-- environment values, and secrets out of this public discovery table.
-- Frontend code must not use a service-role key to read or write diagnostics data.
```

---

## Major Columns Included

Public discovery identity and route fields:

- `id`
- `slug`
- `display_name`

Diagnostics discovery fields:

- `diagnostic_provider_type`
- `category`
- `description`
- `services_public`
- `sample_collection_modes`

Public location and hours fields:

- `city`
- `area`
- `address_public`
- `landmark_public`
- `opening_hours_public`

Public preview fields:

- `result_turnaround_public`
- `appointment_required_preview`
- `walk_in_available`
- `home_sample_collection_preview`

Status and freshness fields:

- `listing_status`
- `visibility_status`
- `verification_status`
- `last_confirmed_at`
- `created_at`
- `updated_at`

---

## Constraints Included

The draft includes:

- non-blank `slug`
- non-blank `display_name`
- non-blank `diagnostic_provider_type`
- `diagnostic_provider_type` check constraint
- `listing_status` check constraint
- `visibility_status` check constraint
- `verification_status` check constraint

Diagnostic provider type values:

- `laboratory`
- `imaging_center`
- `pathology`
- `radiology`
- `mixed_diagnostic_center`

Status vocabulary:

`listing_status`:

- `draft`
- `pending`
- `active`
- `rejected`
- `archived`
- `suspended`

`visibility_status`:

- `public`
- `hidden`
- `internal`

`verification_status`:

- `unverified`
- `pending`
- `verified`
- `disputed`
- `expired`

---

## Indexes Included

The draft includes public discovery indexes for:

- `slug`
- `listing_status, visibility_status`
- `diagnostic_provider_type`
- `city, area`
- `verification_status`

These support future public list reads, active/public filtering, category filtering, location filtering, verification filtering, and slug-based detail reads.

---

## Discovery-Only Scope Notes

This table is intentionally limited to public diagnostics provider discovery.

It should not be used for:

- diagnostic test ordering
- result delivery
- report storage
- uploaded referrals or prescriptions
- sample tracking
- payment workflows
- patient data workflows
- staff scheduling
- provider admin workflows
- protected review workflow data

Contact/action channels should be handled later through `public.provider_contact_channels`, using:

```text
provider_type = diagnostic
provider_slug = diagnostic_providers.slug
```

The public app can continue mapping diagnostics rows into:

```text
providerType = diagnostics
```

Future mapper/helper tasks must handle this naming difference intentionally.

---

## Future RLS Task Notes

RLS is not included in this draft.

The next RLS draft should:

- enable RLS on `public.diagnostic_providers`
- grant schema usage to `anon`
- grant select on `public.diagnostic_providers` to `anon`
- create an anon SELECT policy allowing only:
  - `listing_status = 'active'`
  - `visibility_status = 'public'`
- omit anon insert/update/delete policies
- avoid service-role logic
- avoid test data
- avoid private/internal fields

---

## Explicit Private/Internal Exclusions

The draft deliberately excludes:

- patient records
- patient names
- patient phone numbers
- patient addresses
- diagnostic reports
- lab results
- report files
- uploaded files
- uploaded referrals
- uploaded prescriptions
- clinical notes
- sample tracking
- specimen IDs
- accession numbers
- private contacts
- private owner contacts
- private staff contacts
- staff schedules
- admin notes
- reviewer notes
- verification documents
- verification evidence
- order records
- payment records
- insurance records
- protected workflow data
- environment values
- secrets

---

## Recommended Task 153

Recommended Task 153 title:

```text
CodexTask-153-DiagnosticsRLSPolicySQLDraft.md
```

Recommended objective:

Create a SQL draft document for public read-only RLS on `public.diagnostic_providers`, allowing anonymous reads only for active/public diagnostics provider rows and denying anon writes by omission.

Task 153 should not run SQL, modify Supabase directly, create test data, modify app code, modify UI, add diagnostics read helpers, or create migrations unless explicitly requested.

---

## Remaining Risks

- The current public app type uses `providerType = diagnostics`, while contact channels use `provider_type = diagnostic`; future mapper/helper work must normalize that safely.
- The current `PublicDiagnosticsType` is narrower than the SQL draft provider types. Future code should either normalize the richer SQL values or expand the public type in a separate task.
- `result_turnaround_public` must remain a general public estimate, not a patient-specific result status.
- `home_sample_collection_preview` must remain a preview label, not scheduling or patient address collection.
- RLS must be drafted and reviewed before the table is used for public reads.
- Fictional test data must be drafted separately and should not include real diagnostics providers or patient information.

---

## Summary

This document drafts `public.diagnostic_providers` as a public-safe diagnostics discovery table.

It includes public identity, type, description, location, service, sample collection, hours, preview, status, verification, freshness, and timestamp fields. It includes provider type and status constraints, useful public discovery indexes, table/column comments, and an updated-at trigger pattern.

It does not include RLS, test data, patient data, lab results, reports, uploads, sample tracking, private contacts, staff schedules, admin notes, verification documents, ordering workflows, payments, protected workflow data, environment values, secrets, source code changes, route changes, UI changes, Supabase modifications, or migrations.
