# DigitalDirectory-v2 User Roles and Account Strategy

## Purpose

This document defines the future account, role, permission, and dashboard strategy for DigitalDirectory-v2.

DigitalDirectory-v2 is currently a public, frontend-only healthcare discovery product. The platform should remain easy to browse without login while the core search, listing, verification, correction, contact, feedback, and community update experiences mature.

Authentication should be introduced later only when real user actions require identity, ownership, audit history, or protected workflows.

---

## Core Account Principle

Public healthcare discovery should remain open and login-free.

Patients and visitors should be able to:

- Search healthcare providers
- Browse doctors, facilities, pharmacies, and diagnostics providers
- View listing detail pages
- Read verification labels and trust notes
- Open registration, correction, contact, and feedback preview pages
- Discover community update channels

Login should not be required for basic discovery. Requiring accounts too early would slow down the main product promise: helping people find trusted healthcare quickly.

---

## When Login Should Come Later

Login should be added only when the product introduces actions that need a verified identity or persistent account history.

Good reasons to require login later:

- A doctor needs to manage their own profile.
- A facility needs to update services, hours, contacts, or branches.
- A pharmacy needs to manage profile and future inventory-related information.
- A diagnostics provider needs to manage tests, imaging services, or profile details.
- An admin needs to review submissions, corrections, and verification status.
- A reviewer needs an audit trail for verification decisions.
- A partner needs access to approved partnership materials or reports.
- A user needs to save providers, manage bookings, or view private health-related history in a future phase.

Poor reasons to require login early:

- Reading public listings
- Running a basic search
- Viewing a detail page
- Reading trust notes
- Opening contact, feedback, or correction pages
- Following placeholder community channels

---

## Future Roles

### Public Visitor / Patient

Purpose:
Find trusted healthcare options quickly without account friction.

Future account need:
Optional only. A patient account may become useful later for saved providers, appointment history, booking, telemedicine, membership programs, or notification preferences.

Dashboard needs:

- Saved doctors and facilities
- Booking or request history
- Notification preferences
- Feedback and correction history
- Privacy settings

Permissions:

- Browse public listings
- Search and filter public listings
- View detail pages
- Submit feedback or correction requests in public or lightweight verified flows
- Manage saved items only if an account exists later

### Doctor

Purpose:
Allow verified doctors to manage their professional presence.

Future account need:
Required once doctors can claim, edit, or verify profiles.

Dashboard needs:

- Profile details
- Specialty and services
- Facility affiliations
- Availability preview
- Verification status
- Correction and update requests
- Future booking or telemedicine settings

Permissions:

- Claim own doctor profile
- Request verification
- Submit profile updates
- View verification status
- Manage future availability and telemedicine preferences

### Facility

Purpose:
Allow hospitals, clinics, and health centers to manage public listing information.

Future account need:
Required once facilities can manage their own listings or submit verification documents.

Dashboard needs:

- Facility profile
- Services
- Hours
- Contact information
- Branches or locations
- Verification documents and status
- Staff or affiliated doctors
- Correction request history

Permissions:

- Claim own facility listing
- Request verification
- Submit listing updates
- Manage public facility details
- Respond to admin requests for more information

### Pharmacy

Purpose:
Allow pharmacies to manage their profile and future pharmacy-specific workflows.

Future account need:
Required when pharmacy profiles, pickup workflows, delivery readiness, or future inventory previews become real.

Dashboard needs:

- Pharmacy profile
- Hours and contact details
- Pickup and delivery readiness settings
- Verification status
- Future medication availability controls
- Correction history

Permissions:

- Claim own pharmacy listing
- Request verification
- Update pharmacy profile
- Manage future pickup or delivery settings
- Manage future inventory-related information only after proper controls exist

### Diagnostics Provider

Purpose:
Allow laboratories and imaging providers to manage diagnostic service information.

Future account need:
Required when diagnostics providers can manage tests, imaging services, availability, or result delivery workflows.

Dashboard needs:

- Diagnostics provider profile
- Laboratory services
- Imaging services
- Hours and contact details
- Verification status
- Future booking or result delivery settings

Permissions:

- Claim own diagnostics listing
- Request verification
- Update public services
- Manage future booking or result delivery settings
- Respond to admin verification requests

### Admin

Purpose:
Operate the platform, protect trust, and manage official content.

Future account need:
Required. Admin accounts must be protected, auditable, and limited to trusted internal users.

Dashboard needs:

- Submission review queue
- Correction review queue
- Provider verification queue
- Listing management
- User and role management
- Trust and safety review tools
- Audit logs
- Content moderation tools

Permissions:

- Create, edit, approve, suspend, or archive listings
- Approve or reject verification requests
- Assign reviewer tasks
- Manage role permissions
- Review audit logs
- Resolve disputed corrections

### Reviewer / Verifier

Purpose:
Support verification and listing quality without granting full admin control.

Future account need:
Required. Reviewer actions must be tied to an account and audit history.

Dashboard needs:

- Assigned verification queue
- Correction review tasks
- Evidence checklist
- Provider contact notes
- Review decision history

Permissions:

- Review assigned listings
- Recommend approval, rejection, or changes
- Add internal notes
- Request more information
- Escalate uncertain cases to admins

### Partner

Purpose:
Support future partnerships with healthcare organizations, insurers, NGOs, employers, public health groups, or education partners.

Future account need:
Optional and later-stage. Partner accounts should wait until there are real partnership workflows.

Dashboard needs:

- Partnership profile
- Approved campaigns or update materials
- Contact history
- Future reporting or collaboration views

Permissions:

- View approved partnership resources
- Submit partnership inquiries
- Manage organization contact details
- Access future partner-only reports if approved

---

## Role Permission Matrix

| Capability | Public visitor / patient | Doctor | Facility | Pharmacy | Diagnostics provider | Reviewer / verifier | Admin | Partner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Browse public listings | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Search public listings | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| View public detail pages | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Submit public feedback | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Submit correction request | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Claim own profile/listing | No | Own profile | Own listing | Own listing | Own listing | No | Any listing | Organization only |
| Edit public profile/listing | No | Own profile only | Own listing only | Own listing only | Own listing only | No | Any listing | Organization only |
| Request verification | No | Own profile | Own listing | Own listing | Own listing | No | Any listing | Organization only |
| Upload verification documents | No | Future only | Future only | Future only | Future only | Review only | Manage all | Future only |
| Manage availability | Future optional | Own profile | Own facility | Future pickup/delivery settings | Future service availability | No | Any listing | No |
| Manage bookings | Future optional | Future own bookings | Future facility bookings | No | Future diagnostics bookings | No | Oversight only | No |
| Manage telemedicine settings | Future optional | Future own profile | Future facility settings | No | No | No | Oversight only | No |
| Review submissions | No | No | No | No | No | Assigned only | All | No |
| Approve verification | No | No | No | No | No | Recommend only | Yes | No |
| Manage users and roles | No | No | No | No | No | No | Yes | No |
| View audit logs | No | Own actions later | Own actions later | Own actions later | Own actions later | Assigned actions | Full access | No |

---

## Dashboard Strategy

Dashboards should be added only after public discovery and trust workflows are strong.

Recommended future dashboards:

- Patient dashboard: optional saved providers, bookings, preferences, and feedback history.
- Doctor dashboard: own profile, verification status, availability, affiliations, and future booking settings.
- Facility dashboard: listing details, services, hours, contacts, documents, branches, and correction history.
- Pharmacy dashboard: pharmacy details, pickup/delivery readiness, verification, and future inventory controls.
- Diagnostics dashboard: lab/imaging services, hours, verification, and future booking/result delivery settings.
- Reviewer dashboard: assigned verification and correction tasks.
- Admin dashboard: full review, moderation, listing, role, and audit controls.
- Partner dashboard: future partnership resources and approved collaboration views.

No dashboard should be created until there is a backend, authentication, data model, and permission model to support it.

---

## Future Authentication Phases

### Phase 0: Current Public Frontend

Status:
Current recommended state.

Scope:

- Public browsing
- Frontend-only pages
- Static sample data
- No login
- No signup
- No protected routes
- No dashboards
- No backend

### Phase 1: Backend Readiness Planning

Scope:

- Finalize role model
- Define database tables
- Define ownership rules
- Define audit log requirements
- Define verification workflow states
- Decide authentication provider

Outcome:
The team knows what must be protected before adding accounts.

### Phase 2: Provider Intake Accounts

Scope:

- Doctor, facility, pharmacy, and diagnostics provider accounts
- Claim listing flow
- Verification request flow
- Basic profile ownership
- Admin review queue

Outcome:
Accounts support provider trust and listing quality, not general browsing.

### Phase 3: Admin and Reviewer Workflow

Scope:

- Admin dashboard
- Reviewer dashboard
- Role assignment
- Verification decisions
- Correction moderation
- Audit logs

Outcome:
The trust system becomes operational and accountable.

### Phase 4: Patient Accounts

Scope:

- Optional patient accounts
- Saved listings
- Notification preferences
- Booking history if booking exists
- Telemedicine or membership history if those features exist

Outcome:
Patients gain convenience features without blocking public discovery.

### Phase 5: Advanced Role Expansion

Scope:

- Partner accounts
- Organization-level access
- Multi-location provider teams
- Staff accounts
- Advanced reporting
- Future integrations

Outcome:
The platform can support larger organizations without weakening the simple public experience.

---

## Supabase Consideration

Supabase can be considered later as a backend and authentication option, but it should not be added in the current frontend-only phase.

Future Supabase uses may include:

- Authentication
- Postgres database
- Row Level Security policies
- File storage for verification documents
- Admin and reviewer audit tables
- Provider profile ownership
- Realtime status updates if needed

Before choosing Supabase, define:

- Required tables and relationships
- Role and permission model
- Row Level Security rules
- Audit log model
- Data retention rules
- Verification document access rules
- Admin escalation rules

Supabase should support the trust model. It should not shape the product before the role and verification strategy is clear.

---

## Security and Trust Notes

Healthcare discovery requires careful trust design.

Future account systems should follow these rules:

- Public listings must clearly show verification status.
- Unverified and community-submitted information must not look equivalent to verified information.
- Provider claims should require review before sensitive public information changes.
- Verification decisions must be auditable.
- Admin and reviewer actions must be logged.
- Role permissions should be least-privilege by default.
- Sensitive verification documents should not be public.
- Patient health information should not be collected unless the product truly needs it.
- Authentication should use strong password and session practices.
- Admin accounts should require stronger security controls than ordinary accounts.
- Provider ownership should be explicit and revocable.
- Suspicious edits, repeated correction abuse, or identity conflicts should escalate to admin review.

---

## Recommended Next Development Order

1. Keep public browsing login-free while improving discovery, card quality, and detail pages.
2. Finish frontend polish for registration, corrections, contact, feedback, and community update flows.
3. Define structured data models for listings, verification status, correction requests, and provider claims.
4. Plan backend schema and role permissions before installing backend services.
5. Add provider claim and verification request flows only after a backend decision is made.
6. Add admin and reviewer tools before allowing provider-submitted edits to publish directly.
7. Add optional patient accounts only when saved providers, bookings, telemedicine, or membership features exist.
8. Add partner accounts after real partnership workflows exist.
9. Revisit Supabase as a future backend/auth option once permissions, audit logs, and verification workflows are fully specified.

---

## UI Guidance

The public UI should not show login, signup, account, dashboard, or role-based navigation yet.

Registration, correction, contact, and feedback pages may mention that account-based provider management can come later, but they should not imply that accounts already exist.

The main navigation and mobile bottom navigation should remain focused on public discovery.

---

## Summary

DigitalDirectory-v2 should stay public-first and login-free during the discovery foundation phase.

Accounts should be introduced later to support real trust-building workflows: provider ownership, verification review, admin decisions, audit history, optional patient convenience features, and future partnerships.

The recommended path is to design the permission model first, then add backend and authentication only when the product has workflows that genuinely require them.
