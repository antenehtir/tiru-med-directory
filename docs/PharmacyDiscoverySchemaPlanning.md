# DigitalDirectory-v2 Pharmacy Discovery Schema Planning

## Purpose

This document plans a safe public schema for pharmacy discovery before any SQL is written.

The goal is to support public pharmacy discovery for patients looking for nearby pharmacies, pharmacy service modes, pickup/delivery availability previews, public hours, and public contact/action channels without creating medicine inventory, prescription upload, delivery ordering, payments, controlled medication, patient address, or pharmacy admin workflows.

This is documentation-only. It does not write SQL, modify app code, modify UI, add test data, use service-role keys, expose environment values, expose keys, or commit changes.

## Product Boundary

This plan is for pharmacy discovery only.

In scope:

- Public pharmacy listing discovery
- Public pharmacy profile fields
- Public service mode labels
- Public pickup and delivery availability indicators
- Public opening hours text
- Public verification and visibility states
- Public contact/action channel mapping through `provider_contact_channels`

Out of scope:

- Medicine inventory
- Stock availability
- Prescription upload
- Prescription validation
- Delivery order processing
- Patient address collection
- Payments
- Refunds
- Wallet flows
- Controlled medication workflows
- Pharmacy admin workflows
- Pharmacy owner dashboards
- Private pharmacy staff contacts
- Patient data
- Booking/order history

## Context Reviewed

Documentation reviewed:

- `docs/ProductVision.md`
- `docs/Architecture.md`
- `docs/DevelopmentRoadmap.md`
- `docs/FacilityDetailRouteQARecord.md`
- `docs/DoctorDetailRouteQARecord.md`
- `docs/ProviderContactChannelsSchemaPlanning.md`
- `docs/ProviderContactChannelsRuntimeQARecord.md`
- `docs/CodexTask-130-PharmacyDiscoverySchemaPlanning.md`

Implementation and schema context inspected:

- `src/app/pharmacies`
- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`
- `src/lib/public-listing-source.ts`
- `supabase/migrations_draft/001_create_facilities_table.sql`
- `supabase/migrations_draft/004_create_doctors_table.sql`
- `supabase/migrations_draft/007_create_provider_contact_channels_table.sql`

## Current State

The current `/pharmacies` route is a static public discovery page.

The public listing mapper already supports pharmacy cards from static seed data and maps pharmacy-like seed entries into the shared `PublicProviderCard` shape.

Supabase-backed public reads currently exist for facilities and doctors only. Pharmacy discovery has not yet received a Supabase table, RLS draft, test data, public read helper, or detail route.

## Proposed Table

Future table name:

```text
public.pharmacies
```

This table should store public-safe pharmacy discovery fields only.

It should not store inventory, prescription data, patient addresses, order records, payment records, controlled medication workflows, private owner contacts, staff contacts, admin notes, verification evidence, or pharmacy dashboard data.

## Public-Safe Fields

Recommended first fields:

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

Field notes:

- `id`: UUID primary key.
- `slug`: Stable public route identifier.
- `display_name`: Reviewed public pharmacy name.
- `pharmacy_type`: Public category for the pharmacy model.
- `description`: Public discovery summary only.
- `city` and `area`: Public location filters and display labels.
- `address_public`: Reviewed public address text only.
- `landmark_public`: Reviewed public landmark/directions hint only.
- `service_modes`: Public service mode labels, not operational order data.
- `opening_hours_public`: Public hours text only.
- `delivery_available`: Public yes/no delivery preview indicator.
- `pickup_available`: Public yes/no pickup preview indicator.
- `accepts_prescription_upload_preview`: Public preview flag only. This must not create upload functionality.
- `listing_status`: Publication lifecycle.
- `visibility_status`: Public visibility boundary.
- `verification_status`: Review/verification state.
- `last_confirmed_at`: Optional public freshness signal.
- `created_at` and `updated_at`: Operational timestamps.

## Pharmacy Type Values

Recommended initial `pharmacy_type` values:

- `retail`
- `hospital_pharmacy`
- `clinic_pharmacy`
- `community_pharmacy`
- `wholesale`
- `online_preview`
- `mixed`

Notes:

- `online_preview` should only indicate a public discovery/service model. It must not imply online ordering, payment, delivery workflow, or prescription processing.
- `mixed` can support pharmacies that fit more than one simple category while the data model matures.

## Service Mode Values

Recommended initial `service_modes` values:

- `in_store`
- `pickup_preview`
- `delivery_preview`
- `whatsapp_inquiry`
- `phone_inquiry`
- `prescription_upload_preview`

Service mode rules:

- These values are public discovery labels only.
- `delivery_preview` does not create delivery order processing.
- `pickup_preview` does not create inventory reservation.
- `prescription_upload_preview` does not create upload functionality.
- `whatsapp_inquiry` and `phone_inquiry` should still use reviewed public contact channels from `provider_contact_channels`.

## Status Vocabulary

Use the same status vocabulary as facilities, doctors, and provider contact channels.

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

## Public Safety Rules

Only reviewed public discovery data should be stored in `public.pharmacies`.

Safe examples:

- Public pharmacy name
- Public pharmacy type
- Public city and area
- Reviewed public address
- Reviewed public landmark
- Public opening hours text
- Public pickup/delivery preview booleans
- Public service mode labels
- Public verification status
- Public freshness timestamp

Do not store:

- Medicine inventory
- Medicine prices
- Controlled medication availability
- Prescription files
- Prescription text
- Patient addresses
- Patient names or contact details
- Order requests
- Delivery assignments
- Payment or wallet data
- Refund data
- Private owner phone numbers
- Private staff phone numbers
- Private staff emails
- Admin or reviewer notes
- Verification documents
- License documents
- Pharmacy dashboard permissions

Public pages should never reveal that a hidden, internal, pending, rejected, archived, or suspended pharmacy listing exists.

## Contact Channel Mapping

Public pharmacy contact/action channels should use:

```text
public.provider_contact_channels
```

Recommended mapping:

```text
provider_type = pharmacy
provider_slug = pharmacies.slug
```

This keeps phone, WhatsApp, website, maps, appointment, social, and future inquiry links out of the pharmacy discovery table while preserving the shared active/public RLS boundary for contact channels.

Pharmacy public contact channel examples:

- Public phone line
- Public WhatsApp inquiry link
- Public website
- Public maps/directions URL
- Public social profile

The contact channel table must still exclude private owner contacts, private staff contacts, patient messaging, prescription uploads, payment sessions, order links, and internal admin URLs.

## RLS Concept

The public RLS model should mirror facilities and doctors.

Anonymous public read:

- `anon` can select pharmacy rows where `listing_status = 'active'` and `visibility_status = 'public'`.
- `anon` cannot insert pharmacy rows.
- `anon` cannot update pharmacy rows.
- `anon` cannot delete pharmacy rows.

Frontend safety:

- Use only public anon client reads.
- Do not use service-role keys in frontend code.
- Do not expose raw Supabase errors in public UI.
- Keep app query filters as an additional safety layer, while relying on RLS as the database boundary.

Future authenticated policies for pharmacy owners, reviewers, admins, and super admins should be planned separately.

## Recommended Routes

Recommended public routes:

- `/pharmacies`
- `/pharmacies/[slug]`

Route scope:

- `/pharmacies` should eventually list active/public pharmacy cards.
- `/pharmacies/[slug]` should eventually show one active/public pharmacy detail.
- Blocked, hidden, internal, pending, rejected, archived, suspended, or unknown slugs should return a safe not-found state.

Do not use these routes for:

- Medicine inventory pages
- Prescription upload
- Checkout
- Delivery order flows
- Pharmacy admin dashboards
- Patient account workflows

## Mapping To Existing Public Card System

Future pharmacy rows can map into the existing `PublicProviderCard` shape:

- `id` -> `id`
- `slug` -> `slug`
- `display_name` -> `name`
- `providerType` -> `pharmacy`
- `pharmacy_type` -> `categoryLabel`
- `description` -> `summary`
- `city` and `area` -> `locationLabel`
- `verification_status` -> `verificationStatus`
- `slug` -> `listingHref`
- `delivery_available` -> `deliveryPreview`
- `pickup_available` -> `pickupPreview`
- `opening_hours_public` -> `hoursPreview`
- `service_modes` -> `services`

Future pharmacy details can map into `PublicProviderDetail` with:

- Public description
- Public location
- Public address
- Public contact channels from `provider_contact_channels`
- Public hours text
- Public verification summary
- Correction request link

## MVP Recommendation

For MVP, create a draft `public.pharmacies` table with:

- Public-safe discovery fields only
- Public status vocabulary aligned with facilities and doctors
- `service_modes` as a simple public text array or equivalent constrained field
- Boolean preview fields for pickup, delivery, and prescription upload preview
- Public address and landmark fields
- Helpful indexes for slug, status, city, area, pharmacy type, and listing visibility
- No inventory fields
- No prescription data
- No patient address fields
- No payment/order workflow fields
- No pharmacy admin fields
- No private contacts

After table planning, the next SQL draft should still be reviewed before being run manually.

## Deferred Features

Defer these until separately planned:

- Medicine inventory
- Stock availability
- Medicine pricing
- Prescription upload
- Prescription review
- Controlled medication workflows
- Delivery order processing
- Pickup reservations
- Patient address capture
- Payment and refund flows
- Pharmacy owner dashboard
- Staff role management
- Admin review workflow for pharmacy updates
- Audit logs
- Notifications
- Pharmacy ratings/reviews
- E-prescription integration

## What Should Not Be Implemented Yet

Do not implement yet:

- SQL table creation
- RLS policy SQL
- Test data inserts
- Supabase pharmacy read helpers
- Pharmacy detail route wiring
- Pharmacy contact-channel wiring
- Inventory or order workflows
- Prescription upload functionality
- Payment functionality
- Pharmacy admin workflows
- Authentication
- Protected routes

## Recommended Next Task

Recommended next task:

```text
Pharmacies Table SQL Draft
```

That task should create a draft SQL file only, not run it, and include:

- `public.pharmacies`
- Public-safe fields
- Status constraints
- Pharmacy type constraints
- Service mode planning
- Public-safety comments
- Helpful indexes
- Updated-at trigger if appropriate
- No RLS yet
- No test inserts yet
- No inventory, prescription, delivery order, payment, patient address, or admin workflow fields

## Summary

`public.pharmacies` should become the public-safe discovery table for pharmacy listings. It should support `/pharmacies` and `/pharmacies/[slug]`, expose only active/public reviewed discovery fields, map public contact/action links through `provider_contact_channels` with `provider_type = pharmacy`, preserve private and patient data boundaries, and avoid inventory, prescriptions, delivery orders, payments, controlled medication workflows, and pharmacy admin workflows until later protected phases.
