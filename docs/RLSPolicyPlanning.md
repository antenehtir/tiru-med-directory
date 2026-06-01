# DigitalDirectory-v2 RLS Policy Planning

## Purpose

This document defines the future planning direction for Supabase Row Level Security policies in DigitalDirectory-v2.

It is documentation-only. It does not add SQL, RLS policies, migrations, Supabase client code, Supabase packages, backend functionality, authentication, dashboards, protected routes, storage, or frontend UI changes.

The goal is to clarify access boundaries before any real Supabase policies, tables, migrations, auth, dashboards, or protected workflows are implemented.

---

## Core Principle

RLS should protect data even if application code makes a mistake.

DigitalDirectory-v2 should treat RLS as a required backend safety layer, not as an optional add-on. Public healthcare discovery can remain open, but private data should be inaccessible unless a role, ownership record, assignment, or consent record explicitly allows access.

---

## RLS Purpose

Future RLS policies should:

- Allow anonymous users to read only published public-safe listing data.
- Prevent anonymous users from reading private request, review, ownership, patient, booking, payment, document, chatbot, or community data.
- Protect provider ownership and staff records.
- Scope provider owner and manager permissions to their own providers.
- Scope doctor owner permissions to their own doctor profiles.
- Scope admin, reviewer, verifier, support, and content reviewer access by role and assignment.
- Protect audit logs from public and provider access.
- Keep service role usage server-only and minimized.
- Prepare for patient data, booking, wallet, document vault, community, chatbot, and notification policies later.

RLS should support trust-first healthcare discovery without exposing sensitive operational or patient information.

---

## RLS Principles

Core principles:

- Enable RLS on every table by default.
- Grant public read access only to published, public-safe records.
- Deny by default for private/internal tables.
- Use least privilege for every authenticated role.
- Separate public listing data from private review data.
- Separate provider ownership data from public provider profiles.
- Separate patient data from provider data.
- Use review/assignment tables for reviewer access where possible.
- Use ownership/team membership tables for provider access where possible.
- Use consent records for patient-specific sharing later.
- Keep service role keys out of browser code.
- Test policies before exposing any table to production.

Policy planning rule:
If the team cannot explain who can read, insert, update, and delete a record in plain language, the table is not ready for implementation.

---

## Public Read Access Rules

Public read access should be narrow and predictable.

Anonymous users may read:

- Published facilities
- Published doctors
- Published pharmacies
- Published diagnostics providers
- Active public locations
- Active public services
- Active public specialties
- Reviewed public contact channels
- Reviewed public working hours
- Reviewed public doctor/facility affiliations
- Reviewed public facility/service relationships

Anonymous users must not read:

- Draft, rejected, hidden, archived, duplicate, or private records
- Provider registration requests
- Correction requests before publication
- Feedback submissions
- Contact messages
- Admin reviews
- Review assignments
- Internal notes
- Provider ownership records
- Audit logs
- Patient identity
- Bookings
- Payments
- Wallet records
- Document vault records
- Notifications
- Chatbot logs
- Community memberships and private posts
- Verification evidence

Public read rules should use published status and visibility status together.

Example public condition in plain language:

```text
Anonymous users can read a listing only when listing_status is published and visibility_status is public.
```

This is not SQL. Actual policy syntax should be created only in a later implementation task.

---

## Public Listing Table RLS Planning

Public listing tables should be readable by anonymous users only for approved public records.

Candidate public listing tables:

- `facilities`
- `doctors`
- `pharmacies`
- `diagnostics_providers`
- `locations`
- `services`
- `specialties`
- `contact_channels`
- `working_hours`
- `doctor_facility_affiliations`
- `facility_services`

Public listing policy direction:

| Action | Anonymous | Provider Owner Later | Reviewer/Admin Later |
| --- | --- | --- | --- |
| Read published records | Yes | Yes | Yes |
| Read unpublished records | No | Own request context only later | Role/assignment scoped |
| Insert records | No | Through request tables only | Admin/reviewer workflow later |
| Update records | No | Through update requests only | Role-scoped approval later |
| Delete records | No | No | Rare admin/archive action only |

Rules:

- Public tables should not contain private review notes.
- Public queries should not expose internal ownership records.
- Provider-submitted changes should create requests, not direct public edits.
- High-impact fields such as phone, location, emergency status, 24-hour status, and verification status should require review before publication.
- Public listing status changes should be audited.

---

## Private and Internal Table Protection

Private/internal tables should deny anonymous access.

Private table groups:

- Provider registration requests
- Correction requests
- Feedback submissions
- Contact messages
- Listing update requests
- Admin reviews
- Review assignments
- Review status events
- Verification cases
- Duplicate listing reviews
- Provider ownership records
- Organization memberships
- Audit logs
- Moderation flags

Default policy direction:

| Action | Anonymous | Provider Owner Later | Reviewer/Admin Later |
| --- | --- | --- | --- |
| Read | No | Own submitted/owned records only where appropriate | Role/assignment scoped |
| Insert | Limited public intake later, if approved | Own requests only | Role-scoped |
| Update | No | Limited response/needs-info updates later | Role-scoped |
| Delete | No | No | Rare admin/archive only |

Rules:

- Private submitter contact details should not be public.
- Internal notes should not be visible to providers or patients by default.
- Reviewers should see only what they need to decide a case.
- Support operators should see limited support context.
- Admins should manage operational review data.
- Super Admin access should be rare and audited.

---

## Provider Owner Permissions

Provider owners are future authenticated users linked to one or more provider records.

Provider owner permissions should be scoped to owned providers only.

Potential future permissions:

- Read their own provider ownership status.
- Read public provider profile data for owned providers.
- Read their own provider registration or claim requests.
- Submit listing update requests for owned providers.
- Submit verification requests for owned providers.
- Respond to needs-information requests.
- Read status history for their own requests.

Provider owners should not:

- Directly publish listing updates.
- Self-verify.
- Edit verification status.
- Read unrelated provider records beyond public data.
- Read admin notes.
- Read reviewer notes.
- Read audit logs directly.
- Read patient data by default.
- Access provider dashboards before auth, RLS, and ownership are ready.

Policy direction:

```text
Provider owners can access provider-management records only when an approved provider_ownership record links their account to that provider.
```

This is not SQL.

---

## Facility Manager Permissions

Facility managers are future scoped staff members under a facility owner or organization.

Potential future permissions:

- Read assigned facility profile management status.
- Submit service, department, hour, contact, or location update requests.
- Respond to reviewer needs-information requests.
- Read request status for assigned facilities.
- Manage operational information only within approved scope.

Facility managers should not:

- Claim ownership unless explicitly authorized.
- Approve ownership.
- Approve verification.
- Publish high-impact changes.
- Grant other facility managers broad access.
- Read private ownership disputes.
- Read unrelated facility data beyond public records.
- Read patient data unless a future booking workflow explicitly grants scoped access.

Policy direction:

```text
Facility managers can access scoped request records only when an organization membership or team member record grants that facility-level permission.
```

Facility manager policies should be stricter than facility owner policies.

---

## Doctor Owner Permissions

Doctor owners are future authenticated users linked to a doctor profile.

Potential future permissions:

- Read ownership/claim status for their own doctor profile.
- Submit public profile update requests.
- Submit facility affiliation requests.
- Submit availability preview or schedule update requests later.
- Submit telemedicine availability requests later.
- Respond to reviewer needs-information requests.
- Read status history for their own requests.

Doctor owners should not:

- Self-verify.
- Publish profile changes directly.
- Add facility affiliations without review.
- Edit verification status.
- Read private facility ownership records.
- Read patient booking history before booking workflows exist.
- Read patient documents without consent.
- Access professional community groups without verification policy.

Policy direction:

```text
Doctor owners can manage request records only for doctor profiles linked to an approved ownership record.
```

Doctor owner access should remain separate from facility manager access.

---

## Admin and Reviewer Permissions

Admin and reviewer permissions should follow role and assignment strategy.

Future internal roles:

- Admin
- Reviewer/verifier
- Content reviewer
- Support operator
- Super Admin

Reviewer/verifier permissions:

- Read assigned review cases.
- Read evidence or request payload needed for assigned case.
- Submit recommendations or decisions allowed by role.
- Request more information.
- Escalate cases.

Content reviewer permissions:

- Review low-risk public wording.
- Flag unsafe or misleading content.
- Escalate high-risk health claims.

Support operator permissions:

- Read limited contact/support cases.
- Route issues to corrections, feedback, or admin review.
- Avoid broad access to verification, patient, payment, or document data.

Admin permissions:

- Manage operational review queues.
- Approve high-impact listing changes.
- Resolve duplicate provider records.
- Review provider ownership and verification decisions.
- Handle escalations.

Rules:

- Reviewers should not automatically access every private table.
- Admins should not routinely inspect patient-specific data unless a future support/safety workflow requires it.
- Role changes should be audited.
- Sensitive actions should require stronger role checks.

---

## Super Admin Permissions

Super Admin should be reserved for sensitive governance and exceptional access.

Potential permissions:

- Manage platform governance roles.
- Resolve severe ownership disputes.
- Access sensitive audit logs.
- Handle severe privacy incidents.
- Handle role misuse or admin abuse.
- Perform emergency restriction or recovery actions.
- Review high-risk security or compliance cases.

Super Admin should not be used for ordinary review work.

Rules:

- Super Admin access should be rare.
- Super Admin actions should always be audited.
- Super Admin should not bypass privacy rules casually.
- Super Admin access to patient, payment, document, or community data should require a documented reason.
- Super Admin role assignment should be tightly controlled.

Policy direction:

```text
Super Admin can access sensitive governance records only when the action belongs to an approved governance or escalation workflow.
```

---

## Patient Data Protection Later

Patient data should not be part of Supabase Phase 1 public listing implementation.

Future patient data may include:

- Patient profile
- Patient identity level
- Consent records
- Notification preferences
- Saved providers
- Booking history
- Document vault metadata
- Review author records
- Wallet records
- Transport preferences

RLS direction later:

- Patients can read and manage their own profile and preferences.
- Patients can read their own consents.
- Providers cannot read full patient profiles by default.
- Providers can access only workflow-specific patient data with consent or active booking rules.
- Admin/support access should be limited, justified, and audited.
- Anonymous users cannot read patient tables.

Rules:

- Patient ID should never be public.
- Patient data should not be included in public listing payloads.
- Patient group membership should be private by default.
- Patient document, payment, and booking access need dedicated policies.

---

## Booking Data Protection Later

Booking data should be private workflow data.

Future booking records may include:

- Appointment requests
- Confirmed bookings
- Booking status events
- Availability blocks
- Schedule exceptions
- Booking notes
- Verified visit links later

RLS direction later:

- Patients can read their own appointment requests and bookings.
- Doctors can read bookings assigned to their doctor profile.
- Facilities can read facility-owned or assigned service bookings.
- Facility staff access should be scoped by role.
- Providers cannot read unrelated bookings.
- Admins/support can access bookings only for support, abuse, privacy, or trust cases.
- Anonymous users cannot read booking data.

Rules:

- Booking notes should not be public.
- Appointment reason should not appear in public pages or reviews.
- Completed booking status may support verified visit review eligibility later, without exposing details.

---

## Wallet and Payment Protection Later

Payment and wallet data requires stronger controls than public listing data.

Future payment records may include:

- Payment transactions
- Payment attempts
- Wallet accounts
- Wallet ledger entries
- Refunds
- Disputes
- Provider settlements
- Sponsorship grants

RLS direction later:

- Patients can read their own transactions and wallet ledger.
- Sponsors can read only their own sponsorship payment status and allowed purpose information.
- Providers can read payment status for their own fulfilled workflows, not patient wallet balances.
- Provider settlement access should be scoped to provider owner or finance roles later.
- Support/admin access should be limited and audited.
- Anonymous users cannot read payment or wallet tables.

Rules:

- Payment records should not contain clinical details.
- Wallet balances should not be visible to providers by default.
- Service role access for payment workflows must be server-only.
- Payment webhooks and financial admin actions require dedicated future security planning.

---

## Document Vault Protection Later

Patient document vault data should have the strongest privacy posture.

Future document records may include:

- Patient document metadata
- Document files
- Document shares
- Document access events
- Document versions
- Document consent records

RLS direction later:

- Patients can read and manage their own document metadata.
- Providers can read only documents explicitly shared with them or tied to an authorized active workflow.
- Providers cannot browse patient vaults.
- Support/admin access should be rare, justified, and audited.
- Anonymous users cannot read document tables.
- Storage object policies should align with table policies later.

Rules:

- Patient documents should not be public.
- Document filenames and metadata can be sensitive.
- Document contents should not appear in notifications, reviews, community posts, or public listing data.
- Storage policies and signed URL rules must be planned separately.

---

## Community and Chatbot Data Protection Later

Community and chatbot data should not be part of public listing Phase 1.

Future community data may include:

- Community groups
- Group memberships
- Posts and replies
- Reports
- Moderation cases
- Professional group memberships

Future chatbot data may include:

- Assistant sessions
- User messages
- Safety flags
- Handoff records
- Feedback on assistant responses

RLS direction later:

- Public users can read only approved public-safe resources, if any.
- Group members can read groups they belong to.
- Providers cannot read patient group membership by default.
- Verified professionals can read professional groups only when approved.
- Moderators can read assigned reports/cases.
- Chatbot sessions should be visible only to the user and approved support/admin roles when needed.
- Sensitive safety flags should be private.
- Anonymous users cannot read private group, report, moderation, or chatbot session data.

Rules:

- Community content should not be mixed with public listing data.
- Chatbot logs should not be public.
- Medical safety and self-harm escalation data should be protected and audited.
- AI-related service role or tool access must be server-only later.

---

## Audit Log Access Rules

Audit logs should be private, append-only, and carefully scoped.

Audit logs may record:

- Listing changes
- Verification changes
- Ownership claims and decisions
- Review assignments
- Admin/reviewer decisions
- Role changes
- Patient consent changes later
- Booking status changes later
- Payment/refund actions later
- Document access later
- Community moderation actions later

Access rules:

- Anonymous users cannot read audit logs.
- Provider owners should not read raw audit logs by default.
- Patients may receive simplified status history for their own workflows later, not raw audit logs.
- Reviewers may see audit context for assigned cases only.
- Admins may see operational audit logs needed for review and support.
- Super Admins may see sensitive audit logs for governance and escalation.
- Service role access should be server-only.

Rules:

- Audit logs should not contain raw secrets.
- Audit logs should avoid full medical records, document contents, or payment instrument details.
- Audit logs should record sensitive access events.
- Audit log tampering should not be possible through ordinary roles.

---

## Service Role Key Boundaries

The Supabase service role key bypasses RLS and must be treated as highly sensitive.

Rules:

- Never expose the service role key in browser code.
- Never prefix it with `NEXT_PUBLIC_`.
- Never store it in client components.
- Never commit it to git.
- Never paste it in issues, PRs, screenshots, or docs.
- Use it only in secure server-side workflows later.
- Keep service role usage narrow.
- Log and audit service role actions where appropriate.
- Rotate it immediately if exposed.

Potential future use cases:

- Controlled admin server actions
- Validated request processing
- Search indexing
- Scheduled notification jobs
- Payment webhook handling
- Storage processing
- Data migration tools

Not Phase 1 planning task:
No service role key should be added now.

---

## Policy Testing Checklist

Before any future Supabase launch, RLS policies should be tested.

Checklist:

1. Anonymous user can read only published public listings.
2. Anonymous user cannot read draft, hidden, archived, rejected, or duplicate listings.
3. Anonymous user cannot read provider registration requests.
4. Anonymous user cannot read correction, feedback, contact, review, ownership, or audit tables.
5. Anonymous user cannot insert into private tables unless a controlled public intake policy is approved.
6. Provider owner can read only owned provider management records.
7. Facility manager can read only assigned facility management records.
8. Doctor owner can read only owned doctor management records.
9. Reviewer can read only assigned review cases where assignment scoping is used.
10. Support operator can read only support-scoped cases.
11. Admin can manage operational review records.
12. Super Admin sensitive access is audited.
13. Patient account can read only own patient records later.
14. Provider cannot read unrelated patient, booking, payment, wallet, or document data.
15. Public read policies do not expose internal notes or private contacts.
16. Search documents include only public-safe fields.
17. Service role key is not available in browser bundles.
18. Tests cover insert, select, update, and delete behavior.
19. Failed access is denied by default.
20. Policies are tested in staging before production.

No policy tests are added in this documentation task.

---

## Example Access Matrix

This matrix is conceptual and not a policy implementation.

| Data Area | Anonymous | Patient Later | Provider Owner Later | Facility Manager Later | Doctor Owner Later | Reviewer Later | Admin Later | Super Admin Later |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Published public listings | Read | Read | Read | Read | Read | Read | Read | Read |
| Draft/hidden listings | No | No | Own request context only | Own assigned facility context only | Own doctor context only | Assigned cases | Yes | Yes |
| Provider registration requests | Insert later only if approved | Own submission later | Own requests | Scoped facility requests | Own doctor requests | Assigned cases | Yes | Yes |
| Correction requests | Insert later only if approved | Own submission later | Related provider status only | Related facility status only | Related doctor status only | Assigned cases | Yes | Yes |
| Feedback submissions | Insert later only if approved | Own submission later | No by default | No by default | No by default | Assigned cases | Yes | Yes |
| Provider ownership records | No | No | Own ownership only | No or scoped membership | Own ownership only | Assigned cases | Yes | Yes |
| Admin review notes | No | No | No | No | No | Assigned cases | Yes | Yes |
| Audit logs | No | Simplified own history later | No raw logs | No raw logs | No raw logs | Assigned context only | Yes | Yes |
| Patient profiles | No | Own only | No | No | No | No by default | Limited justified | Sensitive justified |
| Bookings | No | Own only | Owned provider workflow only | Assigned facility workflow only | Assigned doctor workflow only | Escalation only | Limited justified | Sensitive justified |
| Payments/wallet | No | Own only | Own workflow status only | Scoped workflow only | Scoped workflow only | No by default | Limited justified | Sensitive justified |
| Document vault | No | Own only | Shared/consented only | Shared/consented only | Shared/consented only | No by default | Rare justified | Sensitive justified |
| Community groups | Public resources only | Own groups later | No patient groups by default | No patient groups by default | Professional groups if verified | Moderation assignments | Yes | Yes |
| Chatbot sessions | No | Own sessions later | No by default | No by default | No by default | Safety assignment only | Limited justified | Sensitive justified |

Rules:

- "Later" means after auth, roles, and tables exist.
- "Limited justified" means there must be a support, review, trust, or safety reason.
- This matrix should be refined before policies are written.

---

## What Must Not Be Implemented Yet

Do not implement any of the following in this task:

- SQL policies
- Database migrations
- Supabase tables
- Supabase client code
- Supabase packages
- Backend routes
- Authentication
- Dashboards
- Protected routes
- Storage buckets
- Edge Functions
- Service role workflows
- Public insert policies
- Provider owner policies
- Patient policies
- Booking policies
- Payment policies
- Document vault policies
- Community/chatbot policies
- Frontend UI changes

This document is a planning artifact only.

---

## Relationship to Public Listing Schema Draft

This document depends on `PublicListingSchemaDraft.md`.

Relationship:

- The schema draft defines candidate public tables and fields.
- This RLS plan defines who should access those tables later.
- The schema draft separates public and private fields.
- This RLS plan turns that separation into access-control principles.
- The schema draft identifies status fields.
- This RLS plan uses status fields to control public reads.

Rule:
No public listing table should be implemented before its public/private fields and RLS access rules are understood.

---

## Relationship to Supabase Phase 1

This document supports `SupabaseIntegrationPhase1.md`.

Phase 1 relationship:

- Phase 1 should begin with public-safe directory data and request/review foundations.
- RLS should be enabled on every Phase 1 table.
- Public reads should be limited to published records.
- Request/review tables should be private.
- Provider ownership planning should not grant broad access before auth.
- Audit logs should be protected.
- Storage, Edge Functions, booking, payments, documents, chatbot, community, and patient workflows should wait.

Rule:
Supabase Phase 1 should not launch public database access until RLS policies are tested in a non-production environment.

---

## MVP Recommendation

Do not implement RLS policies in this documentation task.

Current MVP stance:

- Keep the app frontend-only.
- Keep static seed data active.
- Do not add SQL.
- Do not add migrations.
- Do not add Supabase client code.
- Do not add Supabase packages.
- Do not add backend functionality.
- Do not add auth, dashboards, protected routes, or storage.
- Do not modify frontend UI.

Recommended first RLS implementation later:

Start with public read policies for published public-safe listing tables in a development or staging Supabase project, then test anonymous access thoroughly before connecting UI.

---

## Risks

Key risks:

- Treating RLS as optional.
- Exposing draft or hidden listings publicly.
- Exposing request, review, ownership, or audit records.
- Allowing providers to update public listings directly.
- Allowing facility managers too much access.
- Allowing doctor owners to self-verify.
- Letting admins or reviewers see more patient data than needed.
- Exposing service role keys to the browser.
- Adding patient, booking, payment, document, chatbot, or community tables before access rules are clear.
- Writing policies before public/private fields are separated.
- Forgetting to test delete or update access.
- Using production data before policies are validated.

Mitigations:

- Enable RLS on all tables.
- Deny by default.
- Use published/public visibility filters.
- Keep request/review/ownership/audit tables private.
- Use ownership and assignment records for scoped access.
- Keep service role server-only.
- Test policies in staging.
- Add advanced workflow policies only in later dedicated phases.

---

## Recommended Next Development Order

1. Keep DigitalDirectory-v2 frontend-only until Supabase implementation is approved.
2. Review `PublicListingSchemaDraft.md` and final public/private fields.
3. Confirm Phase 1 table list.
4. Define status fields used for public visibility.
5. Write plain-language access rules for each table.
6. Decide which tables are public-readable and which are private-only.
7. Define owner, manager, doctor owner, reviewer, admin, and Super Admin role checks.
8. Define audit log access rules.
9. Plan policy tests before SQL is written.
10. Add Supabase tables and RLS only in a later approved migration task.
11. Test anonymous reads against published and unpublished records.
12. Test provider owner, facility manager, doctor owner, reviewer, admin, and Super Admin access after auth exists.
13. Connect public read-only UI only after RLS is tested.
14. Add request intake policies only after validation and abuse controls are planned.
15. Add patient, booking, payment, document, chatbot, notification, and community policies only when those features are ready.

---

## Summary

RLS should be the core safety boundary for future Supabase integration.

The first RLS planning goal is simple: anonymous users can read published public-safe listing data, and everything private remains denied unless a future role, ownership record, assignment, or consent rule explicitly allows access.

The recommended current action is documentation only. No SQL, RLS policies, migrations, Supabase code, backend functionality, auth, dashboards, protected routes, storage, or frontend UI changes should be added in this task.
