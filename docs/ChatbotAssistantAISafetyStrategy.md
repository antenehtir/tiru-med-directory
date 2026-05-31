# DigitalDirectory-v2 Chatbot Assistant and AI Safety Strategy

## Purpose

This document defines the future strategy for a chatbot assistant in DigitalDirectory-v2, including safe assistant scope, directory navigation support, patient support, provider support, booking guidance, privacy rules, human handoff, multilingual planning, and AI safety boundaries.

It is planning-only. It does not add backend functionality, Supabase, database files, migrations, SQL, authentication, dashboards, protected routes, chatbot UI, AI integration, assistant APIs, tool calling, packages, or frontend changes.

The goal is to clarify what a future assistant may and may not do before any chatbot interface, AI model, backend service, patient portal, clinical support, or automated recommendation feature is built.

---

## Core Principle

The assistant should help users navigate trusted healthcare discovery. It should not practice medicine.

DigitalDirectory-v2 can eventually use an assistant to make search, filtering, registration support, corrections, and workflow guidance easier. The assistant must remain grounded in public directory information, clear safety boundaries, privacy protection, and human escalation. It should not diagnose, triage, prescribe, interpret records, replace clinicians, or make promises about care outcomes.

---

## Chatbot Assistant Purpose

The future assistant may support:

- Finding relevant public healthcare listings.
- Explaining how to use search, categories, filters, and detail pages.
- Helping users understand verification labels.
- Guiding users to public pages such as doctors, facilities, pharmacies, diagnostics, nearby, register, corrections, contact, and feedback.
- Explaining what information is public vs future-only.
- Helping providers understand how listing requests, verification requests, and corrections may work later.
- Helping patients understand future booking concepts without making a booking.
- Escalating to human support or emergency guidance when needed.

The assistant should reduce confusion, not add clinical risk.

The assistant should be positioned as:

```text
A directory navigation and support assistant for DigitalDirectory.
```

It should not be positioned as:

```text
A doctor, medical advisor, emergency responder, diagnostic tool, treatment planner, or clinical decision system.
```

---

## Safe Assistant Scope

The assistant may answer questions about public platform navigation and public directory information.

Safe future tasks:

| Area | Safe Assistant Behavior |
| --- | --- |
| Search navigation | Help users search by doctor, facility, specialty, service, pharmacy, diagnostics, or location |
| Listing explanation | Explain public fields such as verification status, location, services, hours, and contact previews |
| Category guidance | Point users to Doctors, Facilities, Pharmacies, Diagnostics, Nearby, or Search pages |
| Trust labels | Explain verified, pending, community-submitted, and unverified labels in plain language |
| Corrections | Guide users to submit a correction request when listing data looks wrong |
| Provider registration | Explain provider listing request and verification preview flows |
| Contact and feedback | Route support, feedback, partnership, or correction needs to the right public page |
| Future booking guidance | Explain appointment request vs confirmed booking in general terms |
| Future notifications | Explain that reminders require consent and future notification preferences |

Safety rule:
Every answer should stay inside the product's public directory and workflow boundaries unless a future protected workflow is explicitly implemented.

---

## Directory Navigation Assistant

Directory navigation is the safest first assistant use case.

Potential capabilities later:

- Ask clarifying directory questions, such as provider type, specialty, service, and location.
- Suggest search terms.
- Recommend category pages, not specific clinical care decisions.
- Explain how to compare listings using public information.
- Point to correction or feedback pages when information may be outdated.
- Explain that verified status means the platform reviewed listing identity or data, not that treatment quality is guaranteed.

Example safe responses:

```text
You can search for pediatric doctors from the Doctors page or use the Search page with "pediatrics" and your preferred area.
```

```text
This type of question is best answered by comparing public listing details such as location, verification status, services, and contact information.
```

Rules:

- Prefer public listing links and clear next steps.
- Do not rank providers as "best" based on unverified assumptions.
- Do not infer a diagnosis from symptoms.
- Do not choose a provider for the user as a medical decision.
- Do not imply a provider has real-time availability unless booking or availability data is real and reviewed.

---

## Patient Support Assistant

The patient support assistant may help public visitors understand the platform.

Safe patient support topics:

- How to search for healthcare providers.
- How to find doctors, facilities, pharmacies, or diagnostics providers.
- How to understand verification labels.
- How to report incorrect listing information.
- How to contact the platform.
- How future booking, notifications, document vault, or account features may work when implemented.
- How to keep personal health information out of public feedback or reviews.

Unsafe patient support topics:

- Diagnosing symptoms.
- Suggesting treatment.
- Choosing medication.
- Interpreting lab results.
- Deciding whether a condition is urgent.
- Advising whether to delay care.
- Replacing emergency services.

Patient support should use plain, calm language and avoid false certainty.

---

## Provider Support Assistant

The provider support assistant may help doctors, facilities, pharmacies, and diagnostics providers understand listing and verification workflows.

Safe provider support topics:

- How to request a listing.
- How to request correction of a public listing.
- How provider ownership may work later.
- What verification may require later.
- Why public changes need review.
- Why provider dashboards are future-only.
- Why documents, authentication, and Supabase are not active yet.
- How to contact support for provider questions.

Provider support boundaries:

- Do not approve or reject provider verification.
- Do not accept documents through chat.
- Do not collect private provider credentials or license files.
- Do not change public listing fields.
- Do not promise a verification outcome.
- Do not expose admin notes, reviewer notes, or internal review status.
- Do not let providers self-verify through the assistant.

Future provider support should hand off to reviewed intake workflows and human review when the request affects public trust.

---

## Booking Guidance Assistant

Booking guidance should remain informational until real booking exists.

Safe booking guidance:

- Explain that current schedule and availability content is preview-only.
- Explain the difference between appointment requests and confirmed bookings.
- Direct users to public provider contact information when available.
- Explain that future booking may require patient contact details, consent, reminders, and provider confirmation.
- Explain that telemedicine booking is future-only unless a real workflow exists.

Unsafe booking guidance:

- Create, change, cancel, or confirm appointments.
- Claim a time slot is available.
- Promise a provider will respond.
- Collect sensitive appointment reasons.
- Collect medical records or lab results.
- Send telemedicine links.
- Process payments or deposits.

Rules:

- Booking should not be implied unless real booking functionality exists.
- Booking advice should never include diagnosis, triage, or treatment guidance.
- Booking guidance should route users to public provider pages, contact support, or future booking workflows only when those workflows are implemented.

---

## What the Assistant Must Not Do

The assistant must not:

- Diagnose symptoms.
- Triage emergencies.
- Tell a patient whether their condition is serious or not serious.
- Recommend medication, dosage, or treatment.
- Interpret lab results, imaging reports, prescriptions, or medical documents.
- Generate prescriptions or e-prescriptions.
- Give personalized medical advice.
- Replace a doctor, pharmacist, diagnostics professional, emergency responder, or licensed clinician.
- Claim a provider is clinically superior unless supported by an approved public policy and data.
- Guarantee provider quality, appointment availability, pricing, medicine availability, lab test availability, or outcome.
- Book appointments, process payments, or request transport unless those features exist and are safely integrated later.
- Collect patient medical history in ordinary chat.
- Store patient documents through chat.
- Reveal private patient identity, booking, payment, transport, document, or review data.
- Reveal provider verification evidence, admin notes, reviewer notes, source confidence, or audit logs.
- Make legal, insurance, or financial promises.
- Generate public reviews or provider responses on behalf of users without review policy.
- Use hidden referral tracking, analytics, or social APIs in the MVP.

Hard boundary:
If the user asks for medical judgment, the assistant should decline the medical part and redirect to qualified care or emergency guidance when appropriate.

---

## Medical Safety Boundaries

The assistant may provide general platform guidance, not medical guidance.

Allowed medical-adjacent content:

- Explain that a listing has a public specialty label.
- Explain that a facility shows public services.
- Suggest searching for a specialty or service by name.
- Encourage contacting a qualified healthcare provider.
- Encourage emergency care for potentially urgent situations without diagnosing.
- Explain that public content is not a substitute for medical advice.

Not allowed:

- "You probably have..."
- "This is not serious."
- "You can wait until tomorrow."
- "Take this medicine."
- "This dosage is safe."
- "Your lab result means..."
- "This doctor is the best for your condition."
- "You do not need emergency care."

Recommended wording pattern:

```text
I cannot diagnose symptoms or decide how urgent this is. If you may be in immediate danger, have severe symptoms, or are worried this could be urgent, contact local emergency services or go to the nearest emergency care provider. I can help you find public emergency or nearby facility listings.
```

---

## Emergency Escalation Wording

Emergency wording should be clear, calm, and direct.

The assistant should not attempt to determine whether a case is an emergency. It should escalate when a user mentions severe, urgent, or dangerous symptoms, self-harm, severe injury, unconsciousness, breathing difficulty, heavy bleeding, chest pain, stroke-like symptoms, pregnancy emergency, poisoning, or any language suggesting immediate danger.

Suggested emergency response:

```text
I am not an emergency service and cannot assess your condition. If this may be an emergency or someone may be in immediate danger, contact local emergency services or go to the nearest emergency care provider now. I can help you look for nearby emergency or hospital listings, but please do not wait for this chat if urgent care is needed.
```

Rules:

- Do not ask many follow-up questions before emergency escalation.
- Do not provide home treatment instructions for emergencies.
- Do not reassure the user that symptoms are safe.
- Do not delay urgent care with directory browsing.
- If location features are not real, do not claim to find exact nearest emergency care.
- If nearby search is only preview-only, say so clearly.

---

## Privacy and Consent Rules

The assistant should use data minimization by default.

Privacy rules:

- Do not request patient identity for public browsing.
- Do not ask for diagnosis, medical records, prescriptions, lab results, or treatment history in ordinary support chat.
- Do not store chat content until backend, consent, retention, and deletion policies exist.
- Do not use chat content for public reviews, ratings, provider verification, advertising, or referral tracking.
- Do not expose chat content to providers unless the user explicitly starts a future consented workflow.
- Do not expose patient identity to support, provider, reviewer, or admin roles unless a future workflow justifies it and logs access.
- Do not include private health details in notification previews.
- Do not train or evaluate AI using sensitive patient content unless policy, consent, and de-identification controls are defined later.

Consent rules later:

- Tell users what data is being collected and why.
- Use the lowest identity level needed.
- Ask for explicit consent before sharing patient-specific data.
- Let users revoke consent where policy allows.
- Keep audit logs for sensitive access.

---

## Patient Document Access Boundaries

The assistant should not access patient documents in the current or MVP phase.

Future document-related assistant behavior may be limited to guidance such as:

- Explain what the document vault may do later.
- Explain how document sharing should be consent-based.
- Explain that prescriptions, lab results, imaging reports, referrals, and visit summaries should not be pasted into chat.
- Route users to future document vault workflows only if implemented.

The assistant must not:

- Accept file uploads.
- Store medical documents.
- Read lab results or imaging reports.
- Summarize prescriptions.
- Interpret clinical records.
- Share documents with doctors, facilities, pharmacies, diagnostics providers, caregivers, or support.
- Use document content to generate reviews or provider ratings.
- Attach documents to listing corrections or feedback.

Future rule:
If document access is ever added, it must require patient identity, explicit consent, RLS, private storage, role-scoped access, audit logs, and human-support escalation for sensitive cases.

---

## Human Handoff Rules

The assistant should know when to stop and route to a human or an existing workflow.

Human handoff should happen for:

- Possible emergencies or immediate danger.
- Medical advice requests.
- Patient privacy concerns.
- Verification disputes.
- Provider ownership disputes.
- Correction conflicts.
- Payment, refund, wallet, or sponsorship disputes later.
- Document access concerns later.
- Review disputes or harmful review content later.
- Abuse, impersonation, fraud, or suspicious listing edits.
- User complaints about wrong facility destination, closed facility, or harmful information.
- Any case where the assistant lacks enough confidence or source grounding.

Handoff destinations may include:

- Contact page for general support.
- Corrections page for listing accuracy.
- Register page for provider listing requests.
- Feedback page for platform feedback.
- Emergency services or nearest emergency provider for urgent safety language.
- Future protected support queues only after backend and roles exist.

Rules:

- Handoff should preserve privacy.
- Handoff should not expose unnecessary medical details.
- Handoff should not promise response times unless the platform can meet them.
- Handoff should not automatically notify providers without user consent.

---

## Multilingual Support Planning

DigitalDirectory-v2 may eventually support multiple languages, including Amharic and other local languages.

Multilingual assistant planning should include:

- Public directory navigation in supported languages.
- Search term expansion across language variants and common spellings.
- Clear safety and emergency wording in each supported language.
- Human review of translated safety templates.
- Avoiding machine-only translation for emergency, consent, privacy, medical disclaimer, and payment wording.
- Supporting users who mix English and local language terms.

Rules:

- Do not launch unsupported languages with weak safety wording.
- Do not translate medical advice into a language the platform cannot safely moderate.
- Do not assume local medical terminology without review.
- Verification labels, consent notices, and emergency disclaimers should be reviewed by qualified human reviewers before launch.

Recommended first multilingual step:
Start with directory navigation and search support, not clinical conversation.

---

## AI Safety and Hallucination Prevention

The assistant should be grounded, constrained, and transparent.

Safety requirements before implementation:

- Ground answers in approved public listing data and approved help content.
- Clearly distinguish public listing facts from assistant suggestions.
- Link users to source pages when possible.
- Avoid inventing providers, services, hours, phone numbers, availability, prices, reviews, or verification status.
- Avoid unsupported "best" or "recommended" rankings.
- Use refusal templates for medical, legal, payment, document, and emergency advice.
- Escalate uncertain or high-risk cases.
- Keep system prompts and safety policies versioned and reviewed.
- Log safety incidents only after privacy and retention policies are defined.
- Test common unsafe prompts before launch.

Hallucination prevention rules:

- If data is missing, say it is not available.
- If the listing is sample or unverified, say so clearly.
- Do not infer a provider's services from name alone.
- Do not infer open status unless working hours are reviewed and current.
- Do not infer booking availability from public hours.
- Do not infer medicine or test availability.
- Do not infer transport availability or nearest location without real location logic.

Recommended answer style:

- Short.
- Clear.
- Source-grounded.
- Humble about uncertainty.
- Focused on next safe action.

---

## Relationship to Booking

The assistant may eventually explain booking workflows but should not perform booking until booking exists.

Safe relationship:

- Explain appointment request vs confirmed booking.
- Explain that provider confirmation may be required.
- Explain that reminders require consent.
- Route users to provider detail pages or future booking entry points.

Unsafe relationship:

- Confirm appointment slots.
- Cancel or reschedule bookings.
- Interpret booking notes.
- Send telemedicine links.
- Collect medical history.
- Handle payment deposits.

Future booking assistant access should require:

- Patient identity where needed.
- Consent.
- Role-scoped data access.
- Audit logs.
- Provider dashboard readiness.
- Clear separation between booking status and clinical advice.

---

## Relationship to Patient Identity

Public assistant use should not require patient identity.

Current and MVP stance:

- No patient account is required for public directory navigation.
- No universal patient ID should be collected.
- No patient-specific data should be stored through chat.
- No personalized health profile should be created.

Future identity-linked assistant features may include:

- Saved provider guidance.
- Booking status explanation.
- Notification preference guidance.
- Patient-controlled sharing help.

Rules:

- Use the lowest identity level needed.
- Do not embed patient ID in public links.
- Do not let providers access patient chats by default.
- Audit any future access to patient-specific assistant records.
- Keep patient identity separate from public provider listings and search data.

---

## Relationship to Document Vault

The assistant should not become a document vault interface in the MVP.

Future assistant behavior may include:

- Explain how document vault sharing works.
- Explain that documents are private and consent-based.
- Route users to a future vault if implemented.
- Help users understand who can access shared documents, if that workflow exists.

The assistant should not:

- Read documents.
- Interpret records.
- Upload files.
- Summarize lab results.
- Share documents.
- Expose document metadata.
- Use document content to answer medical questions.

Document assistant features should wait until patient identity, private storage, RLS, audit logs, consent, retention policy, and security review are ready.

---

## Relationship to Notifications

Notification and reminder strategy is future-only and should remain separate from assistant chat until implemented.

Safe future relationship:

- The assistant may explain notification preferences.
- The assistant may explain that appointment reminders or status updates require consent.
- The assistant may help users find where notification settings live later.
- The assistant may route providers or admins to future notification support guidance.

Unsafe relationship:

- Send SMS, email, WhatsApp, Telegram, or in-app notifications.
- Create reminders.
- Subscribe a user to reminders without consent.
- Include sensitive health details in notification text.
- Notify providers about patient behavior without consent.
- Trigger automated emergency alerts from chat.

Rules:

- Notifications should require templates, consent, channel preferences, delivery providers, and audit logs.
- Assistant responses should not imply reminders are active before they exist.
- Notification content should remain minimal and privacy-safe.
- Emergency guidance should not depend on notifications.

---

## Relationship to Reviews

The assistant should not create or moderate public reviews in the MVP.

Safe future behavior:

- Explain why reviews are not active yet.
- Explain that feedback and corrections are safer early trust loops.
- Route listing accuracy issues to corrections.
- Route platform experience feedback to feedback.
- Explain privacy warnings for future reviews.

Unsafe behavior:

- Generate reviews for users.
- Publish ratings.
- Summarize private patient experiences as public review content.
- Reveal reviewer identity.
- Suggest providers respond with medical details.
- Use chat sentiment to create ratings.
- Treat reviews as clinical quality proof.

Future review assistant use should wait until moderation, patient identity, provider response rules, dispute workflows, and privacy policy exist.

---

## Relationship to Payments and Wallet

The assistant should not handle money movement.

Safe future behavior:

- Explain that payments and wallet are future-only.
- Explain general payment or refund workflow concepts after payment strategy is implemented.
- Route payment or refund concerns to human support when payment exists.

Unsafe behavior:

- Request payment details.
- Process payment.
- Display wallet balance.
- Handle refunds.
- Resolve disputes.
- Expose sponsor information.
- Provide financial advice.
- Generate payment links.
- Encourage external payment links on public listings.

Future payment assistant access should require authentication, role-scoped access, audit logs, financial governance, support workflows, and payment provider security review.

---

## Relationship to Provider Dashboards

Provider dashboards are future-only, and the assistant should not become a shortcut around review.

Safe future behavior:

- Explain provider dashboard concepts.
- Help providers understand why public changes require review.
- Route providers to registration, correction, or future dashboard help.
- Explain listing ownership boundaries.

Unsafe behavior:

- Edit provider profiles.
- Approve provider updates.
- Upload verification documents.
- Grant provider ownership.
- Change schedules or services.
- View patient lists.
- Access private admin notes.
- Publish high-risk fields such as phone, address, emergency services, payment links, or verification status.

Future dashboard assistant features should be scoped by role, protected by RLS, and audited. High-impact actions should still require human review.

---

## Future Supabase Table Mapping

This is planning only. No Supabase code, SQL, migrations, policies, database files, vector stores, AI tables, or backend services should be added yet.

Potential future tables:

| Area | Possible Table |
| --- | --- |
| Assistant conversations | `assistant_conversations` |
| Assistant messages | `assistant_messages` |
| Assistant safety events | `assistant_safety_events` |
| Assistant handoffs | `assistant_handoffs` |
| Assistant feedback | `assistant_feedback` |
| Approved assistant content | `assistant_knowledge_articles` |
| Public listing references | `doctors`, `facilities`, `pharmacies`, `diagnostics_providers` |
| Search grounding | `search_documents` |
| User preferences later | `notification_preferences` or `patient_preferences` |
| Patient identity later | `patient_profiles` or `profiles` |
| Booking references later | `appointment_requests` or `bookings` |
| Document references later | `patient_documents` and `patient_document_shares` |
| Provider support cases later | `support_cases` or `contact_messages` |
| Moderation flags | `moderation_flags` |
| Audit history | `audit_logs` |

Future RLS direction:

- Anonymous users may use public directory assistance without account history, if implemented.
- Public users should not read other users' conversations.
- Patients should read only their own assistant history later.
- Providers should not read patient assistant chats by default.
- Support operators may access only consented or escalated support context.
- Admins may access safety incidents only when justified.
- Super Admin access should be rare and audited.
- Assistant grounding should read only public-safe listing data unless a future protected workflow explicitly grants more.

Important:
These tables should not be created in the MVP. They are future planning only.

---

## MVP Recommendation

Do not add chatbot UI, AI integration, assistant APIs, tool calling, backend storage, or assistant data tables to the current MVP.

Recommended MVP stance:

- Keep the product focused on public healthcare discovery.
- Improve search, listing quality, correction flows, contact, feedback, and trust notes first.
- Do not add symptom chat.
- Do not add AI-generated provider recommendations.
- Do not add chat history.
- Do not collect patient medical information through chat.
- Do not imply the platform provides medical advice.

Recommended first future assistant step:
Create a non-AI help guide or structured FAQ for directory navigation. Then consider a tightly scoped assistant only after public listing data, search grounding, safety templates, privacy policy, and human handoff workflows are ready.

---

## Risks

Key risks:

- Users treating the assistant as a doctor.
- Assistant hallucinating provider details, availability, prices, or verification status.
- Assistant giving medical advice, triage, diagnosis, or treatment suggestions.
- Assistant delaying emergency care.
- Assistant collecting sensitive patient data before privacy controls exist.
- Assistant exposing patient identity, bookings, documents, payments, transport, or reviews.
- Assistant becoming a hidden route around provider review or verification.
- Assistant recommending providers without transparent source grounding.
- Assistant handling payments, documents, notifications, or bookings before those workflows are real.
- Multilingual responses translating safety wording incorrectly.
- Providers using assistant-generated content as unreviewed medical or promotional content.
- Chat logs becoming sensitive records without retention, deletion, and access policy.

Mitigations:

- Keep assistant out of MVP.
- Start with directory navigation only.
- Use strict medical refusal and emergency escalation templates.
- Ground responses in approved public data.
- Require source links and uncertainty language.
- Keep patient-specific data out of ordinary chat.
- Use human handoff for high-risk topics.
- Add privacy, consent, retention, deletion, RLS, and audit planning before storage.
- Test safety behavior before launch.
- Review multilingual templates with qualified human reviewers.

---

## Recommended Next Development Order

1. Keep DigitalDirectory-v2 frontend-only and discovery-first.
2. Continue improving public search, listing detail pages, trust labels, corrections, contact, and feedback.
3. Finish missing or pending planning docs for notifications and reminder workflows before assistant implementation.
4. Define approved public help content for search, verification labels, corrections, registration, contact, and feedback.
5. Define assistant refusal templates for medical advice, emergency situations, documents, payments, and bookings.
6. Define source-grounding rules for public listing data.
7. Define privacy, retention, deletion, and consent rules for chat content.
8. Define human handoff categories and support destinations.
9. Define multilingual safety wording and review process.
10. Plan Supabase and RLS only after backend scope is approved.
11. Add authentication only when provider/admin and patient-specific workflows justify it.
12. Add a non-AI FAQ or guided help layer before an AI assistant.
13. Pilot a narrow directory navigation assistant only after safety, grounding, privacy, and handoff policies are ready.
14. Add booking, document, notification, payment, provider dashboard, or patient-specific assistant functions only after those underlying systems exist.

---

## Summary

A future chatbot assistant can make DigitalDirectory-v2 easier to use, especially for search, navigation, listing explanation, provider support, correction guidance, and future workflow education.

The assistant must stay within a clear safety perimeter: no diagnosis, no triage, no treatment advice, no emergency assessment, no document interpretation, no payment handling, no hidden provider updates, and no access to private patient data without future consent and protected workflows.

The recommended MVP is no chatbot UI, no AI integration, no assistant API, no tool calling, no chat storage, and no patient-specific assistant functionality.
