# DigitalDirectory-v2 Governance Roles and Super Admin Strategy

## Purpose

This document defines future governance roles, Super Admin authority, admin hierarchy, reviewer responsibilities, role assignment rules, escalation paths, and platform control boundaries for DigitalDirectory-v2.

It is planning-only. It does not add backend functionality, Supabase, database files, migrations, SQL, authentication, dashboards, protected routes, UI pages, packages, or frontend changes.

The goal is to clarify internal governance before real authentication, Supabase roles, admin dashboards, verification workflows, patient reviews, patient ID, wallet concepts, doctor schedules, or provider ownership tools are implemented.

---

## Governance Principles

### Public Discovery Remains Open

Patients and public users should continue to browse, search, and view healthcare listings without an account.

Governance roles should protect trust-critical workflows without turning public discovery into an account-gated experience.

### Least Privilege By Default

Each future internal role should receive only the access needed for its responsibilities.

### Super Admin Is Exceptional

Super Admin access should be rare, tightly controlled, strongly audited, and used only for platform-level governance.

### Verification Requires Accountability

Verification decisions should require evidence, reviewer/admin identity, timestamps, and audit history.

### Sensitive Data Is Protected

Verification evidence, private provider contact details, admin notes, reviewer notes, audit logs, patient identifiers, wallet-related data, and moderation history should never appear in public listing data.

---

## Future Roles

### Super Admin

Purpose:
Own final platform governance, role control, emergency platform actions, and sensitive configuration authority.

Future responsibilities:

- Assign or remove Admin roles
- Assign or remove Reviewer / verifier roles
- Manage role escalation rules
- Manage platform-wide governance settings
- Override admin decisions only when necessary
- Restore or suspend critical platform records
- Review sensitive audit logs
- Handle severe trust and safety escalations
- Approve high-risk policy changes
- Approve access to sensitive operational areas

Super Admin should not be used for routine listing review, routine corrections, routine feedback triage, or daily provider support.

### Admin

Purpose:
Operate trusted listing management, provider review, correction resolution, and verification workflows.

Future responsibilities:

- Manage review queues
- Approve or reject provider registration requests
- Confirm verification decisions
- Resolve high-impact corrections
- Merge duplicate listings
- Hide, archive, suspend, or restore listings when policy allows
- Assign reviewers
- Review content reviewer decisions
- Escalate sensitive cases to Super Admin

Admins should be trusted operators, but they should not assign Super Admin access, delete audit logs, bypass all review controls, or access unnecessary patient-sensitive data.

### Reviewer / Verifier

Purpose:
Support verification and quality control by reviewing assigned cases.

Future responsibilities:

- Review provider registration requests
- Review verification evidence
- Compare submitted data against public listing fields
- Recommend approval, rejection, needs information, duplicate, or escalation
- Add private review notes
- Escalate uncertain or high-risk cases

Reviewers should not make broad role assignments, delete records, bypass admin approval, or independently publish high-risk listing changes.

### Support Operator

Purpose:
Handle user/provider support, contact requests, and routine operational guidance without broad trust authority.

Future responsibilities:

- Triage contact messages
- Help providers understand request status
- Route correction, verification, or trust concerns to reviewers/admins
- Mark support items as responded or escalated
- View limited public-safe context for support issues

Support operators should not approve verification, edit public listing data, access private verification documents unless explicitly assigned, or manage roles.

### Content Reviewer

Purpose:
Review public-facing content quality, clarity, category fit, spelling, duplication hints, and safe presentation.

Future responsibilities:

- Check public descriptions for clarity
- Flag duplicate or suspicious listings
- Recommend category, service, or specialty cleanup
- Review community-submitted listings for basic completeness
- Escalate trust-sensitive or medical-claim-heavy content

Content reviewers should not approve clinical verification, access sensitive documents, manage roles, or publish high-risk listing changes without admin approval.

### Provider Owner

Purpose:
Allow authenticated providers later to manage requests related to their own listings.

Future responsibilities:

- Claim own doctor, facility, pharmacy, or diagnostics listing
- Submit listing updates
- Request verification
- Respond to reviewer requests for more information
- View own request status
- Manage future doctor schedule or provider availability fields when approved

Provider owners should not publish changes directly, approve their own verification, view other providers' private records, access admin notes, or assign roles.

### Public User / Patient

Purpose:
Search and discover trusted healthcare information without account friction.

Boundary:
Public users and patients should not need accounts for basic discovery.

Future optional patient account features may include:

- Saved providers
- Booking history
- Patient reviews if implemented
- Patient ID if implemented
- Wallet concepts if implemented
- Notification preferences

These features should not be required for search, browsing, or reading public listings.

---

## Governance Hierarchy

Recommended hierarchy:

```text
Super Admin
  -> Admin
      -> Reviewer / verifier
      -> Content reviewer
      -> Support operator
  -> Provider owner
  -> Public user / patient
```

Important boundaries:

- Super Admin controls role assignment and severe escalations.
- Admin controls operational review and verification workflows.
- Reviewers and content reviewers recommend decisions within assigned scope.
- Support operators triage communication and route issues.
- Provider owners submit requests about their own listings.
- Public users/patients browse and submit public feedback/corrections without governance authority.

---

## Governance Matrix

| Capability | Super Admin | Admin | Reviewer / verifier | Content reviewer | Support operator | Provider owner | Public user / patient |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Browse public listings | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Submit feedback/correction | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Claim provider listing | No routine use | Assist/review | Review assigned | No | Route support | Own listing only | No |
| Submit listing update | No routine use | Any listing | Recommend only | Recommend only | No | Own listing only | No |
| Publish listing update | Emergency only | Yes, with audit | No, unless future policy allows | No | No | No | No |
| Approve verification | Emergency/final authority | Yes | Recommend only | No | No | No | No |
| Reject verification | Emergency/final authority | Yes | Recommend only | No | No | No | No |
| Assign reviewers | Yes | Yes | No | No | No | No | No |
| Assign Admin role | Yes | No | No | No | No | No | No |
| Assign Super Admin role | Restricted Super Admin process | No | No | No | No | No | No |
| View admin notes | Yes | Yes | Assigned cases | Limited if assigned | Limited support context | No | No |
| View audit logs | Full sensitive access | Operational access | Assigned action history | Limited if needed | No or limited | Own actions later | No |
| Manage patient reviews later | Policy/final authority | Moderate/escalate | Review assigned | Review content | Route support | No | Own review only |
| Manage patient ID/wallet later | Emergency governance only | Limited operational oversight | No | No | Support escalation only | No | Own account only |

---

## Sensitive Actions

Sensitive actions require stronger governance and audit history.

Sensitive actions include:

- Assigning or removing Super Admin
- Assigning or removing Admin
- Granting provider ownership
- Revoking provider ownership
- Approving verification
- Removing verification
- Suspending a listing
- Restoring a suspended listing
- Merging duplicate listings
- Publishing high-impact listing updates
- Viewing sensitive verification documents
- Viewing sensitive audit logs
- Accessing future patient ID data
- Accessing future wallet-related data
- Moderating or removing patient reviews
- Changing role policies or RLS policies in a future Supabase implementation

Recommended rule:
Sensitive actions should require audit logs. The highest-risk actions should require Super Admin authority or dual review in future implementation.

---

## Verification Authority

Verification is a trust-critical decision.

Recommended authority levels:

| Action | Authority |
| --- | --- |
| Submit verification request | Provider owner, Admin |
| Review verification evidence | Reviewer / verifier, Admin |
| Recommend verification approval | Reviewer / verifier |
| Approve verification | Admin |
| Override verification decision | Super Admin only |
| Remove verification | Admin, with escalation for disputed cases |
| Approve disputed verification | Super Admin |
| Mark verification expired | Admin or automated future policy with audit |

Rules:

- Provider owners cannot verify themselves.
- Content reviewers cannot approve verification.
- Support operators cannot approve verification.
- Verification evidence must remain private.
- Verification changes must create audit records.

---

## Audit Log Access

Audit logs should be protected and role-scoped.

Recommended access:

| Role | Audit Access |
| --- | --- |
| Super Admin | Full audit access, including sensitive role and policy actions |
| Admin | Operational audit access for listings, reviews, corrections, verification, and assigned workflows |
| Reviewer / verifier | Audit access for assigned cases and own actions |
| Content reviewer | Limited audit access for assigned content decisions |
| Support operator | Minimal or no audit access; support status history only |
| Provider owner | Own request history and public-safe status changes later |
| Public user / patient | No audit log access |

Audit logs should be append-only in future implementation.

---

## Role Assignment Rules

Recommended rules:

- Super Admin assignment should require the strictest process.
- Admins should not be able to grant Super Admin.
- Reviewer, content reviewer, and support operator roles can be assigned by Admin or Super Admin.
- Provider owner role should be granted only after claim review.
- Role changes should be logged.
- Temporary access should expire automatically in future implementation.
- Dormant privileged accounts should be reviewed.
- Users should not review their own provider ownership or verification cases.

Potential future safeguards:

- Two-person approval for Super Admin changes
- Stronger authentication for privileged roles
- Access expiry for temporary reviewers
- Periodic access review
- Conflict-of-interest flags

---

## Escalation Rules

Escalate to Admin when:

- A reviewer cannot verify evidence confidently.
- A correction changes phone, address, ownership, or verification status.
- A duplicate merge affects public records.
- A listing has conflicting public submissions.
- A support request includes a trust or safety concern.
- A content reviewer flags risky healthcare claims.

Escalate to Super Admin when:

- Admin decisions are disputed.
- Super Admin or Admin access needs change.
- There is suspected impersonation, fraud, or abuse by privileged users.
- Patient ID or wallet-related data is involved later.
- There is a severe privacy or security incident.
- A listing suspension/restoration is highly sensitive.
- Policy or RLS behavior may need emergency change.

---

## Future Supabase Role Mapping

This is planning only. No Supabase code, policies, SQL, or migrations should be added yet.

Potential future mapping:

| Governance Role | Future Supabase Mapping |
| --- | --- |
| Super Admin | `super_admin` role in `user_roles`, strongest admin policies |
| Admin | `admin` role in `user_roles`, operational admin policies |
| Reviewer / verifier | `reviewer` or `verifier` role with assigned-case access |
| Support operator | `support_operator` role with support queue access |
| Content reviewer | `content_reviewer` role with content queue access |
| Provider owner | `provider_owner` role plus `provider_ownerships` rows |
| Public user / patient | Anonymous public user or future `patient` role for optional account features |

Future Supabase policy direction:

- Public users can read public-safe published listing data.
- Provider owners can read and submit requests for owned listings.
- Reviewers can read assigned cases.
- Admins can manage operational review workflows.
- Super Admins can manage privileged governance functions.
- Sensitive data should be separated and protected by RLS.

---

## Relationship to Auth UI Preview

The current `/sign-in` and `/account-preview` routes are preview-only.

They should continue to communicate:

- Public browsing remains available without signing in.
- Provider access may come later.
- Admin and reviewer access may come later.
- No real authentication exists yet.
- No account state, cookies, sessions, dashboards, Supabase, protected routes, or backend requests are active.

Future auth UI should not expose Super Admin as a normal public account choice. Super Admin access should be an internal operational role, not a public sign-up option.

---

## Relationship to Doctor Content and Schedule Features

Future doctor content and schedule features may include:

- Doctor profile ownership
- Specialty updates
- Facility affiliations
- Availability schedule
- Booking availability
- Telemedicine availability
- Profile photo or credentials

Governance rules:

- Doctor owners may submit schedule or profile updates for review.
- Low-risk schedule text changes may follow a lighter review process later.
- Verification-related doctor changes require reviewer/admin review.
- Facility affiliation changes should be reviewed to avoid false association.
- Booking and telemedicine settings should not launch until ownership, audit, and patient privacy rules are ready.

---

## Relationship to Patient Reviews, Patient ID, and Wallet Concepts

These concepts are future-only and should not be implemented yet.

### Patient Reviews

Patient reviews may eventually help trust, but they introduce moderation risk.

Governance needs:

- Review moderation policy
- Abuse and spam handling
- Provider response rules
- Patient privacy controls
- Escalation for harmful or defamatory content
- Clear distinction between verified listing data and user reviews

### Patient ID

Patient ID concepts may support future bookings, membership, wallet, or care history features.

Governance needs:

- Strong privacy rules
- Clear data minimization
- Patient consent
- Limited staff access
- Audit logs for access
- No exposure in public listing data

### Wallet Concepts

Wallet concepts may relate to future payments, credits, memberships, or healthcare programs.

Governance needs:

- Strong access controls
- Financial audit trails
- Dispute handling
- Refund/adjustment authority
- Super Admin escalation for severe issues
- Separation from public listing governance

Patient ID and wallet data should require stricter governance than public listing data.

---

## Recommended Next Development Order

1. Keep the current app frontend-only and public-first.
2. Preserve `/sign-in` and `/account-preview` as preview-only UI.
3. Stabilize role and governance documentation before backend implementation.
4. Define exact role names, sensitive actions, and audit requirements.
5. Define public-safe vs internal data access boundaries.
6. Plan Supabase tables and RLS policy language from the governance model.
7. Add authentication only when provider/admin workflows are ready.
8. Add Super Admin and Admin role management only after audit logging exists.
9. Add reviewer, content reviewer, and support operator queues after admin review workflow is implemented.
10. Add provider ownership after claim review and verification workflows exist.
11. Add doctor schedule features only after provider ownership and audit rules are ready.
12. Add patient reviews only after moderation governance exists.
13. Add patient ID or wallet concepts only after privacy, security, audit, and financial governance are ready.

---

## Summary

DigitalDirectory-v2 governance should separate platform-level authority from routine operations.

Super Admin should handle rare, sensitive, platform-level control. Admins should run operational review workflows. Reviewers, content reviewers, and support operators should work within scoped queues. Provider owners should submit changes for review. Public users and patients should keep login-free access to healthcare discovery.

This governance model should guide future Supabase roles, auth implementation, admin dashboards, verification authority, doctor schedule tools, patient reviews, patient ID concepts, and wallet concepts without adding any of those systems today.
