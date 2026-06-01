# DigitalDirectory-v2 Supabase Integration Phase 1

## Purpose

This document defines the Phase 1 plan for future Supabase integration in DigitalDirectory-v2.

It is planning-only. It does not add backend functionality, Supabase client code, Supabase packages, database files, migrations, SQL, authentication, dashboards, protected routes, storage buckets, Edge Functions, packages, or frontend UI changes.

The goal is to prepare a safe first integration phase for public provider data, request/review workflows, provider ownership planning, row-level security principles, audit logs, and deployment readiness before implementation begins.

---

## Core Principle

Supabase should be introduced gradually, with public-safe healthcare directory data first and sensitive workflows later.

DigitalDirectory-v2 should avoid adding database complexity before the product has clear content boundaries, review rules, ownership rules, and security policies. Phase 1 should focus on preparing the structure for a trusted public directory and admin-reviewed intake workflows, not on building advanced patient, payment, document, chat, or community systems.

Public healthcare browsing should remain open and login-free.

---

## Supabase Phase 1 Purpose

Supabase Phase 1 should prepare the first real backend foundation for DigitalDirectory-v2.

Primary purposes:

- Move from static seed planning toward reviewed database-backed public listings later.
- Define public vs private data boundaries before tables exist.
- Prepare initial table groups for public provider discovery.
- Prepare request and review table groups for provider registration, corrections, and feedback.
- Prepare provider ownership concepts without launching provider dashboards.
- Define row-level security principles before implementation.
- Define environment variable requirements without creating environment files now.
- Plan seed data migration from static sample records.
- Establish audit log expectations for trust-critical actions.
- Keep advanced features explicitly out of scope.

Phase 1 should be treated as a foundation, not as a full backend launch.

---

## What Phase 1 Should Include

Phase 1 should include planning and later implementation for a narrow backend slice.

Recommended Phase 1 scope:

- Supabase project setup planning.
- Environment variable naming and security planning.
- Initial public table planning for directory listings.
- Initial taxonomy table planning for locations, services, and specialties.
- Public/private field separation.
- Static seed data migration strategy.
- Request intake planning for provider registration, corrections, contact, and feedback.
- Admin review table foundation.
- Provider ownership table planning.
- Audit log planning.
- RLS policy direction.
- Deployment and environment separation planning.

Later Phase 1 implementation may include:

- Creating a Supabase project.
- Adding the Supabase package.
- Adding a Supabase client.
- Adding database migrations.
- Adding RLS policies.
- Connecting read-only public listing pages to approved public tables.

Those implementation steps should happen only in a dedicated future implementation task, not in this planning task.

---

## What Phase 1 Should Not Include Yet

Phase 1 should not attempt advanced product features.

Out of scope:

- Authentication launch
- Patient accounts
- Provider dashboards
- Admin dashboards
- Protected routes
- Booking and scheduling functionality
- Payments or wallet functionality
- Patient document vault
- Supabase Storage buckets
- File upload
- Telemedicine
- Chatbot integration
- Community groups
- Patient reviews and ratings
- Notifications or reminders
- Transport or ride-hailing
- Referral tracking
- Real-time chat or forums
- Edge Functions
- External APIs
- Social integrations
- Email, SMS, WhatsApp, Telegram, or push integrations

Phase 1 should not collect sensitive patient data.

Phase 1 should not store medical records, diagnoses, prescriptions, lab results, wallet data, transport data, chat messages, community posts, or private document files.

---

## Environment Variable Planning

Environment variables should be planned before any Supabase client or server code is added.

Potential future variables:

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL for browser client | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key with RLS | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged operations | Private server only |
| `SUPABASE_PROJECT_REF` | Deployment and tooling reference | Private or CI only |
| `SUPABASE_DB_PASSWORD` | Database management, if needed | Private |
| `SUPABASE_JWT_SECRET` | Auth/JWT validation, if needed | Private |

Rules:

- Do not create `.env` files in this planning task.
- Never expose service role keys to browser code.
- Public anon keys must rely on strict RLS.
- Separate local, preview, staging, and production environment values later.
- Document required variables before implementation.
- Keep deployment secrets in the deployment provider, not in git.
- Rotate secrets if they are ever exposed.

Phase 1 should include a checklist for environment setup, but not actual secrets.

---

## Public vs Private Data Boundaries

Supabase Phase 1 should make data separation explicit.

### Public Data

Public data may be readable by anonymous users if published and approved.

Examples:

- Facility name
- Facility type
- Public location
- Public services
- Public working hours
- Public contact channels
- Doctor name
- Doctor specialty
- Public facility affiliation
- Pharmacy or diagnostics provider public summary
- Verification status label
- Listing status label
- Public slug

### Private/Internal Data

Private/internal data should not be exposed to anonymous users.

Examples:

- Admin notes
- Reviewer notes
- Internal source confidence
- Verification evidence
- Provider ownership records
- Private submitter contact
- Private provider contacts
- Audit logs
- Request review history
- RLS role assignment data
- Patient identity
- Booking data
- Payment data
- Document vault data
- Moderation reports

Rules:

- Public tables or views should expose only public-safe fields.
- Internal tables should require authenticated role-scoped access later.
- Request tables should not be anonymously readable.
- Review tables should never be public.
- Search indexes should include only public-safe content.
- Public pages should not query private tables directly.

---

## Initial Public Table Planning

Initial public tables should support the current directory experience without adding advanced workflows.

Potential Phase 1 public table groups:

| Table | Purpose |
| --- | --- |
| `facilities` | Public facility listings |
| `doctors` | Public doctor listings |
| `pharmacies` | Public pharmacy listings |
| `diagnostics_providers` | Public diagnostics provider listings |
| `locations` | Normalized public locations |
| `services` | Public healthcare service taxonomy |
| `specialties` | Public specialty taxonomy |
| `contact_channels` | Public provider contact methods |
| `working_hours` | Public hours for providers |
| `provider_services` | Provider to service relationships |
| `doctor_facility_affiliations` | Reviewed doctor/facility relationships |

Public listing fields should include:

- Stable `id`
- Public `slug`
- Display `name`
- Provider type
- Public description
- Public location reference
- Verification status
- Listing status
- Review status or published flag
- Created and updated timestamps

Rules:

- Only published records should appear on public pages.
- Public provider records should not contain internal review notes.
- Doctor and facility affiliations should be reviewed before public display.
- Public contact channels should be reviewed before publication.
- Locations should support future destination accuracy without exposing unreviewed coordinates as trusted data.
- Public tables should prepare for search but not require advanced search infrastructure immediately.

---

## Request and Review Table Planning

Phase 1 should prepare request and review foundations before dashboards exist.

Potential request tables:

| Table | Purpose |
| --- | --- |
| `provider_registration_requests` | Provider listing and claim requests |
| `correction_requests` | Public listing correction submissions |
| `feedback_submissions` | Platform feedback, trust concerns, feature requests |
| `contact_messages` | Contact/support inquiries |
| `listing_update_requests` | Future provider-submitted updates |

Potential review tables:

| Table | Purpose |
| --- | --- |
| `admin_reviews` | Review decisions across request types |
| `review_assignments` | Reviewer/admin assignment planning |
| `review_status_events` | Status transition history |
| `verification_cases` | Provider verification request planning |
| `duplicate_listing_reviews` | Duplicate listing resolution |
| `moderation_flags` | Trust and safety concerns later |

Rules:

- Request submissions should not publish automatically.
- Request submitter contact details should be private.
- Review decisions should be auditable.
- Review status should be separate from public listing status.
- Correction requests should snapshot current public values.
- Provider registration requests should support duplicate detection.
- Feedback should route to support, correction, feature, or trust/safety workflows.

Phase 1 can plan the tables before building review dashboards.

---

## Provider Ownership Planning

Provider ownership should be planned in Phase 1 but not launched without authentication and review workflows.

Potential provider ownership tables:

| Table | Purpose |
| --- | --- |
| `provider_ownerships` | Links accounts or organizations to provider records later |
| `provider_owner_claims` | Claim requests before approval |
| `organization_memberships` | Future provider team/staff access |
| `provider_team_members` | Alternative scoped team membership table |
| `provider_role_assignments` | Owner, manager, staff, viewer planning |

Ownership rules:

- Public browsing does not require ownership.
- Ownership claims should go through review.
- Ownership approval should not automatically verify a provider.
- Facility managers should have less authority than facility owners.
- Doctors should not be assigned to facilities without reviewed affiliation.
- Provider ownership should not grant access to patient data by default.
- Ownership changes should be high-risk and audited.

Phase 1 should define ownership structure, but provider dashboards and protected routes should wait.

---

## RLS Principles

Row-level security should be designed before tables are implemented.

Core RLS principles:

- Enable RLS on all tables by default.
- Anonymous users can read only published public-safe records.
- Anonymous users cannot read private request, review, ownership, audit, patient, booking, payment, document, or community data.
- Anonymous users may submit limited public forms later through controlled insert policies or server-side handlers.
- Authenticated patients can read only their own patient-specific records later.
- Provider owners can read and submit requests only for owned providers later.
- Provider staff access should be scoped by organization and role.
- Reviewers can read only assigned review cases where possible.
- Admins can manage operational review data.
- Super Admin access should be rare, audited, and reserved for sensitive governance actions.
- Service role access should be server-only and minimized.

Public data access direction:

- Prefer public views or filtered queries that expose only approved rows.
- Use `listing_status = published` and review/publish flags to control visibility.
- Avoid exposing raw internal records to public clients.
- Keep public search documents separate from internal source records if needed later.

Write access direction:

- Public inserts should be narrow, validated, and rate-limited later.
- Provider writes should create requests, not direct public changes.
- Reviewers/admins should approve changes through review flows.
- Sensitive writes should create audit logs.

---

## Auth Timing and Scope

Authentication should not be added in Phase 1 planning or before real account-based actions need it.

Auth should come later when the product needs:

- Provider ownership claims
- Provider dashboards
- Admin review dashboards
- Reviewer assignment workflows
- Patient booking history
- Patient notification preferences
- Patient document vault
- Reviews requiring verified visit
- Wallet/payment flows
- Community group membership

Recommended auth phases:

| Phase | Scope |
| --- | --- |
| Auth 0 | No auth, public browsing only |
| Auth 1 | Admin/reviewer internal access |
| Auth 2 | Provider owner and manager accounts |
| Auth 3 | Patient accounts for booking/preferences |
| Auth 4 | Sensitive patient workflows such as documents, wallet, community |

Rules:

- Do not require login for public discovery.
- Do not add sign-in as a required route before actions need it.
- Do not add protected routes until RLS, roles, and dashboards are planned.
- Auth should not be added just to read public provider listings.
- Account roles should follow the user roles and governance strategies.

---

## Seed Data Migration Strategy

Phase 1 should prepare migration from static seed files to Supabase records.

Existing seed files:

- `src/data/seed-facilities.ts`
- `src/data/seed-doctors.ts`
- `src/data/seed-pharmacies.ts`
- `src/data/seed-diagnostics.ts`
- `src/data/seed-services.ts`
- `src/data/seed-specialties.ts`
- `src/data/seed-locations.ts`
- `src/data/seed-community-channels.ts`

Migration principles:

- Seed records are sample-only and should not be treated as real verified data.
- Public labels such as verified or pending in seed data are preview labels, not real claims.
- Real migration should use reviewed source data only.
- Normalize locations, services, specialties, and contact channels before provider migration.
- Use stable slugs and IDs.
- Keep private/internal migration metadata separate from public display fields.
- Add source type and source confidence internally.
- Do not import sensitive data into public tables.

Recommended migration order:

1. Locations
2. Services
3. Specialties
4. Facilities
5. Doctors
6. Doctor/facility affiliations
7. Pharmacies
8. Diagnostics providers
9. Contact channels
10. Working hours
11. Public search documents later

Rules:

- Review imported records before marking them published.
- Keep sample data separate from production data.
- Use staging before production.
- Preserve source and review status.
- Do not migrate old data until an explicit migration task is approved.

---

## Admin Review Workflow Foundation

Phase 1 should prepare the backend foundation for admin review without building dashboards yet.

Review workflow needs:

- Queue type
- Request type
- Request payload snapshot
- Current status
- Priority
- Assigned reviewer/admin
- Decision type
- Decision reason
- Public-safe notes
- Internal notes
- Before/after snapshots
- Created, updated, reviewed timestamps
- Audit log linkage

Review statuses:

- New
- In review
- Needs information
- Approved
- Rejected
- Duplicate
- Escalated
- Archived

Decision types:

- Approve
- Reject
- Request information
- Mark duplicate
- Merge
- Escalate
- Hide
- Archive

Rules:

- Admin review tables should be private.
- Requests should not change public listing data until approved.
- Trust and safety cases should have escalation paths.
- Reviewers should not see more private data than needed.
- Admin actions should be auditable.
- Super Admin should handle severe governance, privacy, role misuse, or sensitive escalations later.

---

## Audit Log Planning

Audit logs should be planned before sensitive workflows are implemented.

Actions to audit in Phase 1 and later:

- Public listing created
- Public listing updated
- Listing status changed
- Verification status changed
- Provider registration request submitted
- Correction request submitted
- Feedback submitted
- Review assigned
- Review decision made
- Provider ownership claim submitted
- Provider ownership approved or rejected
- Contact/channel changed
- Location changed
- RLS-sensitive role assignment changed
- Admin or reviewer accessed private request data

Potential audit fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable audit record |
| `actor_id` | Account or system actor later |
| `actor_role` | Role at time of action |
| `action_type` | What happened |
| `entity_type` | Table or domain object |
| `entity_id` | Target record |
| `before_snapshot` | Previous state when appropriate |
| `after_snapshot` | New state when appropriate |
| `reason` | Decision or change reason |
| `created_at` | Timestamp |
| `metadata` | Public-safe technical context |

Rules:

- Audit logs should be append-only.
- Audit logs should not be public.
- Sensitive data in audit snapshots should be minimized.
- Super Admin access to audit logs should be rare and logged.
- Audit logs should not contain raw secrets, payment details, document contents, or medical records.

---

## Storage Boundaries

Supabase Storage should not be part of Phase 1.

Out of scope:

- Patient document vault storage
- Provider verification document uploads
- Support attachments
- Public provider image uploads
- Prescriptions
- Lab results
- Imaging files
- Identity documents
- Payment receipts

Future storage bucket planning:

| Bucket | Future Purpose | Phase 1 Status |
| --- | --- | --- |
| `public-provider-images` | Reviewed public logos/photos | Later |
| `verification-documents` | Private provider verification evidence | Later |
| `patient-documents` | Private patient vault files | Later |
| `support-attachments` | Support case attachments | Later |
| `community-attachments` | Community media, if ever allowed | Later or avoid |

Rules:

- Do not create storage buckets in Phase 1 planning.
- Do not upload files before access policies, scanning, retention, and privacy rules exist.
- Keep public provider images separate from private verification or patient documents.
- Service role keys must never be exposed to browser upload code.
- Signed URLs, if used later, should be short-lived.

---

## Edge Function Boundaries Later

Edge Functions should not be added in Phase 1.

Potential future Edge Function use cases:

- Validated public form submission
- Search indexing
- Notification delivery
- Payment webhooks
- Provider verification processing
- File scanning callbacks
- Scheduled reminders
- Admin review automation
- Secure server-side actions requiring service role

Phase 1 rules:

- Do not add Edge Functions.
- Do not add serverless notification, payment, search, or storage handlers.
- Do not add scheduled jobs.
- Do not add webhook endpoints.
- Do not store service role secrets in frontend code.

Future functions should be added only when a real server-side workflow requires them.

---

## Security Considerations

Security should be part of Phase 1 planning before implementation.

Key security rules:

- RLS enabled on every table.
- Public access limited to published public-safe data.
- Service role key stays server-only.
- No secrets committed to git.
- No patient data in public records.
- No medical documents in public tables.
- No raw payment details.
- No public access to review notes or audit logs.
- No provider ownership write access before authentication and review.
- No dashboard routes before role and RLS policy planning.
- No storage before bucket and file access policies are defined.
- No external integrations before threat modeling.

Operational security:

- Use separate environments for development, preview, staging, and production later.
- Use least-privilege policies.
- Log sensitive admin actions.
- Plan backup and restore before production launch.
- Plan data retention and deletion rules.
- Plan incident response for leaked secrets or accidental public data exposure.

---

## Deployment Considerations

Phase 1 should prepare deployment but not modify deployment configuration in this task.

Future deployment planning:

- Separate Supabase projects or schemas for local, staging, and production.
- Separate environment variables per deployment environment.
- Preview deployments should not point at production data unless read-only and approved.
- Production data should not be seeded from sample records without review.
- Database migrations should be versioned and reviewed.
- RLS policies should be tested before production.
- Public pages should have fallback states for unavailable backend data.
- Build and lint checks should run after code integration begins.

Checklist for future implementation:

- Supabase project created.
- Required environment variables defined.
- Local development setup documented.
- Migration approach chosen.
- RLS policies written and tested.
- Public data read path verified.
- Private request path verified.
- Deployment provider secrets configured.
- No service role keys exposed.

---

## Future Table Groups

Supabase planning should group tables by product maturity.

### Phase 1 Candidate Tables

- Locations
- Services
- Specialties
- Facilities
- Doctors
- Pharmacies
- Diagnostics providers
- Contact channels
- Working hours
- Provider services
- Doctor facility affiliations
- Provider registration requests
- Correction requests
- Feedback submissions
- Contact messages
- Admin reviews
- Audit logs

### Phase 2 Candidate Tables

- Provider ownerships
- Provider owner claims
- Organization memberships
- Verification cases
- Listing update requests
- Review assignments
- Review status events
- Search documents

### Later Table Groups

- Authentication profiles
- Provider dashboards
- Patient profiles
- Booking and scheduling
- Notification preferences and events
- Reviews and ratings
- Payments and wallet
- Patient document vault
- Transport and ride-hailing
- Chatbot interactions
- Community groups
- Referral tracking
- Storage metadata

Rules:

- Later table groups should not be pulled into Phase 1 unless a real approved workflow needs them.
- Patient-specific and financial tables should wait for stronger privacy and compliance planning.
- Community and chatbot tables should wait for safety and moderation tooling.

---

## Recommended Phase 1 Implementation Order

When implementation is explicitly approved later, Phase 1 should proceed in a careful order.

Recommended order:

1. Confirm Phase 1 scope and out-of-scope items.
2. Create Supabase project outside this planning task.
3. Define local, staging, and production environment variable names.
4. Add Supabase package and client in a dedicated implementation task.
5. Create initial migrations for taxonomy and public provider tables.
6. Enable RLS on every table immediately.
7. Add public read policies for published public-safe records only.
8. Add request intake tables for registration, corrections, contact, and feedback.
9. Add private RLS policies for request tables.
10. Add admin review and audit log tables.
11. Add migration scripts or seed routines for reviewed public seed records.
12. Connect one read-only public page or data layer to Supabase in a small slice.
13. Verify no private data appears in public responses.
14. Add request submission flows only after validation and abuse controls are planned.
15. Add auth only when admin/reviewer or provider workflows are ready.

Implementation should be incremental and tested after each slice.

---

## MVP Recommendation

Do not add Supabase integration in this documentation task.

Recommended current stance:

- Keep the app frontend-only.
- Keep static seed data active.
- Keep public browsing login-free.
- Do not add Supabase packages.
- Do not add client code.
- Do not add database files, migrations, or SQL.
- Do not add authentication.
- Do not add dashboards.
- Do not add storage buckets.
- Do not add Edge Functions.

Recommended MVP backend direction:

Start later with public-safe directory data and admin-reviewed request intake. Delay patient accounts, booking, payments, documents, notifications, chatbot, community, and advanced workflows until the Phase 1 foundation is secure.

---

## Risks

Key risks:

- Adding Supabase client code before RLS and table boundaries are clear.
- Exposing private review, request, ownership, or audit data to anonymous users.
- Treating sample seed data as real verified healthcare data.
- Adding authentication too early and making public discovery harder.
- Adding provider dashboards before ownership and review rules exist.
- Allowing provider-submitted changes to publish without review.
- Creating storage buckets before access policies and scanning rules exist.
- Adding patient-specific tables before patient identity and consent are implemented.
- Adding booking, payment, document, community, or chatbot data too soon.
- Exposing service role keys to the browser.
- Mixing public and private fields in the same query path.
- Forgetting audit logs for trust-critical actions.

Mitigations:

- Keep Phase 1 narrow.
- Use public-safe views or strict public read policies.
- Enable RLS by default.
- Separate public and private tables.
- Keep service role keys server-only.
- Delay auth until actions need accounts.
- Treat all sample records as sample-only.
- Add review and audit foundations before provider management.
- Add storage, Edge Functions, and advanced workflows only in later tasks.

---

## Recommended Next Development Order

1. Keep the current app frontend-only until a Supabase implementation task is approved.
2. Review this Phase 1 plan with the existing data model and Supabase backend planning docs.
3. Decide which public provider tables belong in the first migration.
4. Define exact public-safe fields for provider cards, detail pages, search, and category pages.
5. Define exact private request fields for registration, corrections, contact, and feedback.
6. Define initial review statuses and audit events.
7. Define RLS policies in plain language before SQL is written.
8. Plan environment variables and deployment secret handling.
9. Create a dedicated implementation task for Supabase package/client setup.
10. Create a dedicated migration task for Phase 1 tables and RLS.
11. Create a dedicated seed migration task for reviewed data only.
12. Connect public read-only listing data in a small slice.
13. Add request submission only after validation, abuse control, and review queues are ready.
14. Add auth only when admin/reviewer or provider workflows require it.
15. Add storage, Edge Functions, booking, payments, document vault, chatbot, notifications, community, and patient workflows only after their own foundations are ready.

---

## Summary

Supabase Phase 1 should create the foundation for trusted public directory data and admin-reviewed request workflows, not the full backend.

The safest first backend path is public-safe provider tables, taxonomy tables, request intake planning, admin review foundations, provider ownership planning, strict RLS, audit logs, and careful seed migration. Authentication, dashboards, storage, Edge Functions, booking, payments, documents, notifications, chatbot, and community features should wait for later dedicated phases.

The recommended current action is documentation only. No Supabase code, packages, client, migrations, SQL, auth, storage, Edge Functions, backend functionality, or UI changes should be added in this task.
