# DigitalDirectory-v2 Admin Review Workflow Planning

## Purpose

This document defines the future admin and reviewer workflow for DigitalDirectory-v2.

It is planning-only. It does not add backend functionality, Supabase, database files, migrations, SQL, authentication, admin dashboard UI, protected routes, packages, or frontend UI changes.

The goal is to define how future admins and reviewers should safely manage submitted healthcare information before any dashboard or backend implementation begins.

---

## Core Principles

### Trust Comes Before Publishing

Provider submissions, correction requests, community-submitted listings, listing updates, and verification claims should never publish directly to public listings without review.

### Public Discovery Remains Open

Admin and reviewer workflows should protect listing quality without requiring patients or visitors to log in for browsing, search, or public detail pages.

### Internal Review Data Stays Private

Admin notes, reviewer notes, submitter private contact details, verification evidence, identity documents, source confidence, and safety flags should never be exposed in public listing payloads.

### Every Trust-Critical Decision Is Audited

Changes to verification status, listing status, public contact details, provider ownership, duplicate handling, and rejected or suspended records should create audit history.

---

## Future Roles

### Admin Role

Admins are responsible for final platform trust decisions and operational control.

Future admin responsibilities:

- Manage review queues
- Assign reviewers
- Approve or reject provider registrations
- Approve or reject verification cases
- Resolve correction requests
- Merge duplicate listings
- Publish, hide, suspend, archive, or restore listings
- Review feedback that signals trust or safety risk
- Manage role and ownership decisions later
- Review audit logs

Admins should have broad capability, but actions should still be logged and ideally scoped by least-privilege rules over time.

### Reviewer / Verifier Role

Reviewers support verification and content quality without full admin power.

Future reviewer responsibilities:

- Review assigned cases
- Check submitted information against evidence
- Identify incomplete or risky submissions
- Recommend approval, rejection, needs-changes, duplicate, or escalation
- Add private review notes
- Request more information
- Escalate sensitive or uncertain cases to admins

Reviewers should not directly change role permissions, delete audit logs, bypass final approval rules, or publish sensitive listing changes unless future policy explicitly allows it.

### Provider Owner Role Later

Provider owners are future authenticated users who can manage their own provider listing requests.

Future provider owner responsibilities:

- Claim a doctor, facility, pharmacy, or diagnostics listing
- Submit updates for owned listings
- Request verification
- Provide supporting information or future verification documents
- Respond to reviewer requests for more information
- View their own request status

Provider owners should not publish public changes directly. Their updates should enter review queues.

---

## Review Queue Types

Future review queues should be separated by workflow so reviewers can understand priority and context.

Recommended queues:

| Queue | Purpose |
| --- | --- |
| Provider registration | New listing, claim, or verification requests |
| Corrections | Public or provider-submitted listing corrections |
| Feedback | Product feedback, trust concerns, abuse signals, feature requests |
| Verification | Evidence-based verification of providers and contact details |
| Duplicate listings | Possible duplicate provider records |
| Community-submitted listings | Listings added without verified owner evidence |
| Listing updates | Provider or admin changes to public listing fields |
| Trust and safety | Suspicious, harmful, disputed, or high-risk records |
| Migration review | Records imported from old data before publication or verification |

Each queue should support filtering by provider type, status, priority, assigned reviewer, submission age, and risk signals.

---

## Provider Registration Review Flow

Provider registration review covers new listing requests, listing claims, verification requests, and update requests from doctors, facilities, pharmacies, and diagnostics providers.

Recommended flow:

1. Request is submitted.
2. Request is stored privately with status `new`.
3. System checks for obvious duplicates by name, location, phone, and category.
4. Request enters the provider registration queue.
5. Reviewer checks submitted public fields for clarity, completeness, and consistency.
6. Reviewer checks whether an existing listing already matches the provider.
7. Reviewer checks verification evidence when provided in a future upload workflow.
8. Reviewer chooses a recommendation: approve, reject, needs information, duplicate, or escalate.
9. Admin confirms final decision when required.
10. If approved, public listing data is created or updated.
11. Verification status and listing status are set deliberately.
12. Audit log records the decision and before/after public data.

Important rules:

- A provider registration request is not a public listing by default.
- Private submitter contact details should stay internal.
- New providers should not automatically become verified.
- Claim requests should require evidence before ownership is granted.

---

## Correction Request Review Flow

Correction requests help improve listing accuracy.

Recommended flow:

1. Correction request is submitted from public page, detail page, contact page, or future provider account.
2. Current public value is snapshotted.
3. Request enters correction queue with status `new`.
4. Reviewer compares submitted correction with existing public data.
5. Reviewer checks source quality, duplicate risk, and trust impact.
6. Reviewer decides accepted, rejected, needs information, duplicate, or escalated.
7. Accepted corrections update public listing fields only through an auditable change.
8. Search index is refreshed if search-visible fields changed.
9. Request is closed with resolution note.

Important rules:

- Corrections should not overwrite public data automatically.
- High-impact corrections, such as phone number, address, closed status, verification, or ownership changes, should require stronger review.
- Repeated conflicting corrections should trigger trust and safety review.

---

## Feedback Review Flow

Feedback submissions may describe product experience, listing accuracy, trust concerns, feature requests, or platform issues.

Recommended flow:

1. Feedback is submitted.
2. Feedback enters queue with category and priority.
3. Reviewer classifies it as platform feedback, listing correction lead, trust concern, duplicate, or support need.
4. If listing-related, reviewer links it to a listing or creates a correction request.
5. If safety-related, reviewer escalates to admin.
6. If product-related, reviewer marks planned, reviewed, duplicate, or closed.
7. Audit or internal history records classification and resolution.

Important rules:

- Feedback should not directly change healthcare listing data.
- Feedback submitter details should remain private.
- Trust and safety feedback should have a faster escalation path.

---

## Verification Review Flow

Verification review decides whether a provider, listing, or contact detail can show a verified trust label.

Recommended flow:

1. Verification case is created from provider request, admin action, migration review, or reverification schedule.
2. Case enters verification queue.
3. Reviewer checks identity, provider type, location, contact details, and evidence.
4. Reviewer checks that public fields match approved evidence.
5. Reviewer records findings and recommendation.
6. Admin approves, rejects, requests more information, marks expired, or escalates.
7. Public verification status is updated only after final decision.
8. Audit log records actor, decision, reason, timestamps, and changed fields.

Important rules:

- Verification documents should be private.
- Verification status should include `last_verified_at`.
- Expired verification should not remain visually equivalent to current verification.
- Verification decisions should be reversible only with audit history.

---

## Duplicate Listing Review Flow

Duplicate listings can confuse users and weaken trust.

Recommended flow:

1. Possible duplicate is detected by reviewer, admin, correction request, provider claim, migration process, or future automated check.
2. Duplicate case is created.
3. Reviewer compares names, addresses, phone numbers, services, provider type, and location.
4. Reviewer chooses a primary record.
5. Reviewer recommends merge, reject duplicate claim, mark as separate provider, or escalate.
6. Admin confirms merge if public records are affected.
7. Merged record preserves aliases, useful contact data, source history, and audit trail.
8. Duplicate record is marked `duplicate`, hidden, or archived.

Important rules:

- Do not delete duplicate records immediately.
- Preserve history of merged sources.
- Public URLs should redirect or show the primary record in a future implementation if needed.

---

## Community-Submitted Listing Review Flow

Community-submitted listings are useful but should be clearly unverified until reviewed.

Recommended flow:

1. Community listing is submitted or migrated from non-verified source.
2. Listing enters queue with source type `community_submitted`.
3. Reviewer checks whether the provider appears real, relevant, and non-duplicative.
4. Reviewer decides draft, publish as community submitted, reject, needs information, duplicate, or escalate.
5. If published, listing remains clearly marked as community submitted or unverified.
6. Verification requires a separate verification case.

Important rules:

- Community submitted does not mean verified.
- Public UI must not make community-submitted listings look equal to verified providers.
- Risky or unverifiable listings should stay hidden until reviewed.

---

## Listing Update Review Flow

Listing updates include provider-submitted changes, admin edits, and future migrated data improvements.

Recommended flow:

1. Update request is created with proposed changes.
2. Current public values are snapshotted.
3. Request enters listing update queue.
4. Reviewer checks changed fields and risk level.
5. Low-risk text improvements may be approved faster.
6. High-risk fields require stronger review.
7. Approved changes update public listing data.
8. Audit log records before and after snapshots.
9. Search index is refreshed if search-visible fields changed.

High-risk fields:

- Provider name
- Phone number
- Address
- Location coordinates
- Verification status
- Listing status
- Ownership
- Services that affect patient decisions
- Working hours for emergency or 24-hour claims

---

## Decision Types

Recommended review decisions:

| Decision | Meaning |
| --- | --- |
| Approve | Accept submission and apply approved public changes |
| Reject | Decline submission |
| Needs information | Ask submitter or provider for more information |
| Escalate | Send to admin or higher-trust review |
| Mark duplicate | Link to existing record or duplicate group |
| Merge | Combine records into a primary listing |
| Archive | Preserve record but remove from active use |
| Hide | Temporarily remove from public display |
| Suspend | Remove due to safety, abuse, or policy concern |
| Verify | Apply verified status after evidence review |
| Unverify | Remove verified status due to expiration or concern |
| Reopen | Return a closed case to review |

Each decision should include actor, timestamp, reason, and affected fields where relevant.

---

## Priority Levels

Recommended priorities:

| Priority | Use When |
| --- | --- |
| Low | Minor text, category, or non-urgent display issue |
| Normal | Standard provider registration, correction, or feedback |
| High | Public contact, address, hours, duplicate, or verification concern |
| Urgent | Safety issue, harmful misinformation, impersonation, abuse, or critical access information |

Priority should be based on user safety, trust impact, public visibility, and time sensitivity.

---

## Trust and Safety Rules

Rules:

- Never publish provider-submitted changes directly without review.
- Never expose verification documents publicly.
- Never expose submitter private contact details publicly.
- Keep verified and unverified listings visually and structurally distinct.
- Treat phone numbers, addresses, ownership, and verification status as high-impact fields.
- Escalate impersonation, fraud, abuse, suspicious edits, harmful medical claims, and provider identity conflicts.
- Keep audit history for trust-critical changes.
- Mark outdated or expired verification clearly.
- Preserve source history for migrated and community-submitted records.
- Avoid collecting patient health information unless a future feature genuinely requires it.

---

## Admin Review Data Needs

Future review records should include:

| Field | Purpose |
| --- | --- |
| `id` | Stable review record ID |
| `review_subject_type` | Registration, correction, feedback, verification, duplicate, listing update |
| `review_subject_id` | Linked request or listing |
| `provider_type` | Doctor, facility, pharmacy, diagnostics provider |
| `status` | New, assigned, in review, needs information, approved, rejected, escalated, closed |
| `priority` | Low, normal, high, urgent |
| `assigned_to` | Reviewer or admin |
| `submitted_by` | Submitter or system actor when known |
| `source_type` | Provider, public visitor, admin, migration, community |
| `current_value_snapshot` | Public value before change |
| `proposed_value_snapshot` | Submitted change |
| `review_notes` | Private reviewer notes |
| `decision` | Final or recommended decision |
| `decision_reason` | Internal decision reason |
| `public_note` | Optional public-safe note |
| `created_at` | Case creation time |
| `updated_at` | Last update time |
| `decided_at` | Decision time |

---

## Reviewer Assignment Planning

Assignment options:

- Manual admin assignment
- Queue-based self-assignment
- Provider-type specialization
- Location-based assignment
- Priority-based assignment
- Escalation-based assignment

Recommended starting approach:

1. Admin assigns high-risk and urgent reviews manually.
2. Reviewers can work normal priority queues by provider type.
3. Sensitive cases require admin ownership.
4. Stale cases should surface automatically in a future dashboard.

Assignment rules:

- Avoid assigning a reviewer to cases where they may have a conflict of interest.
- Track assigned reviewer and assignment history.
- Allow reassignment with audit record.
- Escalate unanswered needs-information cases after a defined time.

---

## Audit Trail Planning

Audit logs should record all trust-critical actions.

Actions to audit:

- Listing created
- Listing updated
- Listing published
- Listing hidden, archived, suspended, or restored
- Verification approved, rejected, expired, or removed
- Correction accepted or rejected
- Registration request approved or rejected
- Duplicate merged or marked separate
- Provider ownership granted or revoked
- Reviewer assigned or reassigned
- Admin role or reviewer role changed

Suggested audit data:

| Field | Purpose |
| --- | --- |
| `actor_id` | Admin, reviewer, provider, or system actor |
| `actor_role` | Role at the time of action |
| `action_type` | What happened |
| `entity_type` | Target table/type |
| `entity_id` | Target record |
| `before_snapshot` | Previous values |
| `after_snapshot` | New values |
| `reason` | Decision or change reason |
| `created_at` | Action timestamp |

Audit logs should be append-only in future implementation.

---

## Admin Dashboard Planning

Admin dashboard work is future documentation only in this task.

Future dashboard sections may include:

- Overview metrics
- Registration queue
- Correction queue
- Verification queue
- Duplicate review queue
- Feedback and trust concerns
- Listing management
- Reviewer assignment
- Audit logs
- Moderation flags
- Provider ownership requests

Future dashboard features:

- Filter by provider type
- Filter by priority
- Filter by status
- Filter by assigned reviewer
- Compare current and proposed values
- Show private reviewer notes
- Show public-safe decision notes
- Show audit history
- Approve, reject, escalate, merge, archive, hide, or request information

No admin dashboard UI should be built until backend, authentication, RLS, and audit logs are ready.

---

## Notification Planning

Notification work is future documentation only in this task.

Future notification types:

- Provider request received
- Needs more information
- Request approved
- Request rejected
- Verification approved
- Verification expired or needs renewal
- Correction accepted
- Correction rejected
- Admin assignment
- Urgent trust and safety escalation

Potential future channels:

- In-app provider dashboard notifications
- Email notifications
- Admin dashboard alerts
- Reviewer queue alerts

Notification rules:

- Do not send messages until consent, templates, and delivery provider are defined.
- Avoid exposing sensitive review details in email previews.
- Keep patient and submitter private details protected.
- Log important notification events when they affect review status.

---

## Relationship to Future Supabase Tables

This workflow maps to future planning tables from `DataModelContentStructure.md` and `SupabaseBackendPlanning.md`.

Potential related tables:

| Workflow Area | Future Table |
| --- | --- |
| Provider registration | `provider_registration_requests` |
| Correction review | `correction_requests` |
| Feedback review | `feedback_submissions` |
| Verification review | `verification_cases` |
| Admin decisions | `admin_reviews` |
| Audit history | `audit_logs` |
| Duplicate handling | `duplicate_groups` |
| Trust and safety flags | `moderation_flags` |
| Provider ownership | `provider_ownerships` |
| Reviewer/admin users | `profiles`, `roles`, `user_roles` |
| Public listing changes | `facilities`, `doctors`, `pharmacies`, `diagnostics_providers` |
| Search refresh | `search_documents` |

Future Supabase direction:

- RLS should protect all internal review tables.
- Anonymous users should not read review data.
- Provider owners should see only their own requests later.
- Reviewers should see assigned cases.
- Admins should see broader review data.
- Audit logs should be protected and append-only.

---

## Recommended Next Development Order

1. Keep the current app frontend-only and public-first.
2. Stabilize documentation for roles, data structure, Supabase planning, and admin review workflow.
3. Define exact review statuses and decision enums in planning before backend implementation.
4. Define public-safe field sets for listing cards, detail pages, and search results.
5. Draft future backend schema from the data and workflow documents.
6. Define RLS policy requirements for admin, reviewer, provider owner, and public users.
7. Add Supabase only in a dedicated backend task.
8. Add authentication only when provider/admin workflows are ready.
9. Create review intake storage for registration, corrections, and feedback.
10. Add audit logging before review decisions can update public listings.
11. Build protected admin/reviewer dashboard UI only after backend, auth, RLS, and audit logs exist.
12. Add provider ownership workflows after admin review is reliable.
13. Add notifications only after templates, consent, privacy rules, and delivery channels are defined.

---

## Summary

DigitalDirectory-v2 should treat admin and reviewer workflows as the trust engine of the platform.

Future admins make final trust decisions, reviewers support verification and quality, provider owners submit changes later, and all public listing changes should move through review, decision, and audit trails before publication.

This workflow should be implemented only after backend, authentication, role permissions, RLS, and audit planning are ready.
