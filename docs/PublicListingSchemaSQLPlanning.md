# DigitalDirectory-v2 Public Listing Schema SQL Planning

## Purpose

This document plans the first future Supabase public listing schema work for DigitalDirectory-v2.

It is documentation-only. It does not create Supabase tables, add SQL files, run SQL, add migrations, add RLS policies, insert test data, add Supabase reads, modify source wrapper code, modify mapper code, add authentication, add backend functionality, add protected routes, modify frontend UI, commit, or push.

The goal is to define what the first SQL/schema implementation should include later, starting with facilities and public directory read requirements.

---

## Core Principle

The first schema slice should be small, public-safe, and easy to roll back.

Facilities should come first because they match the current static card/detail model and can validate public listing reads without introducing doctor booking, patient, payment, document, or provider-owner workflows.

---

## SQL Planning Purpose

SQL planning should answer:

- Which table should be created first?
- Which fields are public-safe?
- Which fields should stay private or separate?
- Which statuses are required for public reads?
- Which supporting tables are needed now versus later?
- Which constraints and indexes should be planned?
- How should RLS be planned before implementation?
- How will future rows map into current public DTOs?

This document should guide a later SQL/migration task, not replace it.

---

## Why Facilities Should Be First

Facilities are the recommended first public listing table because:

- Facility discovery is central to the product.
- Facility cards and detail pages already exist.
- `PublicProviderCard` and `PublicProviderDetail` already support facility fields.
- Facility rows can test slugs, names, categories, summaries, locations, hours, verification status, and contact labels.
- The known route `/facilities/addis-health-center` is already stable.
- Facility data is less personally sensitive than doctor profile or patient workflow data.
- Facility reads can prove public/private status filtering before broader provider types are added.

First implementation target:

```text
facilities
```

---

## Proposed First Table: Facilities

Future table name:

```text
facilities
```

Purpose:
Store reviewed public-safe healthcare facility listings for hospitals, clinics, health centers, and specialty centers.

Planned public-facing fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable primary identifier |
| `slug` | Canonical route segment |
| `name` | Public facility name |
| `facility_type` | Public category such as clinic or hospital |
| `summary` | Short public card description |
| `description` | Longer public detail text |
| `location_id` | Link to public location row |
| `address_line` | Reviewed public address text |
| `directions_note` | Optional reviewed public landmark/directions note |
| `verification_status` | Public trust label |
| `listing_status` | Lifecycle status |
| `visibility_status` | Public display control |
| `created_at` | Internal timestamp |
| `updated_at` | Internal or public freshness later |
| `published_at` | Optional public freshness later |

Fields to defer:

- emergency availability
- 24-hour status
- primary image URL
- ownership status
- provider owner account ID
- source confidence
- review notes
- verification evidence

Deferred fields should be added only when review rules and RLS expectations are clear.

---

## Facility Status Fields

Facilities need status fields before public reads.

Recommended status concepts:

| Field | Example Values | Purpose |
| --- | --- | --- |
| `listing_status` | published, draft, rejected, archived, duplicate | Lifecycle state |
| `visibility_status` | public, hidden, private | Public display control |
| `verification_status` | verified, pending, community-submitted | Public trust label |

Public read rule in plain language:

```text
Read only facilities where listing_status is published and visibility_status is public.
```

Rules:

- Verification status does not make a listing public by itself.
- Draft, hidden, private, archived, rejected, duplicate, and deleted records must be blocked from public reads.
- High-impact verification changes should be review-controlled later.

---

## Public and Private Field Separation

Public facility fields should be safe for anonymous users.

Public-safe examples:

- slug
- name
- facility type
- summary
- reviewed description
- public location reference
- reviewed public address
- public verification status label
- public listing/visibility state used by policy

Private/internal fields should not be stored directly in public payloads or selected for public DTOs:

- admin notes
- reviewer notes
- verification evidence
- provider owner account IDs
- private phone numbers
- private emails
- submitter contact details
- source confidence
- audit snapshots
- request payloads
- ownership claim history
- patient, booking, payment, document, notification, chatbot, or community data

Planning rule:

```text
If a field is not required for public discovery, do not put it in the first public read surface.
```

---

## Proposed Support Table: Provider Contact Channels

Future table name:

```text
provider_contact_channels
```

Purpose:
Store reviewed public contact/action channels for providers without embedding private contact details in provider tables.

Recommended first scope:

- Facilities only.
- Public reviewed contact/action labels only.
- No private submitter or owner contact values.

Planned fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable primary identifier |
| `provider_type` | facility, doctor, pharmacy, diagnostics |
| `provider_id` | Target public provider record |
| `channel_type` | phone, directions, website, email, preview |
| `label` | Public UI label |
| `value` | Public reviewed value |
| `href` | Optional public URL/action target |
| `visibility_status` | public, hidden, private |
| `review_status` | reviewed, pending, rejected |
| `created_at` | Internal timestamp |
| `updated_at` | Internal timestamp |

Rules:

- Public reads should include only reviewed/public contact channels.
- Private contact values should be stored separately later, not in public rows.
- Phone, emergency, address, and directions changes should require review.

---

## Location Planning

Future table name:

```text
locations
```

Purpose:
Provide reusable public location labels for providers and search filters.

Planned fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable primary identifier |
| `slug` | Public route/filter segment later |
| `name` | Short location name |
| `display_name` | Public display label |
| `location_type` | country, city, area |
| `parent_location_id` | Optional hierarchy link |
| `is_public` | Public read eligibility |
| `created_at` | Internal timestamp |
| `updated_at` | Internal timestamp |

Rules:

- Public provider reads should use only public locations.
- Patient live location must not be stored here.
- Sensitive coordinates should be deferred until map/location policy is ready.

---

## Proposed Indexes

Future indexes should support public reads and route lookups.

Recommended facility indexes:

| Index Target | Purpose |
| --- | --- |
| `slug` | Detail route lookup |
| `listing_status`, `visibility_status` | Public eligibility filtering |
| `facility_type` | Category filtering |
| `location_id` | Location filtering |
| `verification_status` | Trust/status filtering |
| `published_at` | Freshness/order later |

Recommended location indexes:

| Index Target | Purpose |
| --- | --- |
| `slug` | Filter/route lookup later |
| `parent_location_id` | Hierarchy lookup |
| `is_public` | Public eligibility filtering |

Recommended contact channel indexes:

| Index Target | Purpose |
| --- | --- |
| `provider_type`, `provider_id` | Provider contact lookup |
| `visibility_status`, `review_status` | Public eligibility filtering |

No indexes are created in this task.

---

## Proposed Constraints

Future constraints should protect data quality.

Recommended constraints:

- `slug` should be unique per provider table.
- `name` should be required.
- `facility_type` should be required.
- `listing_status` should be required.
- `visibility_status` should be required.
- `verification_status` should be required.
- `location_id` should reference a valid public location row later.
- `provider_contact_channels.provider_type` should use known provider type values.
- `provider_contact_channels.channel_type` should use known channel type values.
- Contact channels should require a reviewed state before public reads include them.

Planning note:
Enums or check constraints should be decided in a future implementation task after schema naming is finalized.

---

## Future Relationship Tables

Relationship tables should be added after the first facility table is stable.

Future relationship tables:

| Table | Purpose |
| --- | --- |
| `facility_services` | Facilities to public service labels |
| `doctor_facility_affiliations` | Reviewed doctor/facility affiliations |
| `provider_locations` | Future multi-location support |
| `provider_specialties` | Future provider/specialty links |

First relationship recommendation:

```text
facility_services
```

Rules:

- Relationship rows need review/public status fields.
- Hidden or unreviewed relationships should not appear publicly.
- Relationship rows should not contain reviewer notes or private evidence.

---

## Future Provider Tables

After facilities are stable, future provider tables can follow similar public/private boundaries.

Future tables:

- `doctors`
- `pharmacies`
- `diagnostics_providers`

Implementation order recommendation:

1. `facilities`
2. `locations`
3. `provider_contact_channels`
4. `services`
5. `facility_services`
6. `doctors`
7. `doctor_facility_affiliations`
8. `pharmacies`
9. `diagnostics_providers`

Doctor, pharmacy, and diagnostics tables should not be added until the facility read slice proves schema, RLS, mapping, and fallback behavior.

---

## RLS Planning Notes

RLS must be planned before any table is treated as public-readable.

Plain-language RLS expectations:

- Anonymous users can read only published/public facilities.
- Anonymous users can read only public locations.
- Anonymous users can read only reviewed/public contact channels.
- Anonymous users cannot read draft, hidden, private, archived, rejected, duplicate, or deleted records.
- Anonymous users cannot read review notes, ownership data, audit logs, verification evidence, request payloads, or patient/workflow data.

Future policy tests should include:

- Positive published/public facility read.
- Negative draft facility read.
- Negative hidden facility read.
- Negative private facility read.
- Negative archived/rejected/duplicate facility read.
- Negative private contact channel read.

No RLS policies are added in this task.

---

## Test Data Planning Notes

Test data should follow `SupabasePublicListingTestDataSetupPlan.md`.

Facility test rows should include:

- one published/public facility
- one draft/public facility
- one published/hidden facility
- one archived/public facility
- one published/private facility

Contact channel test rows should include:

- one reviewed/public contact channel
- one private/internal contact channel
- one pending public contact channel blocked from public reads

Test data rules:

- Use fictional names only.
- Use reserved domains such as `example.com`.
- Do not use real patient data.
- Do not use real provider private contacts.
- Do not insert test data in this task.

---

## Relationship to Existing Mapper and Source Wrapper

Current files:

- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`
- `src/lib/public-listing-source.ts`

Relationship:

- Facility rows should map into `PublicProviderCard` and `PublicProviderDetail`.
- Field names should support existing public DTO fields such as `id`, `slug`, `name`, `categoryLabel`, `summary`, `locationLabel`, `verificationStatus`, `listingHref`, `services`, and `hoursPreview`.
- Source wrapper should remain static by default.
- Future Supabase reads should be added behind the source wrapper only after QA.
- Raw database rows should not be passed directly to UI components.

No mapper or source wrapper code is changed in this task.

---

## Relationship to Static Fallback

Static fallback remains the safety net.

Fallback rules:

- Missing Supabase env vars should keep static behavior.
- Failed public reads should fall back to static data where fallback is enabled.
- Static fallback should preserve current public pages.
- Static fallback should not hide repeated test/staging failures from review.
- Static fallback should remain available until Supabase reads are stable.

The schema plan should not remove or weaken the static source path.

---

## MVP Recommendation

MVP schema recommendation:

- Plan facilities first.
- Keep the first schema slice public-safe and minimal.
- Add only fields needed by public cards/detail DTOs.
- Keep private notes, evidence, ownership, patient, booking, payment, document, and workflow data out of the first public read surface.
- Plan `locations` and `provider_contact_channels` as support tables.
- Defer doctors, pharmacies, diagnostics, service relationships, auth, dashboards, and write workflows until the facility read path is proven.

No SQL should be written until a future implementation task explicitly requests it.

---

## Risks

Key risks:

- Designing a table that mixes public and private data.
- Adding too many provider types at once.
- Missing lifecycle and visibility statuses.
- Treating verification status as publication status.
- Exposing private contact channels.
- Adding owner account IDs to public table payloads.
- Creating SQL before RLS planning is ready.
- Creating test data before status and visibility rules are clear.
- Breaking mapper compatibility with current public DTOs.
- Removing static fallback too early.

Mitigations:

- Start with facilities only.
- Keep status fields explicit.
- Separate contact channels.
- Keep private/internal review data out of public tables.
- Confirm field mapping against public DTOs before SQL.
- Add RLS policies and negative tests before public reads.
- Keep source wrapper static until read QA passes.

---

## Recommended Next Development Order

1. Review this schema SQL planning document.
2. Confirm the Supabase test project is manually created and safe.
3. Confirm public facility fields against `PublicProviderCard` and `PublicProviderDetail`.
4. Confirm status values and public read filters.
5. Confirm RLS plain-language rules.
6. Draft SQL in documentation or a future implementation branch only when approved.
7. Create the first facility table in a future task.
8. Add RLS policies in a separate future task.
9. Add fictional test rows in a separate future task.
10. Add read helper and row mapper after schema and RLS are ready.
11. Keep static fallback active.
12. Wire public pages only after read output is QA-approved.

---

## Summary

The first public listing schema should start with a minimal `facilities` table, supported by public `locations` and later `provider_contact_channels`.

This plan defines facility fields, statuses, public/private separation, support table direction, indexes, constraints, future relationships, future provider tables, RLS notes, test data notes, mapper/source-wrapper alignment, static fallback, MVP scope, risks, and next development order. It adds no tables, SQL files, migrations, RLS policies, test data, Supabase reads, code changes, backend functionality, authentication, protected routes, UI changes, commits, or pushes.
