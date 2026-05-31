# DigitalDirectory-v2 Notification and Reminder Strategy

## Purpose

This document defines the future strategy for notification and reminder workflows in DigitalDirectory-v2.

It is planning-only. It does not add backend functionality, Supabase, database files, migrations, SQL, authentication, dashboards, protected routes, notification UI, notification functionality, SMS integration, email integration, WhatsApp integration, Telegram integration, push notifications, packages, or frontend changes.

The goal is to clarify how notifications should work later for appointments, booking status changes, telemedicine, patient document vault activity, lab or result-ready events, payments and refunds, provider registration and verification, corrections, feedback, admin review, and provider dashboards.

---

## Core Principle

Notifications should be useful, consent-based, minimal, and privacy-safe.

DigitalDirectory-v2 should not send messages before the platform has real workflows, patient or provider preferences, secure templates, delivery providers, audit logs, and support rules.

Public healthcare discovery should remain login-free and notification-free. Patients should be able to search, browse, view providers, and open shared public links without creating an account or opting into messages.

---

## Notification Purpose

Future notifications may help users and operators understand when something needs attention.

Primary purposes:

- Remind patients about appointments after booking exists.
- Notify patients when appointment requests, cancellations, or reschedules change.
- Notify providers when future booking requests or listing requests need action.
- Notify patients when private documents are ready in a secure vault later.
- Notify users about payment, refund, or wallet events later.
- Notify providers about registration, verification, or listing review status.
- Notify correction and feedback submitters when a review status changes.
- Notify admins, reviewers, support operators, and content reviewers about assigned review work.

Notifications should not be used to:

- Push marketing before explicit opt-in.
- Send medical advice.
- Send diagnosis, test result, prescription, or treatment details.
- Replace emergency care guidance.
- Confirm care that has not actually been confirmed.
- Pressure patients to book, review, pay, or share listings.

---

## Notification Types

Future notification types should map to real product workflows.

| Type | Primary Audience | Example Trigger |
| --- | --- | --- |
| Appointment reminders | Patients, caregivers later | Confirmed appointment is approaching |
| Booking status updates | Patients, providers | Request confirmed, declined, or needs information |
| Reschedule and cancellation alerts | Patients, providers | Appointment time changes or is cancelled |
| Telemedicine notifications | Patients, doctors | Session link ready or session starting later |
| Document vault notifications | Patients, authorized providers | Document uploaded, shared, revoked, or ready |
| Lab/result-ready notifications | Patients | Diagnostics report is ready in secure view later |
| Payment and refund notifications | Patients, sponsors, providers | Payment succeeds, fails, refunds, or credits |
| Provider registration updates | Providers | Listing request received, approved, or needs info |
| Verification notifications | Providers, reviewers | Verification case status changes |
| Correction notifications | Public submitters, providers, reviewers | Correction accepted, rejected, or needs review |
| Feedback notifications | Submitters, support, admins | Feedback is received or routed |
| Admin/reviewer notifications | Internal roles | New queue item, escalation, stale case |
| Security and privacy notifications | Patients, providers, admins | Consent, access, or sensitive account changes later |

Rules:

- Each notification type should have a documented purpose.
- Transactional notifications should be separate from community, marketing, or product update messages.
- Sensitive notification types should use stricter wording and channel controls.
- Notification events should not exist before the underlying workflow exists.

---

## Appointment Reminders

Appointment reminders should come only after real booking and scheduling workflows exist.

Potential reminder triggers:

- Appointment confirmed.
- Appointment is 24 hours away.
- Appointment is 2 hours away.
- Appointment location or time changed.
- Appointment is cancelled or rescheduled.

Privacy-safe reminder content:

```text
You have an upcoming appointment. Open DigitalDirectory to view details.
```

Avoid:

```text
Your cardiology appointment for chest pain is tomorrow at 10:00.
```

Rules:

- Do not send reminders for preview-only availability.
- Do not send reminders for appointment requests that are not confirmed unless the message clearly says request status.
- Do not include diagnosis, symptoms, lab test names, prescription details, or private notes.
- Do not expose doctor or facility details in lock-screen style messages unless the user has opted into that level of detail later.
- Let patients manage reminder timing and channels when accounts exist.
- Support opt-out where legally and operationally allowed.

Recommended first reminder phase:

- Start with minimal confirmed appointment reminders.
- Use one or two reminder times.
- Avoid caregiver notifications until consent and sharing rules exist.
- Audit reminder events tied to booking status.

---

## Booking Status Notifications

Booking status notifications should explain what happened to an appointment request or confirmed booking.

Potential status events:

| Status Event | Patient Message Direction |
| --- | --- |
| Request received | "Your appointment request was received." |
| Pending provider review | "Your request is waiting for provider review." |
| Needs information | "More information is needed to continue your request." |
| Time offered | "A provider offered an appointment time." |
| Confirmed | "Your appointment is confirmed." |
| Declined | "Your request could not be confirmed." |
| Expired | "This request expired." |
| Completed | "This appointment is marked complete." |

Provider-facing status events:

- New appointment request.
- Patient accepted offered time.
- Patient cancelled request.
- Patient submitted needed information.
- Request is stale or nearing expiration.

Rules:

- Patient labels should remain simple.
- Internal statuses can be more detailed than patient notifications.
- Notification wording should avoid blaming patients or providers.
- Booking status should not include medical reason or private notes.
- Providers should see only requests tied to their own doctor, facility, pharmacy, diagnostics provider, or service workflow later.
- Status notifications should be tied to audited booking status events.

---

## Reschedule and Cancellation Alerts

Reschedule and cancellation alerts should help patients and providers avoid missed care, but they must not leak sensitive details.

Potential reschedule events:

- Patient requests a new time.
- Provider requests a new time.
- Provider offers alternate time.
- Patient accepts new time.
- Reschedule request expires.

Potential cancellation events:

- Patient cancels.
- Provider cancels.
- Booking is cancelled by policy or support.
- Payment/refund review may be needed later.

Rules:

- Cancellation reasons should not include private health details.
- Provider cancellation messages should be clear and respectful.
- Rescheduled appointments should preserve status history.
- Payment/refund implications should use separate payment notifications later.
- If transport is linked later, cancellation should not automatically change transport without explicit workflow rules.
- All cancellation and reschedule events should be audited when implemented.

Privacy-safe examples:

```text
Your appointment was cancelled. Open DigitalDirectory to view next steps.
```

```text
A new appointment time was proposed. Open DigitalDirectory to respond.
```

---

## Telemedicine Notifications

Telemedicine notifications are future-only and should wait for telemedicine booking, consent, privacy, provider readiness, and secure session workflows.

Potential telemedicine notification events:

- Telemedicine appointment confirmed.
- Session link is ready.
- Session starts soon.
- Doctor requested reschedule.
- Session was cancelled.
- Follow-up document is available later.

Rules:

- Telemedicine links should not be sent in insecure or public contexts unless policy explicitly allows a safe link model.
- Session links should expire and should not be public.
- Do not include symptoms, diagnosis, visit reason, or documents in message previews.
- Telemedicine payment messages should come from payment notification rules.
- Telemedicine document messages should come from document vault notification rules.
- Telemedicine notifications should require verified contact and consent.

Recommended wording:

```text
Your telemedicine session is ready. Open DigitalDirectory to join securely.
```

Avoid:

```text
Your private consultation link for your lab result review is here.
```

---

## Document Vault Notifications

Document vault notifications should come only after patient identity, secure storage, consent, provider access boundaries, and audit logs exist.

Potential document events:

- Patient uploaded a document.
- Provider uploaded a document.
- Document is ready to view.
- Document was shared with a provider.
- Document sharing was revoked.
- Shared document access expired.
- Provider requested access to a document.
- Provider viewed or downloaded a document, if policy requires patient notification later.

Rules:

- Do not include document title if it reveals sensitive health information.
- Do not include prescription names, lab result values, diagnoses, imaging details, or visit summaries in messages.
- Document notifications should route users to secure vault access, not expose contents.
- Sharing notifications should include recipient identity only when safe and useful.
- Document access events should be audited.
- Providers should receive document notifications only when explicitly authorized for that patient workflow.

Privacy-safe example:

```text
A document is ready in your secure vault.
```

Avoid:

```text
Your HIV test result PDF is ready.
```

---

## Lab and Result-Ready Notifications

Lab and result-ready notifications are especially sensitive.

Potential future events:

- Diagnostics provider uploaded a result.
- Lab report is ready.
- Imaging report is ready.
- Result requires secure review.
- Provider added a follow-up note.

Rules:

- Do not include test names, result values, abnormal flags, diagnosis hints, or interpretation in notification previews unless a future legal/privacy policy explicitly supports it.
- Use neutral language such as "A result is ready."
- Direct users to secure vault or diagnostics workflow after authentication.
- Do not send result documents over SMS, WhatsApp, Telegram, or email as attachments in early phases.
- Do not send results to doctors, facilities, sponsors, caregivers, or family members without consent or a defined care workflow.
- Lab/result-ready events should not appear in public reviews, listing shares, payment messages, or transport workflows.

Recommended wording:

```text
A result is ready. Open DigitalDirectory to view it securely.
```

---

## Payment and Refund Notifications

Payment and refund notifications are future-only and should wait for booking, wallet/payment strategy, gateway selection, support workflows, and audit logs.

Potential payment events:

- Payment requested.
- Payment processing.
- Payment successful.
- Payment failed.
- Payment expired.
- Refund requested.
- Refund approved.
- Refund sent.
- Wallet credit applied.
- Wallet credit received.
- Dispute opened.
- Provider settlement status changed later.

Rules:

- Payment notifications should not include diagnosis, treatment, test result, prescription, or detailed care reason.
- Providers should see payment status only for their own workflows later.
- Sponsors should see only payment purpose allowed by patient consent.
- Wallet balances should be private.
- Failed payment should not expose sensitive context.
- Refund and dispute events should be audited.
- Financial notifications should be separate from appointment reminders.

Privacy-safe examples:

```text
Your payment status was updated.
```

```text
Your refund request was received.
```

Avoid:

```text
Your payment for a pregnancy ultrasound was refunded.
```

---

## Provider Registration and Verification Notifications

Provider registration and verification notifications should help doctors, facilities, pharmacies, diagnostics providers, and their owners understand review status later.

Potential provider registration events:

- Listing request received.
- Request is in review.
- Request needs more information.
- Request approved.
- Request rejected.
- Duplicate listing detected.
- Ownership claim approved or denied.

Potential verification events:

- Verification request received.
- Evidence needed.
- Verification approved.
- Verification expired or needs renewal.
- Verification rejected.
- Verification escalated.

Rules:

- Public browsing should not require provider notifications.
- Provider notifications should go only to authorized provider owners or managers later.
- Verification evidence details should not appear in email, SMS, or public message previews.
- Rejection and needs-information messages should be clear and respectful.
- High-impact verification decisions should be audited.
- Provider owners cannot self-verify through notification links.

Provider-safe wording:

```text
Your provider listing request needs more information.
```

```text
Your verification status was updated.
```

---

## Correction and Feedback Notifications

Correction and feedback notifications should keep submitters informed without exposing internal review notes.

Correction events:

- Correction received.
- Correction entered review.
- Correction accepted.
- Correction rejected.
- Correction needs more information.
- Correction was merged with duplicate report.
- Listing was updated after review.

Feedback events:

- Feedback received.
- Feedback routed to support or review.
- Feedback closed.
- Feedback escalated to trust and safety.
- Feature request noted.

Rules:

- Submitter contact should remain private.
- Internal admin notes should not be sent.
- Public listing changes should only be announced after approval.
- Trust and safety outcomes may need generic wording.
- Feedback notifications should not promise that every suggestion will be implemented.
- Correction notifications should not expose private provider data or verification evidence.

Example:

```text
Your correction request was reviewed.
```

---

## Admin and Reviewer Notifications

Admin, reviewer, verifier, support operator, and content reviewer notifications should be internal and role-scoped.

Potential internal events:

- New provider registration assigned.
- New correction request assigned.
- Verification evidence submitted.
- Duplicate listing review needed.
- Trust and safety escalation created.
- Feedback requires support follow-up.
- Review is overdue.
- Case needs admin confirmation.
- Super Admin escalation required.

Rules:

- Internal notifications should not be sent to public users.
- Reviewers should see only assigned or permitted queues.
- Support operators should receive limited context.
- Super Admin notifications should be rare and focused on severe governance, privacy, security, or abuse cases.
- Internal notifications should link to future protected dashboards only after dashboards exist.
- Notification events should be auditable.

Priority examples:

| Priority | Internal Use |
| --- | --- |
| Low | Content cleanup, typo correction, non-urgent feedback |
| Normal | Provider registration, listing update, common correction |
| High | Verification, contact/location change, duplicate provider |
| Urgent | Privacy issue, impersonation, harmful misinformation, fraud concern |

---

## Channel Strategy

Channels should be added only after consent, delivery providers, templates, preferences, and support policies are ready.

Potential future channels:

| Channel | Best Use | Notes |
| --- | --- | --- |
| In-app notification | Account dashboard updates later | Requires authentication and UI |
| Email | Detailed transactional updates | Avoid sensitive previews |
| SMS | Time-sensitive reminders | Needs explicit consent and concise wording |
| WhatsApp | Opt-in transactional or support updates later | No integration now |
| Telegram | Opt-in community or support updates later | No integration now |
| Push notification | App-like reminders later | Requires opt-in and platform support |
| Provider dashboard alert | Provider/admin workflow tasks later | Requires dashboards |

Recommended channel order later:

1. In-app notification center after accounts and dashboards exist.
2. Email for account and provider workflow updates.
3. SMS for time-sensitive appointment reminders after consent.
4. WhatsApp or Telegram only after opt-in policies and official provider integrations are approved.
5. Push notifications only if product usage justifies it.

Rules:

- Do not send external messages without explicit channel consent.
- Do not use community channel subscriptions as transactional notification consent.
- Do not use notification channels for hidden tracking.
- Do not use social/community channels for patient-specific data.
- Each channel should have opt-in, opt-out, retry, failure, and audit planning.

---

## Consent and Opt-Out Rules

Notification consent should be explicit, scoped, and revocable where possible.

Consent categories:

| Category | Example |
| --- | --- |
| Transactional booking updates | Booking confirmed, cancelled, rescheduled |
| Appointment reminders | 24-hour and 2-hour reminders |
| Document vault updates | Document ready or share changed |
| Payment and refund updates | Payment failed, refund sent |
| Provider workflow updates | Registration and verification status |
| Correction and feedback updates | Request reviewed or needs information |
| Community and product updates | Optional newsletters and public updates |
| Marketing or growth messages | Future-only, separate opt-in |

Rules:

- Public browsing should not require notification consent.
- Transactional notifications should be separated from marketing/community updates.
- Patients should be able to opt out of non-essential messages.
- Some transactional messages may be necessary for safety or account security later, but their scope should be narrow.
- Consent should include channel, purpose, language, and timing preferences.
- Consent history should be auditable.
- Opt-out should be respected across retry systems and future providers.

---

## Patient Notification Preferences

Patient notification preferences should come only after patient accounts or verified contact workflows exist.

Potential patient preferences:

| Preference | Purpose |
| --- | --- |
| Preferred channel | Email, SMS, in-app, WhatsApp, Telegram, push later |
| Preferred language | Localized messages later |
| Quiet hours | Avoid non-urgent reminders at night |
| Appointment reminder timing | 24 hours, 2 hours, same day |
| Booking status updates | Confirmed, cancelled, rescheduled |
| Document vault updates | Document ready, share changed |
| Payment/refund updates | Payment, refund, wallet status |
| Transport updates | Directions or ride workflow later |
| Review/feedback updates | Correction, feedback, review status |
| Community updates | Optional public product updates |

Rules:

- Default to fewer messages.
- Use the lowest-risk channel for sensitive events.
- Do not enable marketing/community messages by default.
- Let patients change preferences later.
- Respect quiet hours except for urgent account/security messages.
- Do not expose patient preferences to providers except where necessary for care workflow.

---

## Provider Notification Preferences

Provider notification preferences should come after provider ownership, authentication, organization membership, and dashboards exist.

Provider preference areas:

- Registration and listing request status.
- Verification request status.
- Listing corrections involving their profile.
- Booking requests and schedule changes later.
- Patient-safe document sharing later.
- Payment and settlement updates later.
- Review response and dispute updates later.
- Provider dashboard task assignments.
- Staff role and ownership changes.

Rules:

- Provider owners and managers may need different preferences.
- Facility staff should receive only scoped notifications.
- Doctors should receive doctor-profile notifications only for their own profiles or authorized affiliations.
- Pharmacies and diagnostics providers should receive workflow-specific notifications only after real workflows exist.
- Provider notifications should not include patient details outside active, authorized workflows.
- Provider preferences should be auditable when they affect patient communication.

---

## Privacy-Safe Notification Wording

Notification wording should be written as if it could appear on a shared phone screen.

Safe wording patterns:

```text
Your appointment status was updated. Open DigitalDirectory to view details.
```

```text
A document is ready in your secure vault.
```

```text
Your provider listing request needs more information.
```

```text
Your payment status was updated.
```

```text
Your correction request was reviewed.
```

Avoid wording that includes:

- Diagnosis
- Symptoms
- Medication names
- Prescription details
- Lab result values
- Imaging findings
- Appointment reason
- Sensitive specialty or visit context
- Payment item details that reveal care type
- Document filenames that reveal health context
- Internal admin notes

Template rules:

- Use short titles.
- Keep body text neutral.
- Put details behind secure views later.
- Avoid emotional or alarming language.
- Avoid clinical advice.
- Include emergency guidance only in approved generic language.

---

## Timing and Frequency Rules

Notifications should be timely but not noisy.

Recommended timing principles:

- Send status changes shortly after they occur.
- Send appointment reminders only for confirmed appointments.
- Avoid repeated reminders for the same event unless opted in.
- Respect quiet hours for non-urgent notifications.
- Group low-priority internal alerts where possible.
- Stop reminders after cancellation or completion.
- Do not send outdated reminders after rescheduling.
- Expire actionable links and offers.

Potential reminder schedule later:

| Event | Timing Direction |
| --- | --- |
| Appointment confirmed | Immediately after confirmation |
| 24-hour reminder | Around 24 hours before appointment |
| 2-hour reminder | Around 2 hours before appointment |
| Reschedule request | Immediately after request |
| Cancellation | Immediately after cancellation |
| Document ready | Shortly after secure upload or approval |
| Payment failed | Shortly after failure |
| Review task stale | Daily or dashboard digest |

Rules:

- Do not send high-frequency reminders by default.
- Use rate limits to prevent message floods.
- Pause messages for closed, expired, rejected, or archived workflows.
- Retry failed delivery cautiously.
- Audit critical delivery attempts and failures.

---

## Emergency Escalation Boundaries

DigitalDirectory-v2 notifications should not replace emergency medical services.

Rules:

- Do not send emergency triage advice.
- Do not classify symptoms by notification.
- Do not promise ambulance, emergency transport, urgent care, or response times.
- If emergency wording is needed later, keep it generic and approved.
- Ride-hailing or transport reminders must not be framed as emergency care.

Possible generic wording later:

```text
If this is a medical emergency, contact local emergency services immediately.
```

Emergency guidance should be consistent across chatbot, transport, booking, and support strategies.

---

## Relationship to Booking

Booking is the most likely first workflow to need notifications.

Notification relationships:

- Appointment requests create booking status updates.
- Confirmed bookings can create reminders.
- Reschedules and cancellations create alerts.
- Completed bookings may support verified visit review eligibility later.
- Booking reminders should stop when bookings are cancelled, expired, or completed.

Rules:

- No booking means no appointment reminders.
- Preview availability should never trigger reminders.
- Booking notes should not appear in notifications.
- Providers should receive booking alerts only for their own authorized workflows.
- Booking notification events should be tied to booking status history.

---

## Relationship to Patient Identity

Patient identity and consent are prerequisites for patient-specific notifications.

Relationship rules:

- Public browsing remains anonymous and notification-free.
- Contact-only workflows may support limited follow-up messages later.
- Patient accounts may support preferences, notification history, saved channels, and quiet hours.
- Verified contact may be needed for booking reminders or document notifications.
- Stronger identity may be needed for wallet, document vault, or sensitive workflows.
- Patient ID should not appear in notification text.
- Patient notification history should be private and auditable.

Notification design should use the lowest identity level needed for each workflow.

---

## Relationship to Wallet and Payments

Payment and wallet notifications should follow the payments strategy and remain separate from care details.

Relationship rules:

- Payment notifications should reference transaction status, not clinical details.
- Wallet balance and ledger activity should be visible only to authorized users later.
- Sponsors should receive only purpose-safe payment updates allowed by consent.
- Refund notifications should not expose diagnosis, test result, prescription, or appointment reason.
- Provider settlement notifications should go only to authorized provider finance or owner roles later.
- Financial notification events should be audited.

Payment notifications should not be used as medical record, booking confirmation, or review eligibility proof by themselves.

---

## Relationship to Document Vault

Document notifications should be private, minimal, and vault-centered.

Relationship rules:

- Document contents should not be sent through external notification channels.
- Secure vault access should require patient identity and consent.
- Provider-uploaded document events may notify patients later.
- Patient-shared document events may notify providers only when authorized.
- Revoked, expired, and downloaded document events may notify patients depending on policy.
- Document notifications should not appear in public listing data, reviews, or share links.
- Document notification events should be audited.

Document notifications should direct users to secure views, not expose documents.

---

## Relationship to Reviews

Review-related notifications should wait until reviews or structured feedback workflows exist.

Potential future events:

- Structured feedback received.
- Public review submitted.
- Review approved.
- Review rejected.
- Review needs redaction.
- Provider response submitted.
- Provider response approved.
- Review disputed.
- Dispute resolved.

Rules:

- Public reviews should not reveal patient identity.
- Review notifications should not include private medical details.
- Providers should not receive private reviewer identifiers.
- Review dispute notifications should use neutral wording.
- Review notifications should not pressure patients to post, edit, or remove reviews.
- Moderation decisions should be auditable.

MVP direction:

- Continue using corrections and feedback as safer trust loops.
- Do not add review notifications until review systems are approved.

---

## Relationship to Transport

Transport notifications are future-only and should wait for directions, booking-to-transport, consent, and location privacy rules.

Potential future events:

- Directions reminder for confirmed appointment.
- Ride handoff opened.
- Transport voucher available.
- Caregiver sharing updated.
- Transport request cancelled.
- Destination changed after booking reschedule.

Rules:

- Do not include live location in notification text.
- Do not send route or driver details before a real transport integration exists.
- Do not share medical context with transport providers.
- Transport notifications should not imply emergency care.
- Caregiver transport updates require explicit patient consent.
- Transport payment updates should use payment notification rules.

Transport notifications should remain optional and separate from healthcare booking status.

---

## Relationship to Provider Dashboards

Provider dashboard notifications should come only after authentication, provider ownership, roles, staff permissions, and dashboards exist.

Future provider dashboard alert areas:

- New appointment requests.
- Schedule change requests.
- Provider registration status.
- Listing corrections.
- Verification renewals.
- Doctor affiliation requests.
- Document access requests later.
- Payment or settlement updates later.
- Review response or dispute tasks later.

Rules:

- Dashboard alerts should be role-scoped.
- Facility owners and managers should not receive the same alerts by default.
- Doctor owners should receive doctor-specific workflow alerts.
- Admin/reviewer alerts should remain separate from provider alerts.
- Patient-sensitive content should be minimized.
- Provider alert access should be audited when it exposes patient workflow data.

Provider dashboard notifications should support work, not replace review governance.

---

## Relationship to Community and Social Channels

Community channels are public update channels, not patient-specific notification channels.

Existing community channel planning includes:

- Telegram
- LinkedIn
- Facebook
- Instagram
- TikTok
- Email updates
- WhatsApp

Rules:

- Community channels should not receive patient-specific updates.
- Email updates or newsletter-style messages require separate opt-in.
- WhatsApp and Telegram community presence does not equal consent for transactional messages.
- Social posts should use public-safe content only.
- Do not send booking, document, payment, patient identity, or transport updates through public community channels.
- Placeholder social links should remain unrelated to notification functionality until real integrations are approved.

---

## Future Supabase Table Mapping

This is planning only. No Supabase code, SQL, migrations, policies, database files, or integrations should be added yet.

Potential future tables:

| Area | Possible Table |
| --- | --- |
| Notification preferences | `notification_preferences` |
| Channel consent | `notification_consents` |
| Notification templates | `notification_templates` |
| Notification events | `notification_events` |
| Delivery attempts | `notification_deliveries` |
| Notification read state | `notification_reads` |
| Appointment reminders | `appointment_reminders` |
| Booking status events | `booking_status_events` |
| Document events | `document_notification_events` or `patient_document_events` |
| Payment events | `payment_notification_events` or `payment_status_events` |
| Provider preferences | `provider_notification_preferences` |
| Admin alerts | `admin_alerts` |
| Review queue alerts | `review_queue_notifications` |
| User profiles | `profiles`, `patient_profiles`, or provider profiles later |
| Provider ownership | `provider_ownerships` |
| Consent records | `patient_consents` |
| Audit history | `audit_logs` |

Future RLS direction:

- Anonymous public users should not read patient-specific notification data.
- Patients can read and manage their own preferences and notification history later.
- Providers can read provider workflow alerts only for owned or assigned providers.
- Provider staff access should be scoped by organization membership and role.
- Reviewers can read assigned internal alerts.
- Admins can manage operational notification templates and review alerts.
- Super Admins should access sensitive notification controls only for escalations.
- Delivery provider secrets should remain server-only.
- Audit logs should protect template changes, preference changes, consent changes, and sensitive delivery attempts.

Important separation:

- Notification events describe communication.
- Booking events describe scheduling.
- Payment events describe money movement.
- Document events describe private records.
- Audit logs describe access and decisions.

These should reference one another where needed but should not collapse into one table.

---

## Template Governance

Notification templates should be reviewed before use.

Template fields later may include:

| Field | Purpose |
| --- | --- |
| `template_key` | Stable internal identifier |
| `event_type` | Booking, payment, document, verification, correction |
| `channel` | In-app, email, SMS, WhatsApp, Telegram, push |
| `audience` | Patient, provider, admin, reviewer, support |
| `title` | Short notification heading |
| `body` | Privacy-safe message |
| `language` | Localization support later |
| `sensitivity_level` | Public-safe, private, high-sensitive |
| `review_status` | Draft, approved, retired |
| `created_by` | Actor |
| `approved_by` | Reviewer/admin later |

Rules:

- Sensitive templates should require review.
- Templates should avoid clinical details by default.
- Templates should have version history.
- Old templates should be retired, not silently overwritten.
- Template changes should be auditable.

---

## Delivery and Failure Handling

Delivery handling should be planned before integrations are added.

Future delivery statuses:

| Status | Meaning |
| --- | --- |
| `queued` | Notification waiting to send |
| `sent` | Sent to provider or channel |
| `delivered` | Delivery confirmed when available |
| `failed` | Delivery failed |
| `retrying` | Retry is scheduled |
| `cancelled` | Delivery no longer needed |
| `suppressed` | Preference, opt-out, rate limit, or policy blocked sending |
| `expired` | Message is no longer relevant |

Rules:

- Failed delivery should not leak data into logs.
- Retry logic should respect opt-out and current workflow status.
- Cancelled bookings should cancel future reminders.
- Expired offers should cancel related reminder messages.
- Sensitive messages should prefer secure in-app views over detailed external text.
- Support staff should see delivery troubleshooting details only when needed.

---

## MVP Recommendation

Do not add notification functionality to the current MVP.

Recommended MVP stance:

- No notification UI.
- No in-app notifications.
- No email sending.
- No SMS sending.
- No WhatsApp integration.
- No Telegram integration.
- No push notifications.
- No reminder scheduler.
- No notification preferences UI.
- No notification database tables.
- No delivery provider setup.

What can exist now:

- Planning documentation.
- Static public pages and seed data.
- Public correction, contact, feedback, and registration preview UI without real submission.

Recommended first future notification step:

After booking or provider review workflows exist, define notification event contracts, templates, consent categories, and preference storage before connecting any delivery provider.

---

## Risks

Key risks:

- Sending patient-specific notifications before consent exists.
- Leaking diagnosis, lab result, prescription, or appointment reason in message previews.
- Confusing appointment requests with confirmed bookings.
- Sending reminders after cancellation or rescheduling.
- Treating WhatsApp, Telegram, or community channels as consented patient channels.
- Sending document or lab result details over insecure channels.
- Giving providers access to patient notification preferences or history.
- Over-notifying patients and reducing trust.
- Using notification links that expose private records.
- Building notification integrations before backend, auth, and audit logs exist.
- Failing to distinguish emergency care from ordinary reminders.
- Letting marketing/community messages blur into transactional health messages.

Mitigations:

- Keep notifications out of MVP.
- Require explicit consent and opt-out controls.
- Use privacy-safe templates.
- Keep sensitive details behind secure views.
- Tie notifications to audited workflow events.
- Separate transactional and community messages.
- Add rate limits, quiet hours, and suppression rules.
- Scope provider and admin alerts by role.
- Add delivery integrations only in dedicated future tasks.

---

## Recommended Next Development Order

1. Keep DigitalDirectory-v2 frontend-only and discovery-first.
2. Continue improving public provider data, correction flows, feedback, and trust labels.
3. Finalize patient identity, consent, booking, document vault, payments, reviews, transport, and provider dashboard strategies.
4. Define notification event categories and sensitivity levels in planning.
5. Define privacy-safe template rules for patients, providers, and internal roles.
6. Define consent categories and opt-out rules.
7. Define patient and provider notification preference fields.
8. Plan Supabase tables and RLS policies for notifications only after backend scope is approved.
9. Add authentication only when patient-specific and provider-specific workflows justify it.
10. Add audit logging before sending patient-specific or provider-specific notifications.
11. Implement appointment request or provider review workflows before reminders.
12. Add an in-app notification center later, if accounts and dashboards exist.
13. Add email only after template governance and support processes exist.
14. Add SMS reminders only after explicit consent and timing rules exist.
15. Add WhatsApp, Telegram, or push notifications only after opt-in policy, provider contracts, and privacy review.
16. Add document, payment, transport, and review notifications only after those workflows are real.

---

## Summary

Notifications and reminders can eventually make DigitalDirectory-v2 more reliable, especially for appointments, booking changes, telemedicine, document vault activity, lab results, payments, provider registration, corrections, feedback, and admin review.

They should be introduced late and carefully. The platform must first establish real workflows, patient identity, provider ownership, consent, preferences, privacy-safe templates, delivery governance, audit logs, and support rules.

The recommended MVP is no notification UI, no notification functionality, no reminder scheduler, no email or SMS sending, no WhatsApp or Telegram integration, no push notifications, and no notification database tables.
