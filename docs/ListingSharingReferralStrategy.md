# DigitalDirectory-v2 Listing Sharing and Referral Strategy

## Purpose

This document defines the future strategy for privacy-safe listing sharing, public profile links, caregiver and family sharing, WhatsApp and Telegram sharing, native mobile sharing, referral tracking concepts, and growth workflows for DigitalDirectory-v2.

It is planning-only. It does not add backend functionality, Supabase, database files, migrations, SQL, authentication, dashboards, protected routes, share buttons, referral tracking, analytics, social APIs, packages, or frontend changes.

The goal is to clarify how public healthcare listings may be shared later without exposing patient identity, bookings, document vault data, payments, reviews, transport details, internal review records, or private provider data.

---

## Core Principle

Listing sharing should start from public, patient-safe information only.

DigitalDirectory-v2 should let people help each other find care, but sharing should not become a tracking layer, referral growth system, patient data leak, or implied endorsement. Public browsing should remain login-free, and future sharing features should be optional, user-initiated, and limited to information that is already safe to display publicly.

---

## Listing Sharing Concept

Future listing sharing may let a user send a public provider profile to another person.

Examples:

- Share a doctor profile with a family member.
- Share a facility detail page with a caregiver.
- Share a pharmacy page with someone looking for prescription pickup.
- Share a diagnostics provider page with someone comparing lab or imaging options.
- Share a public search or nearby context later, if it contains no private location data.

Recommended first concept:
Share a public listing URL and short public-safe summary. Do not include hidden patient context, referral identifiers, tracking parameters, booking notes, private contact details, or internal trust data.

Public sharing should help users answer:

- What is the provider called?
- What type of provider is it?
- Where is it generally located?
- What public services or specialties are shown?
- Is the listing verified, pending, or community-submitted?
- What public page can the recipient open?

---

## Public Information Sharing Boundaries

Only public-safe fields should appear in shared listing text, previews, metadata, or messages.

Allowed public-safe fields may include:

| Field | Sharing Use |
| --- | --- |
| Provider name | Identifies the listing |
| Provider type | Doctor, facility, pharmacy, diagnostics provider |
| Public location | Area, city, address summary, or reviewed destination text |
| Public specialties or services | Helps recipient understand relevance |
| Public verification status | Shows trust state without exposing evidence |
| Public detail URL | Lets recipient view the source page |
| Public hours or availability summary | Only if already reviewed and public |

Do not include:

- Patient name, phone, email, account ID, or patient ID
- Appointment requests, booking status, or booking notes
- Search history or saved provider state
- Live location, origin point, route, or transport status
- Document vault files, document metadata, prescriptions, lab results, or referrals
- Wallet balance, payment status, sponsor details, or transaction information
- Review author identity or unpublished review content
- Private provider contacts, verification evidence, admin notes, reviewer notes, source confidence, or audit logs
- Referral tracking identifiers in the MVP

Rule:
If a field would not be safe on a public provider detail page, it should not be included in a shared listing.

---

## Doctor Profile Sharing

Doctor profile sharing may help patients ask family members or caregivers to review a doctor option.

Public-safe doctor share fields may include:

- Doctor name
- Specialty
- Public facility affiliation, if reviewed
- General location
- Verification status
- Public doctor profile URL
- Public availability summary, if preview-only and clearly labeled

Doctor sharing should not include:

- Appointment reason
- Patient symptoms
- Booking time or status
- Telemedicine session details
- Private doctor contact channels
- Verification documents
- Patient reviews that are unpublished, disputed, or private

Rules:

- Sharing a doctor profile should not imply booking is available.
- Sharing a doctor profile should not imply clinical recommendation by the platform.
- Facility affiliation should be shown only when it is already safe for public display.
- Telemedicine availability should remain preview-only unless a future real workflow exists.

---

## Facility Profile Sharing

Facility profile sharing may help users coordinate where to go for care.

Public-safe facility share fields may include:

- Facility name
- Facility type
- Public address or area
- Public services
- Public working hours, if reviewed
- Verification status
- Public facility profile URL

Facility sharing should not include:

- Internal destination confidence
- Unreviewed coordinates
- Provider ownership status
- Verification document details
- Admin or reviewer notes
- Patient booking or transport context

Rules:

- Facility destination data should be reviewed before it is used in any future directions or ride handoff sharing.
- Emergency, 24-hour, or high-impact service claims should be shared only if they are already public and reviewed.
- Duplicate or moved facility concerns should route to corrections and admin review, not spread through share templates.

---

## Pharmacy and Diagnostics Sharing

Pharmacy and diagnostics sharing should remain especially careful because these provider types may later connect to prescriptions, tests, results, pricing, pickup, delivery, or payment.

Public-safe pharmacy share fields may include:

- Pharmacy name
- General location
- Public service categories
- Pickup or delivery preview status only if public and clearly non-transactional
- Verification status
- Public pharmacy page URL

Public-safe diagnostics share fields may include:

- Diagnostics provider name
- General location
- Public lab or imaging service categories
- Verification status
- Public diagnostics page URL

Do not include:

- Prescription details
- Medicine names or inventory assumptions
- Lab tests requested by a patient
- Lab results
- Imaging reports
- Prices, payment status, invoices, or wallet data
- Delivery address or patient contact details

Rules:

- Static sharing should not imply medicine inventory or test availability.
- Payment or pickup workflows should remain separate from public listing sharing.
- Any future prescription or result sharing belongs to the patient document vault and consent model, not listing sharing.

---

## Copy Link Workflow

Copy link should be the simplest future sharing workflow.

Possible future behavior:

1. User opens a public provider detail page.
2. User chooses copy link.
3. The app copies the canonical public URL.
4. The user sends the link through their own chosen channel.
5. Recipient opens the public page without needing an account.

Recommended rules:

- Copy only canonical public URLs.
- Do not add referral codes or tracking parameters in the MVP.
- Do not copy patient-specific state.
- Do not copy search filters that reveal private intent unless the user explicitly chooses to share a search later.
- Do not require login to open the copied listing.
- Make copied links stable by using reviewed slugs where possible.

Potential public URL examples:

- `/doctors/dr-hana-bekele`
- `/facilities/addis-health-center`
- `/pharmacies`
- `/diagnostics`

Fallback:
If a listing does not have a stable detail page yet, share the safest public category page or search page later, not a broken or private route.

---

## WhatsApp and Telegram Sharing

WhatsApp and Telegram sharing may be useful because families and local communities often coordinate care through messaging apps.

Recommended future approach:

- Use user-initiated share links or message templates only.
- Include only a short public-safe summary and the public listing URL.
- Keep all links optional.
- Do not call WhatsApp or Telegram APIs in early phases.
- Do not send messages automatically.
- Do not store recipient phone numbers or chat identifiers.
- Do not track whether a recipient opened a message in the MVP.

Example public-safe message pattern:

```text
I found this healthcare listing on DigitalDirectory:
Addis Health Center
Facility in Addis Ababa
View details: https://example.com/facilities/addis-health-center
```

Do not include:

- "I booked an appointment"
- "This is for my test result"
- "Here is my prescription"
- "Use my referral code"
- Patient medical context

Rules:

- WhatsApp and Telegram sharing should be treated as convenience handoffs.
- The receiving app controls delivery, contacts, and message privacy after handoff.
- The platform should avoid sensitive defaults in message text.

---

## Native Mobile Share Later

Native mobile sharing may be useful later through browser or device share capabilities.

Possible future behavior:

- On supported devices, use native share for public listing URLs.
- On unsupported devices, fall back to copy link.
- Share title, public-safe text, and canonical URL only.

Rules:

- Native share should remain optional.
- Do not include patient-specific payloads.
- Do not include referral tracking by default.
- Do not depend on native share for core access.
- Do not request permissions unrelated to sharing.
- Do not store share recipients.

Native mobile share should be a convenience layer, not an account, tracking, or messaging system.

---

## Caregiver and Family Sharing

Caregiver and family sharing can be valuable, but it has two very different levels.

### Public Listing Sharing

Public listing sharing can remain simple and account-free.

Examples:

- A patient sends a facility profile to a family member.
- A caregiver sends a doctor profile to someone seeking care.
- A family member sends a pharmacy page to another person.

This can use public links only and does not need patient identity.

### Patient-Specific Sharing Later

Patient-specific sharing should wait for patient identity, consent, and audit logs.

Examples:

- Share appointment time with a caregiver.
- Share transport destination or trip status.
- Share a lab result document.
- Share intake details with a facility.
- Share payment sponsorship status.

Rules:

- Patient-specific sharing must be consent-based.
- Default sharing should be off.
- Patient-specific sharing should clearly show what is being shared and with whom.
- Sponsor or caregiver access should not automatically reveal medical records or visit reasons.
- Patient-specific sharing should be revocable where possible and audited.

Task 40 should plan both concepts but implement neither.

---

## Referral Tracking Later

Referral tracking should not be part of the MVP.

Potential future referral concepts:

- Track that a listing was shared from a public page.
- Let providers understand broad source attribution without patient identity.
- Support community outreach campaigns.
- Support caregiver invitation flows later.
- Support provider onboarding referrals later.

Referral tracking risks:

- Sensitive health inference from shared provider type
- Patient identity leakage
- Unwanted tracking of family or caregiver behavior
- Confusion between public sharing and paid/referral promotion
- Providers pressuring patients for shares
- Analytics collected before consent and policy are ready

Recommended later rules:

- Separate ordinary sharing from referral programs.
- Use referral tracking only after consent, privacy, abuse prevention, and policy are defined.
- Avoid tracking recipient identity by default.
- Avoid referral codes on sensitive healthcare pages until risk is reviewed.
- Do not expose referral activity to providers in a way that identifies patients.
- Audit referral program changes if tied to provider incentives.

MVP recommendation:
No referral codes, no referral tracking, no analytics, no campaign identifiers, and no provider-facing referral dashboards.

---

## Privacy Rules

Privacy rules for listing sharing:

- Share only public listing data.
- Never share private patient data through listing sharing.
- Never share document vault files or metadata through listing sharing.
- Never share booking, transport, wallet, or payment details through listing sharing.
- Never expose internal admin review data, source confidence, verification evidence, or audit logs.
- Keep caregiver and family sharing patient-controlled when patient-specific data is involved.
- Avoid tracking parameters in MVP listing links.
- Do not imply that sharing equals medical recommendation.
- Do not let shared messages reveal a sensitive health condition by default.
- Keep public browsing and opening shared links login-free.

Data minimization rule:
If a share works with just a public URL, do not add more data.

---

## Relationship to Booking

Listing sharing and booking should remain separate.

Public listing sharing may help someone choose where to request care later, but it should not include booking state.

Rules:

- A shared listing URL should not reveal whether the sender booked, cancelled, rescheduled, or completed an appointment.
- A shared doctor profile should not imply available appointment slots.
- Appointment sharing, if ever added, should use patient identity, consent, and booking-specific permissions.
- Booking notes should never be copied into listing share text.
- Verified visit review eligibility should not be exposed through share links.

Future booking-specific sharing may include appointment details for caregivers, but that belongs to booking and consent workflows, not basic listing sharing.

---

## Relationship to Patient Identity

Public listing sharing should not require patient identity.

Rules:

- Anonymous visitors should be able to copy or share public listing links later.
- Patient ID should not be embedded in public listing URLs.
- Shared public links should not expose saved provider status or account state.
- Patient accounts may be needed only for patient-specific sharing, such as bookings, documents, transport, or caregiver grants.
- Any identity-linked share should be consented, scoped, expiring where appropriate, and audited.

Patient identity should remain a private layer, not a public referral identity.

---

## Relationship to Document Vault Sharing

Listing sharing and document vault sharing must remain separate.

Listing sharing:

- Public provider information
- Public URLs
- No account required to view
- No medical documents

Document vault sharing:

- Private patient documents
- Patient-controlled consent
- Provider or caregiver access boundaries
- Audit logs
- Private storage later

Rules:

- Do not attach prescriptions, lab results, imaging reports, referrals, visit summaries, or receipts to listing shares.
- Do not use listing sharing links to grant document access.
- Do not show document status on public listing cards or detail pages.
- Document sharing should use dedicated consent records and protected access later.

---

## Relationship to Community and Social Channels

Community and social channels can support discovery, updates, and trust-building, but they should not receive private healthcare data.

Existing community channel planning includes:

- Telegram
- LinkedIn
- Facebook
- Instagram
- TikTok
- Email updates
- WhatsApp

Future relationship to listing sharing:

- Community posts may point to public category pages or public provider pages.
- Official community updates should use public-safe copy.
- Social content should not imply unverified listings are verified.
- Social posts should not include patient stories without explicit consent and policy.
- Community channels should not receive hidden referral or patient tracking identifiers in the MVP.
- Social APIs, analytics, pixels, and automated posting should remain out of scope until a dedicated strategy exists.

Rules:

- Keep social sharing user-initiated in early phases.
- Use placeholder links until official channels exist.
- Avoid publishing health-sensitive user behavior to social platforms.

---

## Relationship to Reviews and Ratings

Listing sharing should not become review sharing by default.

Rules:

- Do not share unpublished, disputed, hidden, or rejected reviews.
- Do not include patient reviewer identity in shared listing text.
- Do not imply ratings are clinical verification.
- If review summaries exist later, share only approved public summaries.
- Do not use share counts as a substitute for provider quality.
- Do not reward providers for patient shares until abuse and privacy rules exist.

Future review sharing should wait until patient reviews, moderation, provider response rules, and privacy policy are implemented.

---

## Relationship to Transport

Listing sharing and transport should remain separate.

Public listing sharing may include a public facility URL or address summary. It should not include live location, route, ride status, or transport payment data.

Rules:

- Do not share patient origin location through listing links.
- Do not share route or trip status without explicit future consent.
- Do not pass medical context to ride-hailing apps.
- Do not treat shared facility links as emergency transport guidance.
- Transport-specific caregiver sharing should wait for patient identity, consent, and transport planning.

Facility destination accuracy should be reviewed before any future directions or ride-hailing handoff uses listing data.

---

## Future Supabase Table Mapping

This is planning only. No Supabase code, SQL, migrations, policies, database files, analytics, referral tracking, or backend tables should be added yet.

Potential future tables:

| Area | Possible Table |
| --- | --- |
| Public listings | `doctors`, `facilities`, `pharmacies`, `diagnostics_providers` |
| Canonical routes | `listing_routes` or provider slug fields |
| Share templates | `listing_share_templates` |
| User-initiated share events later | `listing_share_events` |
| Referral links later | `referral_links` |
| Referral events later | `referral_events` |
| Caregiver sharing grants later | `caregiver_share_grants` |
| Patient identity | `patient_profiles` or `patient_identities` |
| Consent records | `patient_consents` |
| Booking-specific sharing later | `booking_share_grants` |
| Document sharing | `patient_document_shares` |
| Transport sharing | `transport_sharing_grants` |
| Community channels | `community_channels` |
| Abuse or moderation flags | `moderation_flags` |
| Audit history | `audit_logs` |

Future RLS direction:

- Anonymous public users can read published public-safe listing data.
- Anonymous public users should not read share events, referral events, patient identity, booking, document, wallet, or transport data.
- Patients can manage their own patient-specific sharing grants later.
- Caregivers can read only explicitly shared patient-specific data.
- Providers should not see patient-level sharing activity by default.
- Admins and support operators should access share-related cases only when needed for abuse, privacy, or support.
- Super Admin access should be rare and audited for sensitive referral, privacy, or abuse cases.

Important:
The MVP should not create these tables. This mapping is for later backend planning only.

---

## MVP Recommendation

Do not add share buttons, referral tracking, social APIs, analytics, native share, caregiver sharing, or patient-specific share workflows to the current MVP.

Recommended MVP stance:

- Keep public listing routes readable and stable.
- Keep public discovery login-free.
- Let users manually copy browser URLs if they choose.
- Do not generate referral links.
- Do not track shares.
- Do not include social sharing widgets.
- Do not collect recipient data.
- Do not imply booking, payment, document, transport, or review sharing exists.

Recommended first future step:
After public detail routes and listing data are stable, add a simple copy-link interaction for public listing pages only. Add no tracking or referral logic at first.

---

## Risks

Key risks:

- Sharing private patient data by accident.
- Adding referral tracking before privacy policy and consent are ready.
- Letting referral links reveal sensitive health interests.
- Mixing public listing sharing with booking, document, wallet, transport, or review data.
- Treating share counts as quality or verification signals.
- Letting providers pressure patients or families to share listings.
- Passing medical context into WhatsApp, Telegram, ride apps, or social platforms.
- Sharing inaccurate facility destinations.
- Creating broken links before stable routes exist.
- Using social APIs or analytics before governance and privacy review.
- Making shared links require login and weakening public discovery.

Mitigations:

- Start with public URLs only.
- Use canonical routes and public-safe fields.
- Keep tracking out of MVP.
- Separate listing sharing from patient-specific sharing.
- Add consent and audit logs before sharing bookings, documents, transport, or caregiver data.
- Review facility destination data before directions or ride handoffs.
- Keep community/social channels public-safe and placeholder-only until official integrations are approved.

---

## Recommended Next Development Order

1. Keep DigitalDirectory-v2 frontend-only and discovery-first.
2. Continue improving public listing detail pages and stable public routes.
3. Define public-safe share field contracts for doctors, facilities, pharmacies, and diagnostics providers.
4. Keep manual browser URL copying as the only current sharing behavior.
5. Add a future copy-link UI only after listing routes are stable, if approved in a dedicated UI task.
6. Add WhatsApp or Telegram user-initiated share templates only after copy-link behavior is safe.
7. Add native mobile share only as a progressive enhancement with copy-link fallback.
8. Keep referral tracking out until privacy, abuse prevention, consent, and governance rules are defined.
9. Add patient identity only when patient-specific workflows justify it.
10. Add caregiver/family sharing only after patient identity, consent records, and audit logs exist.
11. Keep document sharing inside the document vault strategy, not listing sharing.
12. Keep booking sharing inside booking and consent workflows.
13. Keep transport sharing inside transport and location consent workflows.
14. Consider referral programs only after backend, RLS, admin review, moderation, and privacy governance are mature.

---

## Summary

Listing sharing can help families, caregivers, and communities discover healthcare options, but it should remain public-safe and simple.

The safest path is to begin later with canonical public links, then optional copy-link, WhatsApp, Telegram, and native share support without referral tracking. Patient-specific sharing for bookings, documents, transport, wallet, or caregiver workflows should wait for patient identity, consent, backend access controls, and audit logs.

The recommended MVP is no share buttons, no referral tracking, no analytics, no social APIs, and no patient-specific sharing functionality.
