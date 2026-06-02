# DigitalDirectory-v2 Doctors Schema SQL Planning

## Purpose

This document plans a future public doctors table/schema before any SQL is written.

The goal is to extend the same safe public-listing model already proven for facilities to doctor listings, while keeping doctor-specific private data, verification evidence, bookings, payments, reviews, and patient data out of the first public schema.

This is documentation-only. It does not create SQL, migrations, RLS policies, test data, app code, UI changes, authentication, backend functionality, protected routes, or service-role key usage.

## Context Reviewed

Documentation reviewed:

- `docs/ProductVision.md`
- `docs/Architecture.md`
- `docs/DevelopmentRoadmap.md`
- `docs/FacilitiesSupabasePreviewStabilizationQA.md`
- `docs/FacilityDetailRouteQARecord.md`
- `docs/CodexTask-99-DoctorsSchemaSQLPlanning.md`

Implementation and schema context reviewed:

- `src/app/doctors`
- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`
- `src/lib/public-listing-source.ts`
- `supabase/migrations_draft/001_create_facilities_table.sql`
- `supabase/migrations_draft/002_facilities_rls_policy.sql`

## Current Doctor State

Doctors are currently frontend/static:

- `/doctors` renders the static doctor directory page.
- `/doctors/dr-hana-bekele` renders a static doctor detail preview.
- `getPublicDoctorCards()` maps static seed doctors into `PublicProviderCard`.
- `getPublicDoctorDetails()` maps static seed doctors into `PublicProviderDetail`.
- No doctor Supabase table, SQL draft, RLS draft, source switch, public read helper, or dynamic doctor detail route exists yet.

## Proposed First Table

Future table name:

```text
public.doctors
```

The first public doctors table should behave like `public.facilities`:

- Public-safe listing rows only.
- Active/public filtering for anonymous reads.
- No private provider contact fields.
- No license documents.
- No uploaded certificates.
- No admin notes.
- No patient data.
- No booking, payment, review, or rating data.

## Public-Safe Doctor Fields

Recommended first public-safe fields:

- `id`
- `slug`
- `display_name`
- `title`
- `specialty`
- `subspecialty`
- `bio_public`
- `facility_name_public`
- `city`
- `area`
- `consultation_modes`
- `languages`
- `listing_status`
- `visibility_status`
- `verification_status`
- `last_confirmed_at`
- `created_at`
- `updated_at`

Field notes:

- `id`: Stable UUID primary key.
- `slug`: Public route slug and lookup key.
- `display_name`: Reviewed public doctor name.
- `title`: Public professional title, such as Dr. or Prof., if reviewed.
- `specialty`: Primary specialty used for cards, filters, and category labels.
- `subspecialty`: Optional finer public specialty label.
- `bio_public`: Reviewed public summary only; no clinical advice or private claims.
- `facility_name_public`: Optional reviewed public affiliation text until relationship tables are introduced.
- `city` and `area`: Public location text for discovery and filtering.
- `consultation_modes`: Public list of modes such as in-person, telemedicine preview, or appointment request preview.
- `languages`: Public list of languages the doctor can support.
- `last_confirmed_at`: Public freshness signal for listing review.
- `created_at` and `updated_at`: Operational timestamps, safe to keep but not necessarily shown directly.

## Private And Deferred Doctor Fields

Do not include these fields in the first public doctors table:

- Private phone
- Private email
- License documents
- Uploaded certificates
- Verification document URLs
- Admin notes
- Reviewer notes
- Internal provider owner account IDs
- Private facility manager contact details
- Patient data
- Bookings
- Payments
- Wallet data
- Reviews
- Ratings
- Private schedules
- Telemedicine room links
- Medical records
- Document vault references

Future private/internal fields should live in separate protected tables with stricter RLS, not in the first public table.

## Status Vocabulary

Use the same status vocabulary as facilities.

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

## RLS Concept

The doctor RLS model should mirror the facilities RLS model.

Public anonymous behavior:

- `anon` can select only rows where `listing_status = 'active'` and `visibility_status = 'public'`.
- `anon` cannot insert doctor rows.
- `anon` cannot update doctor rows.
- `anon` cannot delete doctor rows.

Frontend safety:

- Do not use a service-role key in frontend code.
- Do not expose raw Supabase errors in public UI.
- Do not rely only on frontend filters; RLS must enforce public visibility.

Future authenticated behavior should be planned separately:

- Doctor owner profile management.
- Facility-affiliation requests.
- Admin/reviewer verification workflows.
- Protected document handling.
- Audit logs.

## Proposed Index Planning

Future SQL should likely include indexes for:

- `slug`
- `listing_status`
- `visibility_status`
- `verification_status`
- `city`
- `area`
- `specialty`
- `subspecialty`
- Composite `listing_status, visibility_status`

Future search indexes may be planned later for:

- Doctor name search.
- Specialty search.
- Facility affiliation search.
- Multilingual search.

Do not add full-text search, vector search, or advanced search indexes in the first SQL draft unless separately planned.

## Test Data Plan

Future test data should be fictional only.

Recommended first coverage:

- 3 active/public doctors.
- 1 pending doctor.
- 1 archived doctor.
- 1 hidden/internal doctor.

Expected public read outcomes:

- Active/public rows appear in doctor public reads.
- Pending rows do not appear.
- Archived rows do not appear.
- Hidden/internal rows do not appear.

Test data must not include:

- Real doctor identities.
- Real license numbers.
- Real private contacts.
- Real patient data.
- Real booking, payment, review, or rating data.
- Real certificates or document links.

## Mapping To Existing Public Card System

Future doctor rows should map cleanly into `PublicProviderCard`.

Suggested mapping:

- `id` -> `id`
- `slug` -> `slug`
- `display_name` plus `title` -> `name`
- `providerType` -> `doctor`
- `specialty` -> `categoryLabel`
- `bio_public` or `facility_name_public` -> `summary`
- `city` and `area` -> `locationLabel`
- `verification_status` -> `verificationStatus`
- `slug` -> `listingHref` through `/doctors/[slug]` later
- `specialty` and `subspecialty` -> `specialties`
- `facility_name_public` -> `affiliations`
- `consultation_modes` -> `availabilityPreview` or future mode labels
- `consultation_modes` containing telemedicine preview -> `telemedicinePreview`

The current public card type already has doctor-friendly fields:

- `specialties`
- `affiliations`
- `availabilityPreview`
- `telemedicinePreview`

## Future Doctor Detail Page Considerations

Doctor detail reads should not be implemented in the first schema task.

Future detail read planning should cover:

- A safe public helper such as `getSupabasePublicDoctorDetailBySlug`.
- Read-by-slug behavior.
- Active/public filters.
- Not-found behavior for blocked or unknown rows.
- Static fallback for existing `/doctors/dr-hana-bekele`.
- Dynamic route planning for `/doctors/[slug]`.
- Public-safe detail fields only.
- No private contact information.
- No license documents.
- No patient data.
- No booking/payment/review data.

Future relationship tables may be needed before richer doctor detail pages:

- Doctor-to-facility affiliations.
- Doctor schedule summaries.
- Doctor specialties.
- Public consultation modes.

## Security And Privacy Notes

Security rules:

- Use anon public reads only for active/public doctor rows.
- Keep service-role keys out of frontend code.
- Keep admin/reviewer functions out of public routes.
- Keep doctor owner permissions for a later authenticated phase.
- Keep RLS as the database boundary.
- Keep app query filters as a second safety boundary.

Privacy rules:

- Do not store private doctor contact data in the public doctors table.
- Do not store license documents or uploaded certificates in the public doctors table.
- Do not store admin notes or reviewer notes in the public doctors table.
- Do not store patient data, bookings, payments, reviews, or ratings in the public doctors table.
- Do not make unverified or disputed claims look equivalent to verified doctors.

## What Should Not Be Implemented Yet

Do not implement yet:

- SQL table creation.
- RLS policy SQL.
- Test inserts.
- Supabase doctor read helpers.
- Source-wrapper switch for doctors.
- `/doctors` Supabase wiring.
- Dynamic `/doctors/[slug]` routing.
- Doctor dashboard.
- Authentication.
- Protected routes.
- Booking, payment, review, rating, or telemedicine functionality.

## Recommended Next Task

Recommended next task:

```text
Create a draft SQL migration for public.doctors only.
```

That task should create a draft SQL file, not run SQL, and should include:

- `public.doctors` table.
- Public-safe fields only.
- Facilities-aligned status constraints.
- Useful lookup indexes.
- Timestamps.
- Optional updated-at trigger helper if reused safely.
- No RLS policies yet.
- No test inserts yet.
- No private/internal fields.

## Summary

The first doctors schema should be a public-safe listing table modeled after facilities. It should support doctor cards and later doctor detail reads with public fields only, active/public eligibility, facilities-aligned status vocabulary, and anon read-only RLS planning.

Private contact details, license documents, certificates, admin notes, patient data, bookings, payments, reviews, and ratings should remain deferred to later protected schemas.
