# DigitalDirectory-v2 Facility Profile Management Strategy

## Purpose

This document defines the future strategy for facility profile ownership, facility manager permissions, services and departments management, working hours, doctor affiliation requests, verification document handling, and facility update review rules for DigitalDirectory-v2.

It is planning-only. It does not add backend functionality, Supabase, database files, migrations, SQL, authentication, dashboards, protected routes, UI pages, packages, or frontend changes.

The goal is to clarify facility/provider-side management before real provider dashboards, authentication, Supabase, verification uploads, booking, wallet, patient ID, patient reviews, or backend workflows are implemented.

---

## Core Principles

### Public Discovery Remains Open

Patients should be able to browse, search, and view facility profiles without signing in.

Facility ownership and management accounts may come later, but they should not create account friction for public healthcare discovery.

### Trust Before Publishing

Facility-submitted updates should not publish directly when they affect trust, safety, contact details, location, services, departments, hours, verification, doctor affiliations, or future booking availability.

### Separate Public and Internal Data

Public facility profiles should show only safe, patient-facing information. Internal review notes, verification evidence, private contacts, ownership claims, audit logs, and admin decisions should remain protected.

### Review Before High-Impact Changes

Facility managers may eventually submit updates, but trust-critical fields should enter review queues before public display.

---

## Facility Owner Persona

The facility owner persona represents the authenticated organization or authorized leadership that has long-term responsibility for a facility listing.

Examples:

- Hospital owner or executive representative
- Clinic owner
- Health center authorized representative
- Specialty center operator
- Organization administrator for a multi-branch provider

Future responsibilities:

- Claim the facility listing
- Request verification
- Submit official profile updates
- Manage approved facility managers later
- Submit verification documents when uploads exist
- Respond to admin or reviewer requests
- Review important public facility details

Boundaries:

- Facility owners cannot self-verify.
- Facility owners cannot bypass admin review.
- Facility owners cannot access unrelated provider records.
- Facility owners cannot assign platform roles such as Admin, Reviewer, Support Operator, or Super Admin.
- Facility owners should see only their own facility request history and public-safe status updates later.

---

## Facility Manager Persona

The facility manager persona represents a staff member authorized by a facility owner to maintain operational listing information.

Examples:

- Facility operations manager
- Front desk lead
- Department coordinator
- Communications officer
- Branch manager

Future responsibilities:

- Submit service updates
- Submit department updates
- Submit working hour changes
- Submit public contact updates
- Request doctor affiliation updates
- Respond to needs-information requests
- Keep non-sensitive listing details current

Boundaries:

- Facility managers should have less authority than facility owners.
- Facility managers should not grant ownership.
- Facility managers should not approve verification.
- Facility managers should not access verification documents unless policy explicitly allows it.
- Facility managers should not publish high-risk changes directly.
- Facility managers should not access patient ID, wallet, booking, or review moderation tools unless future policies explicitly define that access.

Recommended role split:

| Capability | Facility owner | Facility manager |
| --- | --- | --- |
| Claim facility listing | Yes | No, unless delegated later |
| Request verification | Yes | Possibly prepare request |
| Submit profile updates | Yes | Yes, scoped |
| Manage facility managers | Future yes | No |
| Submit services/hours changes | Yes | Yes |
| Submit location/contact changes | Yes | Yes, review required |
| Submit verification documents | Yes later | Limited or no |
| Publish changes directly | No | No |
| View admin notes | No | No |

---

## Facility Profile Ownership

Facility profile ownership should come later, after authentication, provider ownership records, admin review, and audit logging exist.

Ownership request flow:

1. Facility representative submits claim or registration request.
2. Request enters provider registration queue.
3. Reviewer checks identity, facility existence, duplicate risk, and submitted public details.
4. Verification evidence may be requested later when document upload exists.
5. Reviewer recommends approval, rejection, needs information, duplicate, or escalation.
6. Admin confirms ownership decision when required.
7. Approved ownership creates a provider ownership record.
8. Audit log records the decision and actor.

Ownership rules:

- Ownership should be explicit and revocable.
- Ownership should not automatically grant verified status.
- A facility can have one primary owner organization and future delegated managers.
- Multi-branch organizations may need organization membership records later.
- Ownership changes should be treated as high-risk and audited.
- Disputed ownership should escalate to Admin or Super Admin.

---

## Facility Profile Data

Facility profile data should be split into public-safe fields and internal/private fields.

### Public Facility Data

Public fields may include:

| Field | Purpose |
| --- | --- |
| `id` | Stable internal identifier |
| `slug` | Public route segment |
| `name` | Public facility name |
| `facility_type` | Hospital, clinic, health center, specialty center, other |
| `description` | Short patient-facing summary |
| `services` | Linked public services |
| `departments` | Linked public departments later |
| `specialties` | Linked specialties where relevant |
| `location_id` | Normalized public location |
| `address_line` | Public address text |
| `contact_channels` | Public phone, email, website, or official channel |
| `working_hours` | Public general hours |
| `verification_status` | Public trust label |
| `listing_status` | Public visibility state |
| `image_url` | Future reviewed public image |
| `accepts_walk_ins` | Future public preview field |
| `emergency_available` | Future public field requiring stronger review |

### Internal Facility Data

Internal fields should require protected access later:

| Field | Purpose |
| --- | --- |
| `owner_account_id` | Future facility owner account |
| `organization_id` | Future multi-user organization account |
| `verification_case_id` | Link to verification workflow |
| `internal_notes` | Admin/reviewer notes |
| `source_type` | Admin entered, provider submitted, migrated, community submitted |
| `source_confidence` | Internal quality estimate |
| `last_verified_at` | Verification freshness |
| `next_review_at` | Reverification planning |
| `private_contact_channels` | Reviewer/provider communication only |
| `verification_evidence` | Future private document references |

Rules:

- Public facility cards should receive only card-safe fields.
- Detail pages should not expose internal notes or evidence.
- Public descriptions should remain factual and not promotional in a way that hides trust status.
- Emergency, 24-hour, and specialty claims should be reviewed carefully.

---

## Services Management Strategy

Services describe healthcare capabilities that patients may search for.

Examples:

- Emergency care
- Pediatrics
- Maternal care
- Laboratory testing
- Vaccination
- Dental care
- Imaging referral

Future service management rules:

- Facilities may submit service additions, removals, or descriptions.
- Services should use normalized service records where possible.
- New service names should be reviewed before becoming public taxonomy.
- High-impact services should require stronger review.
- Services should not imply availability of a doctor, department, price, booking slot, or emergency readiness unless those fields are separately reviewed.

Service update risk levels:

| Risk | Examples | Review Direction |
| --- | --- | --- |
| Low | Description cleanup, spelling, non-clinical wording | Content reviewer or reviewer |
| Normal | Adding common service, removing outdated service | Reviewer |
| High | Emergency, 24-hour, ICU, surgery, maternity, blood bank | Reviewer plus admin confirmation |
| Urgent | Harmful or misleading service claim | Trust and safety escalation |

Public search should index approved services only.

---

## Departments Management Strategy

Departments are facility-specific organizational units. They may overlap with services and specialties but should not replace them.

Examples:

- Emergency department
- Pediatrics department
- Internal medicine
- Obstetrics and gynecology
- Radiology
- Laboratory
- Pharmacy unit

Recommended department fields:

| Field | Purpose |
| --- | --- |
| `facility_id` | Linked facility |
| `name` | Department display name |
| `description` | Patient-facing summary |
| `service_ids` | Related services |
| `specialty_ids` | Related specialties |
| `contact_channel_id` | Optional department-specific public contact |
| `working_hours_id` | Optional department-specific hours |
| `review_status` | Review state |
| `listing_status` | Public visibility state |

Department rules:

- Departments should be tied to a facility.
- Department names should be normalized where possible.
- Department-specific contacts and hours are higher risk than plain department names.
- Departments should not imply doctor availability unless linked doctor affiliation and schedule data are reviewed.
- Closed or inactive departments should be hidden or archived, not deleted immediately.

---

## Working Hours Management

Facility working hours should support public display before real booking logic exists.

Recommended working hour fields:

| Field | Purpose |
| --- | --- |
| `owner_type` | Facility, department, doctor, pharmacy, diagnostics provider |
| `owner_id` | Linked record |
| `day_of_week` | Monday through Sunday |
| `opens_at` | Opening time |
| `closes_at` | Closing time |
| `is_closed` | Closed flag |
| `is_24_hours` | 24-hour flag |
| `public_note` | Patient-safe note |
| `effective_from` | Start date for temporary hours |
| `effective_until` | End date for temporary hours |
| `review_status` | Review state |

Rules:

- General facility hours and department-specific hours should be separate.
- 24-hour, emergency, holiday, and temporary closure claims should receive stronger review.
- Hours should not imply appointment availability.
- Working hours should be auditable when changed.
- Expired temporary hours should not remain public indefinitely.

Future handling:

- Low-risk formatting updates may receive fast review.
- Public access-impacting changes should require reviewer/admin review.
- Emergency or 24-hour updates should be high priority.

---

## Contact and Location Update Rules

Contact and location information directly affects patient access, so these changes should be high-trust.

Contact fields:

- Public phone
- Email
- Website
- Official social/community channel
- Department-specific phone
- Future support or booking channel

Location fields:

- Address line
- City/subcity/area
- Directions note
- Future latitude/longitude
- Branch relationship

Rules:

- Phone, address, and location coordinate updates should require review before publication.
- Website and official social links should be checked for impersonation or unrelated links.
- Facility owners and managers may submit contact changes but should not publish them directly.
- Corrections from public visitors should snapshot current values before review.
- Conflicting contact/location submissions should escalate.
- Private staff contacts should not be displayed publicly.

High-risk examples:

- Changing the main phone number
- Changing address or branch location
- Marking a facility as closed
- Adding emergency access directions
- Adding external booking/payment links
- Adding future map coordinates

---

## Doctor Affiliation Requests

Facility-managed doctor affiliations should connect facility listings and doctor profiles without creating false endorsements.

Future affiliation request flow:

1. Facility owner or manager submits doctor affiliation request.
2. Request identifies doctor profile, facility, affiliation type, department, and public label.
3. Request enters listing update or verification queue.
4. Reviewer checks duplicate doctor profiles, facility relationship, and submitted evidence when available.
5. Doctor owner may need to confirm later when doctor accounts exist.
6. Admin confirms high-impact or disputed affiliations.
7. Approved affiliation becomes public with appropriate verification status.
8. Audit log records the before/after relationship.

Rules:

- Facility-submitted affiliation should not automatically verify a doctor.
- Doctor-submitted affiliation should not automatically verify the facility relationship.
- Conflicting affiliation claims should escalate.
- Expired or ended affiliations should be preserved internally for audit.
- Affiliation schedule and doctor schedule should remain separate from general facility hours.

Relationship to doctor strategy:

- Facility affiliation requests should align with `DoctorProfileScheduleContentStrategy.md`.
- Doctor profile ownership and facility ownership should both be respected.
- Doctor schedule availability should not be implied from facility affiliation alone.

---

## Verification Document Handling Later

Verification document handling should wait until storage, authentication, backend policies, and review workflows are ready.

Potential future document types:

- Facility license or registration evidence
- Ownership or authorized representative evidence
- Address/location evidence
- Department or service certification where relevant
- Official contact proof
- Branch authorization

Document rules:

- Verification documents should be private.
- Public users should never access document uploads.
- Facility managers should not necessarily see all uploaded documents.
- Reviewers should access only assigned cases.
- Admins should access operational verification cases.
- Super Admin should handle severe disputes or sensitive escalations.
- Documents should be scanned/reviewed according to future security policy before use.
- Public verification labels should not reveal sensitive document details.

Storage planning:

- Use future private storage only after upload workflow is approved.
- Separate private verification documents from public facility images.
- Do not add storage buckets until the implementation phase.

---

## Facility Update Review Rules

Facility updates should be reviewed according to patient impact and trust risk.

### Lower-Risk Updates

Examples:

- Typo corrections
- Short description cleanup
- Non-clinical wording improvements
- Removing duplicate service text
- Updating non-sensitive public notes

Review direction:

- Content reviewer or reviewer may handle.
- Faster approval may be possible later for verified owners.
- Audit history should still be created.

### Normal-Risk Updates

Examples:

- Adding common services
- Updating regular working hours
- Adding basic departments
- Updating public photos
- Clarifying accepted walk-in status

Review direction:

- Reviewer should check accuracy and public display.
- Admin confirmation may be optional depending on policy.
- Search index should update after approval.

### High-Risk Updates

Examples:

- Main phone number
- Address or location
- Emergency availability
- 24-hour claims
- ICU, surgery, maternity, blood bank, or specialist claims
- Verification status
- Ownership
- Doctor affiliations
- External booking/payment links

Review direction:

- Reviewer plus admin confirmation.
- Evidence may be required.
- Audit log must include before/after snapshots.
- Conflicting or suspicious changes should escalate.

### Urgent Updates

Examples:

- Facility closure
- Impersonation
- Fraud concern
- Harmful misinformation
- Critical access issue
- Public safety concern

Review direction:

- Escalate to Admin immediately.
- Escalate to Super Admin for severe disputes, privileged misuse, or platform-level risk.
- Temporary hide or safety flag may be needed in future implementation.

---

## Future Facility Dashboard Needs

A facility dashboard should not be built yet. It should come only after backend, authentication, ownership, review queues, and audit logging are ready.

Future dashboard sections may include:

- Facility profile overview
- Verification status
- Ownership and manager access
- Services
- Departments
- Working hours
- Contact channels
- Location and branch details
- Doctor affiliation requests
- Submitted update history
- Reviewer requests for more information
- Public image/logo management
- Future booking settings
- Future patient review response tools

Dashboard boundaries:

- The dashboard should submit changes for review.
- It should not expose admin notes.
- It should not allow self-verification.
- It should not publish high-risk changes directly.
- It should show clear statuses for pending, approved, rejected, needs information, expired, and superseded updates.
- It should separate public profile management from internal verification evidence.

---

## Relationship to Admin Review Workflow

Facility profile management should map directly to the future admin review workflow.

Relevant queues:

| Facility Workflow | Future Review Queue |
| --- | --- |
| Facility claim | Provider registration |
| New facility listing | Provider registration |
| Verification request | Verification |
| Services update | Listing update |
| Department update | Listing update |
| Working hours update | Listing update |
| Contact/location update | Correction or listing update |
| Doctor affiliation request | Verification or listing update |
| Duplicate facility | Duplicate listings |
| Community-submitted facility | Community-submitted listings |
| Trust or safety concern | Feedback or trust and safety |

Review principles:

- Facility changes should not publish directly.
- High-impact updates should require evidence and admin confirmation.
- Corrections should snapshot current public values.
- Approved changes should update search documents when search-visible fields change.
- Every trust-critical change should create an audit log.

---

## Relationship to Governance Roles

Facility management should follow the governance model defined in `GovernanceRolesSuperAdminStrategy.md`.

Role relationships:

| Role | Facility Management Relationship |
| --- | --- |
| Public user / patient | Browse facilities and submit public corrections/feedback |
| Facility manager | Submit scoped facility updates for review later |
| Facility owner | Claim/manage own facility requests later |
| Support operator | Route facility support issues without approval authority |
| Content reviewer | Review low-risk public wording and content quality |
| Reviewer / verifier | Review assigned facility updates and verification evidence |
| Admin | Approve high-impact updates, verification, ownership, duplicate handling |
| Super Admin | Handle severe disputes, role misuse, sensitive escalations |

Governance rules:

- Facility owners and managers are provider-side roles, not platform governance roles.
- Facility owners cannot verify themselves.
- Facility managers cannot grant ownership.
- Admin and reviewer actions should be audited.
- Super Admin should remain rare and reserved for sensitive governance issues.

---

## Relationship to Future Supabase Tables

This is planning only. No Supabase code, SQL, migrations, policies, or database files should be added yet.

Potential future tables:

| Area | Possible Table |
| --- | --- |
| Facility profiles | `facilities` |
| Facility ownership | `provider_ownerships` |
| Organization/team access | `organization_memberships` |
| Facility managers | `organization_memberships` or `provider_team_members` |
| Services | `services` |
| Facility services | `facility_services` |
| Departments | `facility_departments` |
| Working hours | `working_hours` |
| Contact channels | `contact_channels` |
| Locations | `locations` |
| Branch relationships | `facility_branches` |
| Doctor affiliations | `doctor_facility_affiliations` |
| Registration/update requests | `provider_registration_requests` or `listing_update_requests` |
| Correction requests | `correction_requests` |
| Verification cases | `verification_cases` |
| Admin reviews | `admin_reviews` |
| Audit history | `audit_logs` |
| Search index | `search_documents` |

Future RLS direction:

- Public users can read published, public-safe facility data.
- Public users cannot read verification evidence, ownership records, private contacts, review notes, or audit logs.
- Facility owners can read and submit requests for owned facilities.
- Facility managers can submit scoped requests only for assigned facilities.
- Reviewers can read assigned cases.
- Admins can manage operational review decisions.
- Super Admins can access sensitive governance areas with stronger audit requirements.

---

## Relationship to Booking, Wallet, Patient ID, and Patient Reviews

Booking, wallet, patient ID, and patient reviews are future-only concepts and should not be implemented yet.

### Booking

Facility strategy implications:

- Facility hours do not equal booking availability.
- Department hours do not equal doctor schedule.
- Booking should require backend, ownership, privacy, capacity rules, cancellation rules, and audit logs.
- Booking settings should not appear as active until real scheduling workflows exist.

### Wallet

Facility strategy implications:

- Wallet data should remain separate from public facility profiles.
- Facilities should not access wallet information unless a future workflow explicitly requires it.
- Payments, refunds, credits, or membership balances require separate financial governance.
- External payment links should be high-risk and reviewed before public display.

### Patient ID

Facility strategy implications:

- Patient ID should not be required for public facility discovery.
- Facility profiles should not expose patient identifiers.
- Any patient-linked booking, visit, membership, or wallet data should be role-scoped and audited.
- Patient ID access should be stricter than facility listing management access.

### Patient Reviews

Facility strategy implications:

- Reviews should be separate from verified facility data.
- Patient reviews should not change verification status automatically.
- Facility owners may respond only under a future moderation policy.
- Reviews should be moderated for abuse, privacy violations, defamation, and harmful medical claims.
- Review moderation should connect to governance and admin review workflows.

---

## Risks

Key risks:

- Allowing facility-submitted changes to publish without review.
- Treating a claimed facility as verified without evidence.
- Exposing private verification documents or submitter contacts.
- Letting facility managers change high-impact fields without authorization.
- Confusing facility hours with doctor availability or booking slots.
- Publishing false emergency, 24-hour, or specialist service claims.
- Creating duplicate facility listings during provider registration.
- Allowing malicious contact or location edits.
- Mixing public facility data with internal admin notes.
- Adding dashboards before authentication, RLS, audit logs, and review queues exist.
- Requiring patients to sign in for simple facility discovery.

Mitigations:

- Keep public and internal data separate.
- Require review for high-impact changes.
- Use least-privilege provider roles later.
- Audit trust-critical actions.
- Preserve duplicate and source history.
- Keep public browsing login-free.
- Add backend and dashboards only in dedicated future tasks.

---

## Recommended Next Development Order

1. Keep facility discovery and facility detail pages public, frontend-only, and login-free.
2. Continue using static seed data until real backend work is approved.
3. Refine public-safe facility data contracts for cards, detail pages, search results, services, departments, and hours.
4. Define exact facility ownership, manager, service, department, hour, contact, and location update statuses in planning.
5. Map facility ownership and manager permissions to the existing role and governance strategy.
6. Draft future Supabase table and RLS requirements for facilities, services, departments, hours, contacts, ownership, and affiliations.
7. Add authentication only when provider ownership and admin review workflows are ready.
8. Add facility ownership claim review before facility dashboards.
9. Add facility dashboard features only after review queues and audit logs exist.
10. Add verification document uploads only after private storage and access policies are ready.
11. Add doctor affiliation request workflows after both facility and doctor ownership rules are clear.
12. Add booking only after schedule, privacy, capacity, cancellation, and audit rules are ready.
13. Add patient reviews only after moderation governance exists.
14. Add patient ID or wallet concepts only after separate privacy, security, and financial governance planning.

---

## Summary

Facility profile management should grow from DigitalDirectory-v2's trust-first model.

Facilities may eventually claim profiles, manage managers, submit services and department updates, update hours and contacts, request doctor affiliations, and provide verification evidence. Those actions should be account-based, reviewed, auditable, and clearly separated from public browsing.

The immediate product should remain frontend-only and public-first while this strategy guides future backend, Supabase, governance, dashboard, verification, booking, wallet, patient ID, and patient review planning.
