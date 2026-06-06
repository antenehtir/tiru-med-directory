# Codex Task 151: Diagnostics Discovery Schema Planning

## Project

DigitalDirectory-v2

## Goal

Plan the diagnostics discovery schema before SQL implementation.

This task begins the Diagnostics module after the Pharmacy module reached MVP-stable status through Task 150.

This is a planning task only. It does not implement SQL, source code, routes, UI changes, Supabase changes, real data import, or brand/logo changes.

---

## Background

The project has already developed repeatable backend-connected discovery patterns for:

- Facilities
- Doctors
- Pharmacies

The Diagnostics module should follow the same safe pattern:

```text
Schema planning
-> Table SQL draft
-> RLS policy SQL draft
-> Test data SQL draft
-> Manual SQL execution guide
-> SQL execution QA record
-> Public read helper
-> Runtime probe
-> Page Supabase wiring QA
-> Detail read planning
-> Detail helper
-> Detail route
-> Contact channels
```

This document completes the schema planning step only.

---

## Context Reviewed

Documentation and planning patterns reviewed:

- `docs/CodexTask-130-PharmacyDiscoverySchemaPlanning.md`
- `docs/PharmacyDiscoverySchemaPlanning.md`
- `docs/DoctorsSchemaSQLPlanning.md`
- `docs/PublicListingSchemaSQLPlanning.md`
- `docs/DataModelContentStructure.md`
- `docs/DevelopmentRoadmap.md`

Implementation context inspected:

- `src/app/diagnostics/page.tsx`
- `src/components/diagnostics`
- `src/data/seed-diagnostics.ts`
- `src/data/seed-types.ts`
- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`

The existing diagnostics page is currently frontend/static. Static diagnostics seed data maps into the shared `PublicProviderCard` and `PublicProviderDetail` shapes with `providerType = diagnostics`.

---

## Product Boundary

This plan is for diagnostics discovery only.

In scope:

- Public diagnostics provider discovery
- Public diagnostics provider cards
- Future public diagnostics provider detail pages
- Public location, hours, service, and verification labels
- Public contact/action channels later through `provider_contact_channels`

Out of scope:

- Diagnostic result delivery
- Lab report uploads or downloads
- Patient record storage
- Test ordering workflow
- Sample pickup scheduling
- Payment or insurance workflow
- Referral workflow
- Clinical interpretation
- Provider admin dashboard
- Protected staff workflows
- Internal reviewer notes or verification evidence

---

## MVP Diagnostic Provider Types

Recommended MVP diagnostics provider types:

- `laboratory`
- `imaging_center`
- `pathology`
- `radiology`
- `mixed_diagnostic_center`

Display labels can be:

- Laboratory
- Imaging center
- Pathology
- Radiology
- Mixed diagnostic center

Current static data uses a narrower type set:

- `laboratory`
- `imaging`
- `mixed`

The future SQL/schema should use the richer MVP values above, while a later mapper can normalize them back into the current public DTO until the frontend type expands. For example, `imaging_center` and `radiology` can initially map to a diagnostics card category of Imaging or Radiology, while `mixed_diagnostic_center` can map to Mixed diagnostic center.

---

## Recommended Table Name

Recommended table name:

```text
public.diagnostic_providers
```

Rationale:

- The table stores provider listings, not individual diagnostic tests.
- The name aligns with the contact channel `provider_type = diagnostic` vocabulary.
- It avoids implying that the table stores lab results, test orders, report files, or patient diagnostic data.

The public DTO can continue using:

```text
providerType = diagnostics
```

The future contact channel lookup should use:

```text
provider_type = diagnostic
provider_slug = diagnostic_providers.slug
```

This small naming difference should be documented in the future mapper/helper task to avoid accidental mismatches.

---

## Public-Safe Fields

Recommended first public-safe fields for `public.diagnostic_providers`:

- `id`
- `slug`
- `display_name`
- `diagnostic_provider_type`
- `category`
- `description`
- `city`
- `area`
- `address_public`
- `landmark_public`
- `services_public`
- `sample_collection_modes`
- `opening_hours_public`
- `result_turnaround_public`
- `appointment_required_preview`
- `walk_in_available`
- `home_sample_collection_preview`
- `listing_status`
- `visibility_status`
- `verification_status`
- `last_confirmed_at`
- `created_at`
- `updated_at`

Field notes:

- `id`: UUID primary key.
- `slug`: Stable public route and lookup identifier.
- `display_name`: Reviewed public diagnostics provider name.
- `diagnostic_provider_type`: MVP provider type, such as laboratory or imaging center.
- `category`: Optional public grouping label for display and filters.
- `description`: Reviewed public discovery summary only.
- `city` and `area`: Public location text for cards, filters, and search.
- `address_public`: Reviewed public address text only.
- `landmark_public`: Reviewed public landmark or directions hint only.
- `services_public`: Public labels such as blood tests, ultrasound, X-ray, pathology, screening, or health packages.
- `sample_collection_modes`: Public labels such as walk-in, appointment preview, or home sample collection preview.
- `opening_hours_public`: Public hours text only.
- `result_turnaround_public`: Public estimate text only, such as same day or 24-48 hours. This must not expose individual patient result timing.
- `appointment_required_preview`: Public yes/no preview flag only.
- `walk_in_available`: Public yes/no preview flag only.
- `home_sample_collection_preview`: Public preview flag only. This must not create scheduling or patient address collection.
- `listing_status`: Publication lifecycle.
- `visibility_status`: Public visibility boundary.
- `verification_status`: Review/verification state.
- `last_confirmed_at`: Optional public freshness signal.
- `created_at` and `updated_at`: Operational timestamps.

---

## Private/Internal Fields Excluded

Do not include these in the first public diagnostics discovery table:

- Patient names
- Patient phone numbers
- Patient addresses
- Patient identifiers
- Diagnostic reports
- Lab results
- Report files
- Uploaded referrals
- Uploaded prescriptions
- Clinical notes
- Internal sample tracking
- Specimen IDs
- Lab accession numbers
- Test order records
- Payment records
- Insurance records
- Private owner contacts
- Private staff contacts
- Staff schedules
- Machine/equipment internal records
- License documents
- Accreditation evidence files
- Verification evidence
- Admin notes
- Reviewer notes
- Source confidence notes
- Internal moderation history
- Service-role keys or internal Supabase metadata

Public pages should never reveal that hidden, internal, pending, rejected, archived, or suspended diagnostics rows exist.

---

## Status Fields

Use the same public status vocabulary as facilities, doctors, pharmacies, and contact channels.

`listing_status` allowed values:

- `draft`
- `pending`
- `active`
- `rejected`
- `archived`
- `suspended`

Recommended default:

- `pending`

`visibility_status` allowed values:

- `public`
- `hidden`
- `internal`

Recommended default:

- `hidden`

`verification_status` allowed values:

- `unverified`
- `pending`
- `verified`
- `disputed`
- `expired`

Recommended default:

- `unverified`

Public eligibility rule:

```text
listing_status = active
visibility_status = public
```

Verification status should never make a diagnostics provider public by itself.

---

## Future Detail Page Fields

The same first table can support future diagnostics detail pages if detail reads select only public-safe fields.

Future detail pages can show:

- Provider name
- Diagnostic provider type
- Public description
- Public services
- Public sample collection modes
- Public opening hours
- Public address and landmark
- City and area
- Public result turnaround estimate
- Walk-in availability preview
- Appointment-required preview
- Home sample collection preview
- Verification label and public freshness
- Contact/action channels from `provider_contact_channels`

Future detail pages must not show:

- Test results
- Uploaded documents
- Patient-specific result timelines
- Private staff contacts
- Internal verifier notes
- Operational lab tracking data
- Booking, payment, referral, or patient workflows

---

## Contact Channel Strategy

Diagnostics contact/action channels should use the existing shared architecture:

```text
public.provider_contact_channels
```

Recommended future mapping:

```text
provider_type = diagnostic
provider_slug = diagnostic_providers.slug
```

Public-safe diagnostics contact channels may include:

- Public phone
- Public WhatsApp
- Public website
- Public maps/directions URL
- Public social profile
- Public appointment or inquiry link

Do not store these directly on `public.diagnostic_providers` for the MVP unless a later schema task explicitly decides otherwise.

Contact channels must remain active/public before display and should use the existing shared helper when the detail page is eventually wired.

---

## Mapping To PublicProviderCard

Future diagnostics rows should map into `PublicProviderCard` as follows:

- `id` -> `id`
- `slug` -> `slug`
- `display_name` -> `name`
- `providerType` -> `diagnostics`
- `diagnostic_provider_type` or `category` -> `categoryLabel`
- `description` -> `summary`
- `city` and `area` -> `locationLabel`
- `verification_status` -> `verificationStatus`
- `slug` -> `listingHref`
- `services_public` -> `services`
- `sample_collection_modes` -> `availabilityPreview`
- `opening_hours_public` -> `hoursPreview`
- `diagnostic_provider_type` -> `diagnosticsType` after mapper normalization

Recommended card actions:

- Primary action: `Contact preview` or a public contact channel label later.
- Secondary action: `Location preview` or directions/maps channel later.

The current `PublicDiagnosticsType` is limited to `laboratory`, `imaging`, and `mixed`. A future mapper task should either:

- normalize richer SQL values into the current type safely, or
- expand `PublicDiagnosticsType` in a separate type/UI task after QA.

---

## Mapping To Future Detail Pages

Future diagnostics detail mapping should produce `PublicProviderDetail`.

Suggested mapping:

- Card fields as above.
- `description` -> `description`
- `city` and `area` -> `location`
- `address_public` -> `address`
- `opening_hours_public` -> `workingHours`
- `services_public` -> `services`
- `sample_collection_modes` -> `availabilityPreview`
- `result_turnaround_public` -> public detail list item or availability note
- `verification_status` and `last_confirmed_at` -> `verification`
- Contact channels -> `contactChannels` through `provider_contact_channels`
- `slug` -> correction link, likely `/corrections?provider=diagnostics&slug=<slug>` later

Blocked or unknown slugs should return a safe not-found state when detail routing is eventually implemented.

---

## RLS Concept

The future RLS model should mirror facilities, doctors, and pharmacies.

Anonymous public read:

- `anon` can select only diagnostics rows where `listing_status = 'active'` and `visibility_status = 'public'`.
- `anon` cannot insert diagnostics rows.
- `anon` cannot update diagnostics rows.
- `anon` cannot delete diagnostics rows.

Frontend safety:

- Use only public anon reads.
- Never use a service-role key in frontend code.
- Hide raw Supabase errors in public UI.
- Keep query filters as an app-side safety layer, but rely on RLS as the database boundary.

Future authenticated/admin/provider policies should be planned separately.

---

## Test Data Planning

Future test data should be fictional only.

Recommended first coverage:

- 3 active/public diagnostics providers.
- 1 pending diagnostics provider.
- 1 archived diagnostics provider.
- 1 hidden diagnostics provider.
- 1 internal diagnostics provider.

Recommended active/public examples:

- Test Diagnostic Alpha Laboratory
- Test Diagnostic Eta Imaging Center
- Test Diagnostic Zeta Mixed Center

Blocked examples should verify:

- pending rows do not appear
- archived rows do not appear
- hidden rows do not appear
- internal rows do not appear

Test rows must not include real diagnostics businesses, real phone numbers, real patient data, real reports, real test results, real addresses tied to private individuals, or real clinical documents.

---

## Risks And Assumptions

Assumptions:

- Diagnostics discovery should follow the same public-safe table/read/helper/page sequence as pharmacies.
- The first diagnostics schema should support discovery and future detail pages only.
- Contact/action links should use `provider_contact_channels`, not direct columns.
- Public status vocabulary should remain aligned across provider tables.

Risks:

- Mixing diagnostics discovery with test ordering or result delivery would create patient-data risk.
- Adding report/result fields to public tables would create privacy risk.
- The current app type uses `providerType = diagnostics`, while contact channels use `provider_type = diagnostic`; future mapper/helper tasks must handle this intentionally.
- The current `PublicDiagnosticsType` is narrower than the proposed MVP provider types.
- Home sample collection preview could be mistaken for scheduling if copy is not explicit.
- Result turnaround estimates could be mistaken for patient-specific promises if not worded carefully.
- Public contact channels must be reviewed before activation.

---

## What Must Not Be Implemented Yet

Do not implement yet:

- SQL table creation
- RLS policy SQL
- Test data inserts
- Supabase diagnostics read helpers
- Diagnostics runtime probes
- `/diagnostics` Supabase wiring
- `/diagnostics/[slug]` routes
- Contact channel wiring
- Diagnostic result upload/download
- Test ordering
- Sample pickup scheduling
- Payments
- Patient data workflows
- Protected provider/admin workflows
- Diagnostics UI redesign

---

## Recommended Task 152

Recommended Task 152 title:

```text
CodexTask-152-DiagnosticsTableSQLDraft.md
```

Recommended objective:

Create a draft SQL file only for `public.diagnostic_providers`, with public-safe diagnostics discovery fields, status constraints, useful indexes, timestamps, public-safety comments, and no RLS policies or test inserts yet.

Task 152 should not run SQL, modify app code, modify UI, add Supabase reads, or add real data.

---

## Summary

The recommended diagnostics schema approach is a public-safe `public.diagnostic_providers` table for discovery and future detail pages, with public status fields aligned to facilities, doctors, pharmacies, and contact channels.

Diagnostics contact/action values should later use `public.provider_contact_channels` with `provider_type = diagnostic` and `provider_slug = diagnostic_providers.slug`.

The first schema should include public provider name, type, description, city, area, public address, public landmark, public services, sample collection mode labels, public hours, public result turnaround estimate, public preview booleans, status fields, verification status, and timestamps.

It must exclude patient data, diagnostic reports, test results, uploaded documents, private contacts, internal notes, verification evidence, ordering workflows, payment workflows, sample tracking, and protected admin/provider workflows.
