# DigitalDirectory-v2 Community and Support Groups Strategy

## Purpose

This document defines the future strategy for community and support group features in DigitalDirectory-v2.

It is planning-only. It does not add backend functionality, Supabase, database files, migrations, SQL, authentication, dashboards, protected routes, community UI, chat UI, forum UI, group functionality, moderation functionality, packages, or frontend changes.

The goal is to clarify how patient support groups, rare disease communities, caregiver and family support groups, doctor/professional case discussion groups, moderation, safety, privacy, and escalation workflows should work later if community features become part of the product.

---

## Core Principle

Community features should come after trusted discovery, patient identity, consent, moderation, safety policy, and governance are mature.

DigitalDirectory-v2 should first help people find reliable healthcare providers and understand public listing information. Community groups can be valuable later, but they introduce higher risks than static provider discovery because users may share health details, ask for medical advice, discuss sensitive conditions, or rely on peer support during urgent situations.

Public healthcare discovery should remain login-free. Community participation, if introduced later, should require appropriate identity, consent, group rules, moderation, and safety controls.

---

## Community Feature Purpose

Future community features may support people who need guidance, shared experience, and navigation help beyond provider listings.

Possible purposes:

- Help patients find emotional and practical support from people with similar experiences.
- Help caregivers and family members learn how to support loved ones.
- Help patients discover public resources, support organizations, and provider categories.
- Help rare disease or chronic condition communities find relevant facilities and specialists.
- Help doctors and verified professionals discuss general clinical cases safely later.
- Help the platform identify recurring listing gaps, access problems, and patient support needs.

Community features should not replace:

- Medical diagnosis
- Treatment recommendations
- Emergency care
- Professional consultation
- Verified provider information
- Admin review or verification workflows
- Patient document vault or private health records

---

## Patient and User Support Groups

Patient/user support groups may eventually provide a structured space for general support and navigation.

Examples:

- Chronic condition support
- Maternal health support
- Mental wellness support
- Diabetes lifestyle support
- Cancer care navigation support
- Rehabilitation and recovery support
- New patient orientation groups

Allowed future group goals:

- Share general lived experience.
- Share public healthcare navigation tips.
- Ask where to find provider categories.
- Discuss non-clinical preparation for appointments.
- Share public resources and official support links.
- Encourage corrections for inaccurate listings.

Boundaries:

- Groups should not diagnose symptoms.
- Groups should not prescribe treatment.
- Groups should not interpret lab results.
- Groups should not replace doctor consultation.
- Groups should not pressure patients into providers, payments, products, or treatments.
- Groups should not publish private medical records or patient documents.

Recommendation:
Patient support groups should start, if ever, with tightly moderated topic spaces and clear safety notices, not open free-for-all medical forums.

---

## Rare Disease Communities

Rare disease communities can be especially valuable, but they are also high-risk.

Potential benefits:

- Help patients find specialists, facilities, diagnostics services, and support organizations.
- Reduce isolation for patients and caregivers.
- Share practical navigation lessons.
- Identify gaps in public provider data.
- Support advocacy and awareness using public-safe information.

Risks:

- Misinformation spreads quickly when information is scarce.
- Patients may share highly identifiable details.
- Unverified treatments or miracle-cure claims may appear.
- Small communities can make anonymity difficult.
- Emotional vulnerability can increase abuse, scams, or coercion risk.

Rules:

- Rare disease communities should require stronger moderation than general groups.
- Public group descriptions should avoid exposing member identities.
- Medical claims should be reviewed or removed according to policy.
- Treatment discussion should be limited to general experience and should direct users to licensed professionals.
- Research, trial, medication, or supplement discussions should require careful disclaimers.
- Scam, donation, payment, or product promotion should be tightly restricted.

MVP direction:
Do not add rare disease communities until moderation, medical safety policy, identity controls, and escalation rules are ready.

---

## Caregiver and Family Support Groups

Caregiver and family support groups may help relatives and trusted helpers coordinate support.

Potential topics:

- Caring for elderly family members
- Supporting children and parents through appointments
- Understanding provider discovery
- Preparing for facility visits
- Navigating pharmacy pickup or diagnostics later
- Emotional support for caregivers
- Sharing public provider links with family members

Boundaries:

- Caregivers should not gain patient account access through group membership.
- Family members should not receive patient documents, booking details, or results through community groups.
- Sponsor or payment relationship should not imply access to private health information.
- Caregiver advice should remain general and supportive.
- Group content should not reveal a patient's private details without consent.

Rules:

- Patient-specific sharing belongs to consent-based patient workflows, not public or semi-public groups.
- Caregiver groups should include strong privacy reminders.
- Community moderators should remove content that exposes another person's diagnosis, result, prescription, location, or documents without consent.

---

## Doctor and Professional Case Discussion Groups

Doctor/professional case discussion groups are distinct from patient groups and should be treated as a separate future product area.

Possible purposes:

- Verified professionals discuss general clinical learning.
- Doctors ask peers about broad practice patterns.
- Professionals discuss de-identified case lessons.
- Providers share public policy, referral, or facility workflow questions.
- Professionals discuss platform listing accuracy and provider discovery.

High-risk areas:

- Patient privacy
- Medical liability
- Unverified professional identity
- Sharing identifiable case details
- Inappropriate advice outside jurisdiction or specialty
- Mixing patient and professional audiences

Rules:

- Professional groups should require verified doctor or professional identity.
- Patient users should not be inside professional-only case discussion spaces.
- Case details must be de-identified and minimized.
- Professional groups should not become treatment orders or official clinical consultation records.
- Emergency or urgent clinical decisions should not rely on group replies.
- Professional groups should have stricter moderation and audit expectations than general patient support groups.

MVP direction:
Do not add professional case discussion groups until professional verification, governance roles, moderation, audit logging, and legal policy are ready.

---

## Separation Between Patient Groups and Professional Groups

Patient groups and professional groups should be separated by purpose, membership, visibility, moderation, and data rules.

| Area | Patient/User Groups | Professional Groups |
| --- | --- | --- |
| Main purpose | Support, navigation, shared experience | Professional discussion and learning |
| Membership | Patients, caregivers, public users later | Verified doctors or professionals |
| Identity | Patient account or verified contact later | Verified professional identity |
| Medical advice | Not allowed | General professional discussion only |
| Case details | Avoid personal medical details | De-identified only |
| Visibility | Private or semi-private later | Professional-only |
| Moderation | Safety and privacy focused | Safety, privacy, professional standards |
| Data access | No document vault or booking access | No patient vault access by default |

Rules:

- Do not mix patient and professional audiences in case discussion threads.
- Do not let doctors use patient groups for diagnosis, advertising, or solicitation.
- Do not let patients enter professional groups as observers if case details are discussed.
- Do not let professional verification status create public medical authority inside patient support groups without policy.

---

## Group Membership Rules

Group membership should wait for authentication and account strategy.

Potential membership levels:

| Level | Description |
| --- | --- |
| Public reader | Can read approved public community resources later, not private groups |
| Patient member | Can join patient support groups after account and rules acceptance |
| Caregiver member | Can join caregiver spaces after account and rules acceptance |
| Verified doctor | Can join doctor/professional groups after verification |
| Verified professional | Can join professional groups when role is approved |
| Moderator | Can review and act on group content |
| Admin | Can manage escalations and high-risk cases |

Membership rules:

- Community participation should require accepting group rules.
- Sensitive groups may require additional consent or age/eligibility rules later.
- Professional group membership should require verification and role assignment.
- Banned or restricted users should not rejoin under alternate accounts.
- Users should be able to leave groups.
- Group membership should not expose patient ID publicly.
- Providers should not be able to see patient group membership by default.
- Group membership should not imply care relationship.

Future access control:

- Patient groups should be visible only according to privacy settings.
- Professional groups should be role-gated.
- Moderators should have scoped access.
- Admins should handle escalations, not ordinary conversation by default.

---

## Moderation and Safety Rules

Moderation must be planned before community features exist.

Core moderation goals:

- Prevent medical misinformation.
- Protect patient privacy.
- Remove abusive, exploitative, or harmful content.
- Stop scams, spam, and false cures.
- Route urgent safety concerns to escalation workflows.
- Protect providers from defamation while preserving legitimate feedback routes.
- Keep professional discussions de-identified and appropriate.

Content that should be removed or restricted:

- Diagnosis or treatment instructions presented as medical advice.
- Lab result interpretation by non-professionals.
- Prescription instructions or medication changes.
- Private patient records, screenshots, or documents.
- Identifying details about another person without consent.
- Harassment, threats, hate speech, or abusive language.
- Self-harm encouragement or unsafe crisis responses.
- Fraud, scams, payment solicitation, or miracle-cure claims.
- Provider impersonation.
- Professional case details that identify a patient.
- Promotion that bypasses provider verification or listing review.

Moderation levels:

| Level | Use |
| --- | --- |
| Automated flag later | Spam, abuse keywords, links, privacy terms |
| Community moderator | Low and normal-risk group rule enforcement |
| Content reviewer | Public wording and content safety |
| Reviewer/verifier | Professional identity and provider-related claims |
| Admin | High-risk trust, safety, privacy, or dispute cases |
| Super Admin | Severe privacy, abuse, role misuse, legal, or governance cases |

---

## Medical Advice Boundaries

Community groups should not provide medical advice.

Allowed:

- "Here is how I prepared for my appointment."
- "This public facility page may be useful."
- "Ask a licensed clinician about those symptoms."
- "Consider contacting a healthcare professional."
- "If this feels urgent, seek local emergency help."

Not allowed:

- "You definitely have this condition."
- "Stop taking your medication."
- "Take this dosage."
- "Your lab result means this diagnosis."
- "Skip the doctor and use this remedy."
- "This provider will cure you."

Rules:

- Group prompts and community guidelines should reinforce non-clinical support.
- Moderators should remove or label unsafe medical advice.
- Verified professionals still should avoid giving patient-specific treatment advice in community groups.
- Patient-specific guidance belongs in a real care relationship, not community threads.
- The chatbot, if used later around communities, must follow the same boundaries.

---

## Emergency and Self-Harm Escalation

Community features must include clear emergency and self-harm escalation planning before launch.

Emergency examples:

- Chest pain or stroke-like symptoms
- Severe bleeding or injury
- Difficulty breathing
- Pregnancy emergencies
- Severe allergic reaction
- Poisoning
- Threats of violence or self-harm
- Abuse or immediate safety danger

Rules:

- Community groups should not triage emergencies.
- Users expressing immediate danger should be directed to local emergency services or crisis resources where appropriate.
- Self-harm content should trigger a safety-oriented escalation path later.
- Moderators should have clear scripts and escalation rules.
- The platform should not promise real-time emergency monitoring unless it can actually provide it.
- Emergency language should be clear, calm, and approved.

Possible generic wording later:

```text
If this is a medical emergency or someone may be in immediate danger, contact local emergency services now.
```

Self-harm safety:

- Do not debate or shame the user.
- Encourage immediate local support.
- Escalate according to policy.
- Avoid community pile-ons.
- Hide harmful method details.
- Preserve audit records for moderator actions.

---

## Privacy and Confidentiality Rules

Community data can reveal sensitive health context even when users do not upload formal documents.

Privacy rules:

- Do not expose patient group membership publicly by default.
- Do not expose patient ID in group posts.
- Do not expose booking, wallet, document, or transport data in groups.
- Do not allow users to upload medical documents into community groups in early phases.
- Do not let providers browse patient group membership lists.
- Do not use group content as public review content.
- Do not use group content for provider verification.
- Do not include group content in public search indexes.
- Do not show enough metadata to identify users in small communities.
- Do not let professional groups include identifiable patient details.

Confidentiality reminders:

- Users should be warned not to post diagnosis details, lab results, prescriptions, patient identifiers, contact information, or images of medical records.
- Caregivers should be warned not to post another person's private health details without consent.
- Professionals should be warned not to post identifiable case details.

Data minimization principle:
If community support can work without storing sensitive health information, do not collect it.

---

## Doctor Verification Requirements

Doctor/professional participation should use verified roles later.

Potential verification requirements:

- Doctor profile exists and is reviewed.
- Professional account identity is verified.
- License or credential evidence is reviewed where appropriate.
- Facility affiliation is reviewed if used for professional status.
- Governance role assignment is approved.
- Professional community rules are accepted.

Rules:

- A public doctor card is not enough to join professional groups.
- A claimed profile does not equal professional verification.
- Verification should be separate from group membership approval.
- Doctor verification should be auditable.
- Suspended or disputed professional identities should lose professional group access.
- Professional replies in patient groups should have policy constraints and should not become direct care.

Professional label caution:
If professional labels are shown later, they should be factual and modest, such as "Verified doctor", not language that implies endorsement by the platform.

---

## Case Discussion Safety Rules

Professional case discussion can be valuable only with strong safety controls.

Rules:

- Cases must be de-identified.
- Do not include patient name, phone, address, ID, exact dates, photos, documents, or unique identifying details.
- Avoid rare combinations of details that identify a patient in small communities.
- Do not post lab reports, images, or prescriptions unless a future protected professional workflow explicitly permits it.
- Do not use case groups for urgent clinical decisions.
- Do not use case discussions as a substitute for referrals or formal consults.
- Do not expose case discussions to patients or public users.
- Moderators should remove identifiable or unsafe cases.
- Case discussions should be audited if professional groups are implemented.

Allowed direction:

- General educational discussion.
- Public guideline discussion.
- De-identified learning points.
- Referral pathway questions without patient identifiers.
- Platform provider discovery questions.

Disallowed direction:

- Real-time emergency decisions.
- Identifiable patient histories.
- Sharing patient documents.
- Prescribing across a group thread.
- Publicly criticizing identifiable patients or providers.

---

## Community Content Types

Future community content types should start narrow and expand only after moderation works.

Potential content types:

| Content Type | Use | Risk Level |
| --- | --- | --- |
| Group post | General support topic | Normal to high |
| Reply/comment | Conversation | Normal to high |
| Resource link | Public official resource | Normal |
| Public listing share | Public provider link | Normal |
| Poll/check-in | Lightweight support signal | Normal |
| Moderator announcement | Rules or safety update | Low |
| Professional case discussion | De-identified professional learning | High |
| Report/flag | Safety or policy concern | High |
| Group invitation | Membership growth | Normal |

Early restrictions:

- No document uploads.
- No private clinical attachments.
- No direct messaging.
- No open chat rooms.
- No public review imports.
- No payment requests.
- No external medical product promotion.

Recommended first content model later:
Start with moderated resource posts and public listing shares before open discussion threads.

---

## Report and Escalation Workflow

Reporting and escalation should be built before community posting is allowed.

Possible report reasons:

- Medical misinformation
- Unsafe medical advice
- Emergency or self-harm concern
- Privacy violation
- Harassment or abuse
- Scam, spam, or promotion
- Fake professional identity
- Identifiable patient case
- Defamation or provider attack
- Illegal or dangerous content
- Wrong group or off-topic content

Future report flow:

1. User reports content.
2. Report is stored privately.
3. Content may be hidden automatically if severity is high.
4. Moderator reviews according to policy.
5. Moderator decides no action, warning, edit request, hide, remove, restrict user, escalate, or archive.
6. Admin handles high-risk trust, privacy, professional identity, legal, or safety cases.
7. Super Admin handles severe governance, abuse, role misuse, or sensitive escalations.
8. Audit log records the decision and actor.

Decision types:

- No action
- Warning
- Needs edit
- Content hidden
- Content removed
- User restricted
- Group locked
- Escalated to Admin
- Escalated to Super Admin
- Referred to support workflow

Rules:

- Reporters should not see internal moderator notes.
- Reported users should receive only safe, policy-based notices.
- Appeals may be needed later.
- Emergency and self-harm reports need special handling.
- Professional identity reports should connect to governance and verification review.

---

## Relationship to Chatbot

The chatbot should not become an unmoderated community advisor.

Possible future relationship:

- Help users find relevant public groups.
- Explain group rules.
- Suggest public resources.
- Guide users to corrections, contact, or provider discovery.
- Help moderators draft safe reminders later.
- Route emergency or self-harm language to approved escalation wording.

Rules:

- The chatbot must not diagnose or give treatment advice in groups.
- The chatbot must not summarize private group health details for public display.
- The chatbot must not generate professional case advice.
- The chatbot must not access patient documents unless a future consented workflow allows it.
- The chatbot should not replace human moderation.
- AI-generated community guidance should be clearly bounded and reviewed where high-risk.
- Hallucination prevention is critical for community recommendations.

The chatbot strategy should govern any assistant behavior connected to groups.

---

## Relationship to Notifications

Community notifications should follow the notification and reminder strategy.

Potential future community notifications:

- Group join request approved.
- Moderator warning or decision.
- Report outcome available.
- Mention or reply, if enabled later.
- Professional group case discussion update.
- Group rule update.
- Safety announcement.

Rules:

- Community notifications should be opt-in where possible.
- Patient-sensitive group names should not appear in lock-screen style messages by default.
- Rare disease or sensitive condition group notifications should use neutral wording.
- Professional group notifications should not include case details.
- Report and moderation notifications should avoid exposing internal notes.
- Community notifications should be separate from appointment, document, payment, and provider workflow messages.

Privacy-safe wording:

```text
There is an update in one of your groups.
```

Avoid:

```text
New reply in your HIV support group about your lab result.
```

---

## Relationship to Patient Identity

Community participation should require more identity planning than public browsing.

Relationship rules:

- Public browsing remains login-free.
- Reading public resources may remain account-free later.
- Posting or joining groups should require an account.
- Sensitive groups may require verified contact or additional consent.
- Patient ID should not be shown publicly.
- Group membership should be private by default.
- User display names should support privacy.
- Users should be able to control profile visibility.
- Providers should not see patient group membership unless the patient explicitly shares it in another workflow.

Identity levels:

- Anonymous visitor: public discovery only.
- Basic account: possible public resource interactions later.
- Verified contact: group membership and posting later.
- Stronger identity: only if needed for sensitive or professional participation.
- Verified professional: professional groups only.

---

## Relationship to Document Vault

Community groups and document vault should remain separate.

Rules:

- Patient documents should not be posted in groups.
- Document vault files should not be attached to community posts.
- Document metadata should not appear in community content.
- Sharing a document with a provider should use consent records, not community threads.
- Lab results, prescriptions, referrals, imaging reports, and visit summaries should not be discussed with file attachments in groups.
- Professional case discussions should not import patient vault documents.
- Moderators should remove screenshots or copied text from private health documents according to policy.

If document sharing is needed, it belongs in patient-controlled secure workflows, not community groups.

---

## Relationship to Reviews and Ratings

Community content should not become public provider reviews automatically.

Rules:

- Community posts should not alter provider ratings.
- Group comments should not be copied into review pages.
- Provider complaints should route to feedback, correction, or review workflows.
- Defamation and privacy risks should be moderated.
- Providers should not solicit positive reviews inside groups.
- Patient reviews should stay governed by the patient reviews strategy.
- Structured feedback should remain safer than open public reviews in early phases.

Potential future bridge:
A community member may be guided to submit a correction, feedback item, or moderated review, but that should be a separate action with its own consent and policy.

---

## Relationship to Booking and Provider Discovery

Community groups may help people find provider categories, but they should not replace provider discovery or booking.

Allowed future support:

- Share public provider listing links.
- Suggest browsing doctors, facilities, pharmacies, diagnostics providers, or nearby pages.
- Encourage users to verify public listing details.
- Direct users to correction flows for inaccurate data.
- Share general appointment preparation tips.

Boundaries:

- Community recommendations should not imply platform endorsement.
- Group members should not promise appointment availability.
- Booking status, appointment notes, or care reasons should not be shared in groups.
- Provider discovery should rely on reviewed public listings, not group hearsay.
- Booking should remain a separate future workflow with consent and privacy controls.
- Emergency needs should be routed to emergency guidance, not ordinary provider discovery.

---

## Relationship to Community and Social Channels

Existing public community/social channel planning is separate from support groups.

Public channels may include:

- Telegram
- LinkedIn
- Facebook
- Instagram
- TikTok
- Email updates
- WhatsApp

Rules:

- Public social/community channels should not host patient-specific support groups unless moderation and privacy rules exist.
- Placeholder public channel links do not imply private group functionality.
- Social media posts should use public-safe content only.
- Patient support group content should not be reposted to public social channels.
- Community group membership should not be synced to public social channels.
- WhatsApp or Telegram groups should not be added as unofficial patient support groups without moderation and consent planning.

---

## Future Supabase Table Mapping

This is planning only. No Supabase code, SQL, migrations, policies, database files, or integrations should be added yet.

Potential future tables:

| Area | Possible Table |
| --- | --- |
| Groups | `community_groups` |
| Group categories | `community_group_categories` |
| Group membership | `community_group_memberships` |
| Group posts | `community_posts` |
| Group replies | `community_replies` |
| Professional groups | `professional_groups` |
| Professional membership | `professional_group_memberships` |
| Group rules | `community_group_rules` |
| Reports | `community_reports` |
| Moderation cases | `community_moderation_cases` |
| Moderator actions | `community_moderation_actions` |
| Content flags | `moderation_flags` |
| User restrictions | `community_user_restrictions` |
| Group notifications later | `notification_events` |
| Patient identity | `patient_profiles` or `profiles` |
| Professional verification | `doctor_profiles`, `verification_cases`, `provider_ownerships` |
| Public listing shares | `listing_share_events` later, if approved |
| Audit history | `audit_logs` |

Future RLS direction:

- Anonymous users can read only approved public-safe resources, if any.
- Patients can read groups they are permitted to join.
- Members can post only in groups they belong to.
- Users can manage their own posts within policy.
- Providers cannot read patient group membership by default.
- Verified professionals can access only approved professional groups.
- Moderators can read reports and content for assigned groups.
- Admins can manage escalations and high-risk cases.
- Super Admins handle severe privacy, abuse, role misuse, or governance cases.
- Public users cannot read private group membership, reports, moderation notes, audit logs, or professional-only discussions.

Important:
Community data should not be mixed with document vault, booking, payment, wallet, transport, or private provider verification data.

---

## Security and Privacy Considerations

Community features require strong security and privacy before implementation.

Security considerations:

- Authentication for posting and membership.
- Role-based access for professional groups.
- Rate limits and anti-spam controls.
- Report and moderation tooling.
- User restriction and ban enforcement.
- Audit logs for moderator and admin actions.
- Abuse detection for scams, impersonation, and harmful content.
- Protection against scraping private group membership.
- Protection against leaked patient identifiers.
- Secure handling of group notifications.

Privacy considerations:

- Private group membership by default.
- Pseudonymous display options.
- No document uploads in early group phases.
- No public search indexing of sensitive groups.
- No exposure of patient ID.
- No sharing of group content with providers without explicit policy.
- No use of community content for ads or targeting.
- No public analytics that reveal sensitive health interests.
- Strong deletion, archival, and retention planning.

Support considerations:

- Community reports may create support workload.
- Safety escalations need trained human review.
- Moderators need policy and tooling before launch.
- Small communities need extra privacy caution.

---

## MVP Recommendation

Do not add community/support group features to the current MVP.

Recommended MVP stance:

- No community UI.
- No chat UI.
- No forum UI.
- No group functionality.
- No group membership.
- No professional discussion groups.
- No moderation functionality.
- No community posting.
- No document sharing through groups.
- No patient support group notifications.
- No community database tables.

What can exist now:

- Public provider discovery.
- Static planning documentation.
- Public contact and feedback channels.
- Correction flows for listing accuracy.
- Public community/social links that remain placeholder or public-safe.

Recommended first future step:
If community becomes a priority later, start with a policy and moderation pilot, not open groups. The first implementation should likely be curated public resource collections or moderated Q&A guidelines before patient discussion groups.

---

## Risks

Key risks:

- Medical misinformation harming users.
- Users mistaking peer support for medical advice.
- Self-harm or emergency posts going unhandled.
- Patient privacy leaks through posts or group membership.
- Rare disease communities becoming identifiable.
- Doctors sharing identifiable case details.
- Fake professionals entering professional groups.
- Providers soliciting patients or reviews.
- Scams, miracle cures, or payment fraud.
- Harassment, stigma, or abusive behavior.
- Moderation workload exceeding platform capacity.
- Community content weakening trust in verified listings.
- Mixing group data with patient documents, bookings, wallet, or transport.
- Sending sensitive group notifications through unsafe channels.

Mitigations:

- Keep groups out of MVP.
- Define community rules before implementation.
- Require authentication for posting later.
- Require verified professional identity for professional groups.
- Separate patient and professional groups.
- Use privacy-safe defaults.
- Build reporting and moderation before posting.
- Add emergency and self-harm escalation policy.
- Keep document, booking, payment, and transport data out of groups.
- Start with curated resources before open discussion.

---

## Recommended Next Development Order

1. Keep DigitalDirectory-v2 frontend-only and discovery-first.
2. Continue improving public provider listings, corrections, contact, feedback, and trust labels.
3. Finalize patient identity, consent, notification, chatbot, document vault, reviews, and governance strategies.
4. Define community safety policy in plain language.
5. Define medical advice boundaries and emergency/self-harm escalation rules.
6. Define patient group and professional group separation.
7. Define professional verification requirements for doctor/professional groups.
8. Define moderation roles, report reasons, escalation levels, and audit needs.
9. Plan Supabase tables and RLS policies only after backend scope is approved.
10. Add authentication only when patient-specific or provider-specific workflows justify it.
11. Add moderation tooling before any group posting.
12. Pilot curated public health navigation resources before open group discussions.
13. Pilot patient support groups only after moderation, consent, privacy, and notification rules are ready.
14. Pilot professional case discussion groups only after doctor verification, de-identification policy, and audit rules are ready.
15. Add chatbot assistance to groups only after human moderation and AI safety controls exist.
16. Add group notifications only after consent, preference, and privacy-safe template rules exist.

---

## Summary

Community and support groups could eventually help patients, caregivers, rare disease communities, and verified professionals support each other and navigate care.

They should be introduced late and carefully. The platform must first establish identity, consent, moderation, privacy, medical safety boundaries, emergency and self-harm escalation, professional verification, notification rules, chatbot safety, audit logs, and governance.

The recommended MVP is no community UI, no chat UI, no forum UI, no group functionality, no moderation tooling, no professional discussion groups, and no community database tables.
