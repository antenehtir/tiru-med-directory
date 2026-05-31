# DigitalDirectory-v2 Data Model and Content Structure

## Purpose

This document defines the future data and content structure for DigitalDirectory-v2 before backend, Supabase, admin review, verification workflows, or real healthcare listing data are added.

The current product remains frontend-only. This document is a planning guide for future structured data, database tables, search indexing, and public/internal data separation.

---

## Core Principles

### Public Discovery First

Public browsing should remain fast, open, and login-free. The public content model should support:

- Search by provider, doctor, service, specialty, category, and location
- Clear verification labels
- Mobile-friendly cards and detail pages
- Safe contact and action previews
- Correction and feedback loops

### Trust First

Healthcare listings must preserve a clear difference between verified, pending, community-submitted, rejected, archived, and internally reviewed information.

### Separate Public and Internal Data

Public listing fields should be safe to display. Internal review notes, verification evidence, identity documents, audit logs, admin decisions, private contact notes, and moderation history should never be part of the public content payload.

### Backend Later

No backend, Supabase, database files, authentication, protected routes, dashboards, or real admin workflow should be added until the product is ready for real data operations.

---

## Shared Field Conventions

Future records should use consistent field names across models.

Common fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable internal identifier |
| `slug` | Public URL-safe identifier |
| `name` | Public display name |
| `description` | Short public summary |
| `created_at` | Creation timestamp |
| `updated_at` | Last update timestamp |
| `published_at` | Public publication timestamp |
| `created_by` | Future account or system actor |
| `updated_by` | Future account or system actor |
| `listing_status` | Draft, published, hidden, archived, suspended |
| `verification_status` | Unverified, pending, verified, rejected, expired, community submitted |
| `review_status` | Not reviewed, in review, needs changes, approved, rejected |
| `source_type` | Admin entered, provider submitted, migrated, community submitted, partner supplied |
| `source_note` | Internal source context |

Recommended ID strategy:

- Use stable generated IDs internally.
- Use readable slugs publicly.
- Do not rely on provider names as unique identifiers.

Recommended text strategy:

- Store canonical names separately from aliases.
- Store search keywords separately from public descriptions.
- Keep future Amharic or multilingual fields additive rather than replacing English fields.

---

## Facilities

Facilities represent hospitals, clinics, health centers, specialty centers, and similar healthcare locations.

Suggested public fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Internal stable ID |
| `slug` | string | Public route segment |
| `name` | string | Facility name |
| `facility_type` | enum | Hospital, clinic, health center, specialty center, other |
| `description` | string | Short public summary |
| `services` | relation | Linked service records |
| `specialties` | relation | Linked specialty records |
| `location_id` | relation | City, subcity, area, or region |
| `address_line` | string | Human-readable address |
| `contact_channels` | relation | Public phone, email, website, social links |
| `working_hours` | relation | Weekly schedule |
| `verification_status` | enum | Public trust label |
| `listing_status` | enum | Public visibility state |
| `image_url` | string | Future safe public image |
| `latitude` | number | Future maps/search only |
| `longitude` | number | Future maps/search only |
| `accepts_walk_ins` | boolean | Future filter |
| `emergency_available` | boolean | Future filter |

Suggested internal fields:

| Field | Purpose |
| --- | --- |
| `owner_account_id` | Future facility account ownership |
| `verification_case_id` | Link to admin review |
| `internal_notes` | Admin-only notes |
| `source_type` | Imported, provider submitted, admin entered |
| `source_confidence` | Internal quality estimate |
| `last_verified_at` | Freshness indicator |
| `next_review_at` | Reverification schedule |

---

## Doctors

Doctors represent individual healthcare professionals.

Suggested public fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Internal stable ID |
| `slug` | string | Public route segment |
| `full_name` | string | Doctor display name |
| `title` | string | Dr., Prof., etc. |
| `specialties` | relation | Linked specialties |
| `facility_affiliations` | relation | Linked facilities |
| `location_id` | relation | Primary location |
| `bio` | string | Short public summary |
| `languages` | string array | Future accessibility filter |
| `availability_summary` | string | Public preview text |
| `telemedicine_available` | boolean | Future preview/filter |
| `contact_channels` | relation | Public contact options when allowed |
| `verification_status` | enum | Public trust label |
| `listing_status` | enum | Public visibility state |
| `profile_image_url` | string | Future safe public image |

Suggested internal fields:

| Field | Purpose |
| --- | --- |
| `owner_account_id` | Future doctor account ownership |
| `license_reference` | Internal verification reference |
| `verification_case_id` | Link to review workflow |
| `internal_notes` | Admin-only notes |
| `last_verified_at` | Freshness indicator |
| `next_review_at` | Reverification schedule |

---

## Pharmacies

Pharmacies may be modeled as specialized providers rather than ordinary facilities if pharmacy-specific workflows become important.

Suggested public fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Internal stable ID |
| `slug` | string | Public route segment |
| `name` | string | Pharmacy name |
| `description` | string | Public summary |
| `location_id` | relation | City, area, or region |
| `address_line` | string | Human-readable address |
| `contact_channels` | relation | Public phone, email, website |
| `working_hours` | relation | Weekly schedule |
| `verification_status` | enum | Public trust label |
| `listing_status` | enum | Public visibility state |
| `pickup_available` | boolean | Future preview only until real workflow exists |
| `delivery_ready` | boolean | Future preview only until real workflow exists |
| `services` | relation | Pharmacy services such as counseling or refill support |

Suggested internal fields:

| Field | Purpose |
| --- | --- |
| `owner_account_id` | Future pharmacy account ownership |
| `verification_case_id` | Link to review workflow |
| `inventory_enabled` | Future feature flag |
| `internal_notes` | Admin-only notes |

Important future boundary:
Medication inventory, prescription upload, payment, ordering, and delivery workflows should not be modeled as public fields until those features are real and properly reviewed.

---

## Diagnostics Providers

Diagnostics providers include laboratories, imaging centers, and diagnostic service centers.

Suggested public fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Internal stable ID |
| `slug` | string | Public route segment |
| `name` | string | Provider name |
| `diagnostics_type` | enum | Laboratory, imaging, mixed diagnostics |
| `description` | string | Public summary |
| `location_id` | relation | City, area, or region |
| `address_line` | string | Human-readable address |
| `contact_channels` | relation | Public phone, email, website |
| `working_hours` | relation | Weekly schedule |
| `services` | relation | Lab tests or imaging services |
| `verification_status` | enum | Public trust label |
| `listing_status` | enum | Public visibility state |
| `result_delivery_preview` | string | Future informational preview only |

Suggested internal fields:

| Field | Purpose |
| --- | --- |
| `owner_account_id` | Future diagnostics account ownership |
| `verification_case_id` | Link to review workflow |
| `internal_notes` | Admin-only notes |
| `test_catalog_review_status` | Future review state for tests |

Important future boundary:
Test inventory, pricing, bookings, payment, file upload, and result delivery should not be public operational data until those workflows exist.

---

## Services

Services describe healthcare capabilities offered by facilities, doctors, pharmacies, and diagnostics providers.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `slug` | string | Search-friendly identifier |
| `name` | string | Public service name |
| `category` | enum | Facility, doctor, pharmacy, diagnostics, general |
| `description` | string | Public explanation |
| `aliases` | string array | Search synonyms |
| `related_specialty_ids` | relation | Optional |
| `is_public` | boolean | Whether visible in public search |
| `review_status` | enum | Admin review state |

Examples:

- Emergency care
- Pediatrics
- Maternal care
- Laboratory testing
- Ultrasound
- Prescription pickup
- Vaccination

---

## Specialties

Specialties describe clinical areas and doctor discovery categories.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `slug` | string | Public route/search key |
| `name` | string | Public name |
| `description` | string | Short explanation |
| `aliases` | string array | Search synonyms |
| `parent_specialty_id` | relation | Optional hierarchy |
| `is_featured` | boolean | Homepage or browse use |
| `review_status` | enum | Admin review state |

Examples:

- Cardiology
- Pediatrics
- Dermatology
- Obstetrics and gynecology
- Internal medicine

---

## Locations

Locations should support public display, filtering, nearby search, and future map features.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `name` | string | Public name |
| `slug` | string | URL/search-safe key |
| `location_type` | enum | Country, region, city, subcity, woreda, area |
| `parent_location_id` | relation | Hierarchical location |
| `display_name` | string | Human-friendly full name |
| `latitude` | number | Future map/nearby use |
| `longitude` | number | Future map/nearby use |
| `is_public` | boolean | Whether available in filters |

Location data should be normalized so providers can share a location record instead of duplicating inconsistent location strings.

---

## Contact Channels

Contact channels should be structured so public contact details can be displayed safely and corrected easily.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `owner_type` | enum | Facility, doctor, pharmacy, diagnostics provider, platform |
| `owner_id` | string | Linked record |
| `channel_type` | enum | Phone, email, website, Telegram, LinkedIn, Facebook, Instagram, TikTok, WhatsApp |
| `label` | string | Public label |
| `value` | string | Phone number, URL, or address |
| `is_public` | boolean | Whether users can see it |
| `is_primary` | boolean | Preferred public channel |
| `verification_status` | enum | Whether the channel was checked |
| `last_verified_at` | timestamp | Freshness indicator |

Private contact notes, internal provider contacts, and reviewer communication history should be stored separately from public contact channels.

---

## Verification Status

Verification status is the public trust signal for a listing or contact detail.

Recommended statuses:

| Status | Public Meaning |
| --- | --- |
| `verified` | Reviewed and approved by the platform |
| `pending_verification` | Submitted or under review |
| `community_submitted` | Added by community and not yet verified |
| `unverified` | Public information exists but has not been checked |
| `needs_update` | Information may be outdated |
| `rejected` | Failed review and should not appear as trusted |
| `expired` | Previously verified but needs re-checking |

Rules:

- Verified and unverified listings must look different.
- Verification status should have timestamps.
- Verification status changes should create audit records.
- Public UI should show simple labels, not internal review complexity.

---

## Listing Status

Listing status controls whether a record appears publicly.

Recommended statuses:

| Status | Purpose |
| --- | --- |
| `draft` | Internal or provider-submitted, not public |
| `published` | Publicly visible |
| `hidden` | Temporarily removed from public surfaces |
| `archived` | No longer active but preserved for records |
| `suspended` | Removed due to trust, safety, or policy concern |
| `duplicate` | Merged or replaced by another listing |

Rules:

- `listing_status` controls visibility.
- `verification_status` controls trust label.
- A listing can be published but unverified.
- A verified listing can become hidden or archived.

---

## Working Hours

Working hours should be reusable across provider types.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `owner_type` | enum | Facility, doctor, pharmacy, diagnostics provider |
| `owner_id` | string | Linked record |
| `day_of_week` | enum | Monday through Sunday |
| `opens_at` | time | Nullable if closed |
| `closes_at` | time | Nullable if closed |
| `is_closed` | boolean | Closed that day |
| `is_24_hours` | boolean | Always open that day |
| `notes` | string | Public note such as holiday changes |

Future additions:

- Holiday schedules
- Special doctor availability
- Booking slots
- Emergency-only schedules

Working hours should support display before real booking logic exists.

---

## Provider Registration Requests

Registration requests are future intake records, not public listings by default.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `request_type` | enum | Add listing, claim listing, verify listing, update listing |
| `provider_type` | enum | Doctor, facility, pharmacy, diagnostics provider |
| `provider_name` | string | Submitted name |
| `contact_name` | string | Submitter name |
| `contact_phone` | string | Private by default |
| `contact_email` | string | Private by default |
| `submitted_details` | json | Submitted profile fields |
| `related_listing_id` | string | Optional existing listing |
| `status` | enum | New, in review, needs information, approved, rejected, duplicate |
| `assigned_reviewer_id` | string | Future reviewer |
| `created_at` | timestamp | Submission time |
| `updated_at` | timestamp | Last change |

Rules:

- Do not publish registration request data automatically.
- Keep submitter contact details private.
- Require admin or reviewer approval before public listing changes.

---

## Correction Requests

Correction requests help improve listing accuracy.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `listing_type` | enum | Facility, doctor, pharmacy, diagnostics provider |
| `listing_id` | string | Target listing |
| `correction_type` | enum | Name, address, phone, hours, services, verification, duplicate, closed, other |
| `submitted_value` | string/json | Proposed correction |
| `current_value_snapshot` | string/json | Public value at submission time |
| `submitter_name` | string | Optional |
| `submitter_contact` | string | Private by default |
| `status` | enum | New, in review, accepted, rejected, needs information |
| `assigned_reviewer_id` | string | Future reviewer |
| `resolution_note` | string | Internal or public-safe note |
| `created_at` | timestamp | Submission time |
| `resolved_at` | timestamp | Completion time |

Rules:

- Store a snapshot of the current public value.
- Do not apply corrections automatically.
- Accepted corrections should update the listing through an auditable change.

---

## Feedback Submissions

Feedback submissions help improve the platform, not necessarily a specific listing.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `feedback_type` | enum | Listing accuracy, platform experience, feature request, trust concern, other |
| `message` | string | Submitted feedback |
| `related_page` | string | Optional page path |
| `related_listing_type` | enum | Optional |
| `related_listing_id` | string | Optional |
| `submitter_contact` | string | Optional and private |
| `status` | enum | New, reviewed, planned, closed, duplicate |
| `priority` | enum | Low, normal, high, urgent |
| `created_at` | timestamp | Submission time |

Rules:

- Feedback should not be confused with verified healthcare data.
- Feedback can inform product work, correction review, or support follow-up.
- Private submitter details should not appear in public content.

---

## Community Channels

Community channels describe official update surfaces such as Telegram, LinkedIn, Facebook, Instagram, TikTok, Email updates, and WhatsApp.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `channel_type` | enum | Telegram, LinkedIn, Facebook, Instagram, TikTok, Email, WhatsApp |
| `label` | string | Public display label |
| `url` | string | Official link when available |
| `description` | string | Public purpose |
| `audience` | string | Patients, providers, partners, community |
| `is_public` | boolean | Whether to display |
| `is_official` | boolean | Whether verified as official |
| `display_order` | number | Footer/contact ordering |

Rules:

- Use placeholder links only until official links exist.
- Do not add social login, social APIs, tracking pixels, or analytics as part of channel data.
- Community channels should support trust and awareness, not replace verified listings.

---

## Admin Review

Admin review records should preserve decisions, auditability, and accountability.

Suggested fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID |
| `review_subject_type` | enum | Listing, registration request, correction request, feedback, contact channel |
| `review_subject_id` | string | Linked record |
| `assigned_to` | string | Future reviewer/admin |
| `status` | enum | New, in review, needs information, approved, rejected, escalated |
| `decision` | enum | Approve, reject, request changes, merge duplicate, archive, suspend |
| `decision_reason` | string | Internal reason |
| `public_note` | string | Optional public-safe explanation |
| `internal_notes` | string | Private notes |
| `created_at` | timestamp | Creation time |
| `decided_at` | timestamp | Decision time |

Review actions should create audit log entries.

Suggested audit fields:

| Field | Purpose |
| --- | --- |
| `actor_id` | Admin, reviewer, provider, or system actor |
| `action_type` | Created, updated, approved, rejected, archived, suspended |
| `entity_type` | Listing, request, user, role, contact channel |
| `entity_id` | Target record |
| `before_snapshot` | Prior values |
| `after_snapshot` | New values |
| `created_at` | Action time |

---

## Public vs Internal Data Separation

Public data should include:

- Provider names
- Public categories and types
- Public location and address text
- Public contact channels
- Public services and specialties
- Public working hours
- Public verification label
- Public listing status
- Public descriptions and images

Internal data should include:

- Verification evidence
- Uploaded documents
- Identity references
- Admin notes
- Reviewer notes
- Submitter private contacts
- Provider private contacts
- Audit logs
- Rejection reasons when not public-safe
- Source confidence
- Duplicate merge history
- Abuse or safety flags

Rules:

- Keep public API payloads small and safe.
- Keep admin review payloads protected.
- Never expose private submitter contact details in public listing data.
- Never expose verification documents publicly.
- Do not use internal trust notes as public marketing copy.

---

## Future Search Index Planning

Search should be planned around fast public discovery.

Searchable public fields:

- Provider name
- Doctor name
- Facility name
- Pharmacy name
- Diagnostics provider name
- Services
- Specialties
- Categories
- Location names
- Address text
- Aliases and keywords
- Verification status
- Listing status

Recommended search index fields:

| Field | Purpose |
| --- | --- |
| `entity_type` | Facility, doctor, pharmacy, diagnostics provider, service, specialty |
| `entity_id` | Source record |
| `title` | Main search result title |
| `subtitle` | Specialty, type, or category |
| `body` | Description, services, aliases, address |
| `location_text` | Searchable location label |
| `category_tokens` | Filter-friendly categories |
| `service_tokens` | Filter-friendly services |
| `specialty_tokens` | Filter-friendly specialties |
| `verification_status` | Trust filter |
| `listing_status` | Visibility filter |
| `ranking_score` | Future manual or computed ranking |
| `updated_at` | Freshness sorting |

Search rules:

- Exclude hidden, archived, suspended, rejected, or draft records from public search.
- Verified listings can receive a trust boost, but should not hide useful unverified results.
- Search should support aliases for common spelling differences.
- Location filters should use normalized location IDs, not raw address strings.
- Future Amharic search should add language-specific aliases and normalized tokens.

---

## Future Supabase Table Mapping

Supabase is a future backend/auth consideration only. The following mapping is planning guidance, not an implementation instruction.

Potential future tables:

| Content Area | Possible Supabase Table |
| --- | --- |
| Facilities | `facilities` |
| Doctors | `doctors` |
| Pharmacies | `pharmacies` |
| Diagnostics providers | `diagnostics_providers` |
| Services | `services` |
| Specialties | `specialties` |
| Locations | `locations` |
| Contact channels | `contact_channels` |
| Working hours | `working_hours` |
| Provider affiliations | `provider_affiliations` |
| Facility services | `facility_services` |
| Doctor specialties | `doctor_specialties` |
| Pharmacy services | `pharmacy_services` |
| Diagnostics services | `diagnostics_services` |
| Registration requests | `provider_registration_requests` |
| Correction requests | `correction_requests` |
| Feedback submissions | `feedback_submissions` |
| Community channels | `community_channels` |
| Verification cases | `verification_cases` |
| Admin reviews | `admin_reviews` |
| Audit logs | `audit_logs` |
| Search index | `search_documents` or managed search service |

Future Supabase planning notes:

- Use Row Level Security before provider dashboards exist.
- Keep public read policies limited to published public fields.
- Keep verification evidence private.
- Separate admin/reviewer access from provider ownership.
- Use audit logs for trust-critical changes.
- Avoid adding storage buckets for documents until verification upload is real.
- Avoid adding auth until role strategy and ownership rules are ready.

---

## Migration Readiness

Before migrating old or real data:

1. Define canonical provider categories.
2. Define required vs optional fields for each provider type.
3. Normalize locations.
4. Normalize specialties and services.
5. Decide how duplicates will be detected.
6. Decide how migrated records are marked as verified, unverified, or community submitted.
7. Preserve source information internally.
8. Keep migrated private fields out of public payloads.
9. Review sample records manually before public launch.

---

## Recommended Next Development Order

1. Keep the app frontend-only while the public discovery experience is polished.
2. Define TypeScript-facing content contracts for sample data, if needed, without adding backend files.
3. Normalize current sample facilities, doctors, pharmacies, and diagnostics providers around the same field concepts.
4. Prepare a migration checklist for old healthcare data.
5. Plan backend schema from this document and the user role strategy.
6. Add backend only after ownership, verification, audit, and public/internal data boundaries are clear.
7. Add Supabase only when database, authentication, storage, and policy needs are ready to be implemented together.

---

## Summary

DigitalDirectory-v2 should model healthcare content around public discovery, trust labels, structured services, normalized locations, correction loops, feedback loops, and admin review readiness.

The public model should remain simple and safe. Internal data should support future verification, auditability, ownership, review decisions, and responsible backend growth.
