# DigitalDirectory-v2 Patient Document Vault and Records Sharing Strategy

## Purpose

This document defines the future strategy for patient document storage, records sharing, upload permissions, consent-based access, patient ID and booking ID linkage, provider upload workflows, document organization, and Supabase Storage planning for DigitalDirectory-v2.

It is planning-only. It does not add backend functionality, Supabase, Supabase Storage, database files, migrations, SQL, authentication, dashboards, protected routes, patient portal UI, document upload UI, document storage functionality, file upload functionality, packages, or frontend changes.

The goal is to clarify document vault and records sharing strategy before any patient portal, provider upload, document storage, clinical record sharing, or file access workflow is built.

---

## Core Principle

Patient documents are more sensitive than public healthcare discovery data.

DigitalDirectory-v2 should not store patient medical documents until patient identity, consent, backend security, storage policies, audit logs, provider access boundaries, and support workflows are mature enough to protect them.

Public healthcare discovery should remain login-free and document-free. A patient should be able to search, browse, view providers, and use public correction or feedback loops without creating a document vault.

---

## Patient Document Vault Concept

A patient document vault may eventually let a patient store, organize, and selectively share healthcare-related documents.

Possible future uses:

- Store lab results, prescriptions, imaging reports, referral notes, or visit documents.
- Link documents to bookings, telemedicine sessions, pharmacy pickup, or diagnostics requests.
- Share selected documents with a doctor, facility, pharmacy, or diagnostics provider.
- Receive documents from approved providers.
- Keep a private timeline of documents and sharing history.
- Support future patient-controlled continuity of care.

Important boundaries:

- The vault should be patient-controlled.
- Documents should be private by default.
- Providers should not browse patient vaults.
- Public users should never access patient documents.
- Document sharing should be consent-based, scoped, revocable where possible, and audited.
- The vault should not become a full electronic medical record system in early phases.

Recommended framing:
Treat the vault as a future patient-controlled document and sharing layer, not as an MVP feature.

---

## Supported Document Types

Future document support should start narrow and expand carefully.

Potential document categories:

| Document Type | Examples | Notes |
| --- | --- | --- |
| Prescription | Medication prescription, refill note | High privacy and pharmacy workflow sensitivity |
| Lab result | Blood test, urine test, screening result | Should be protected from public/review surfaces |
| Imaging report | X-ray report, ultrasound report, CT/MRI report text | Images may require larger storage and stricter handling |
| Referral note | Doctor referral to specialist or facility | Should be shared only with consent |
| Visit summary | Consultation summary, discharge note | Should not be public or used in reviews |
| Vaccination record | Immunization proof or history | May need verification rules later |
| Insurance or membership document | Future coverage/program evidence | Financial and identity sensitivity |
| Payment or receipt document | Healthcare receipt, invoice, refund note | Should stay separate from clinical records |
| Identity document | Future strong identity proof | Avoid unless absolutely necessary |
| Consent document | Signed or confirmed consent record | Internal/private and auditable |

Early exclusions:

- Full medical records
- Large imaging files
- National ID images
- Sensitive legal documents
- Unstructured document dumps
- Documents uploaded "just in case"

The first future phase should support only the minimum document types needed for a real workflow.

---

## Patient ID and Booking ID Linkage

Document records may need to link to patient identity and booking workflows later.

Possible links:

| Link | Purpose |
| --- | --- |
| `patient_id` | Identifies the owning patient account |
| `booking_id` | Links document to appointment request or confirmed booking |
| `provider_id` | Links document to facility, doctor, pharmacy, or diagnostics provider context |
| `telemedicine_session_id` | Links document to remote consultation later |
| `diagnostics_request_id` | Links lab or imaging output to diagnostics workflow later |
| `pharmacy_request_id` | Links prescription or pickup document later |
| `payment_transaction_id` | Links receipt or invoice, not clinical content |
| `consent_id` | Links document sharing to explicit consent record |

Rules:

- Patient documents should always have a clear owner.
- Booking linkage should not expose appointment reason publicly.
- Payment linkage should not expose clinical content.
- Documents can exist without a booking if patient uploads them later.
- Provider-uploaded documents should link to the workflow that justified upload.
- Document access should be determined by consent and role, not by the mere existence of a booking.

---

## Upload Permissions

Upload permissions should be conservative.

Potential future upload actors:

| Actor | Upload Scope |
| --- | --- |
| Patient | Own documents only |
| Doctor | Documents for a patient interaction they are authorized to handle |
| Facility staff | Documents tied to facility booking, visit, or intake workflow |
| Pharmacy staff | Prescription or pickup-related documents only when pharmacy workflow exists |
| Diagnostics provider | Lab or imaging reports tied to diagnostics request |
| Support operator | Usually no clinical upload access; limited support attachment handling if needed |
| Admin | Exceptional support or compliance cases only, with audit |
| Super Admin | Rare emergency governance access only |

Rules:

- Anonymous public users should not upload medical documents.
- Providers should not upload documents into arbitrary patient vaults.
- Provider uploads should require an active workflow and patient linkage.
- Uploads should be scanned and validated in future implementation.
- Uploading a document should not automatically grant broad access to others.
- Upload events should be audited.

---

## View, Share, and Download Permissions

Document access should be role-scoped and consent-based.

Recommended permission model:

| Capability | Patient | Provider | Support | Admin | Public |
| --- | --- | --- | --- | --- | --- |
| View own documents | Yes | No | No | Limited exceptional | No |
| Upload own documents | Yes later | No | No | No routine use | No |
| Share document | Yes | No, except request access later | No | No routine use | No |
| Download own documents | Yes | No | No | Limited exceptional | No |
| View shared document | N/A | Only scoped and consented | Limited support context | Limited audited access | No |
| Revoke sharing | Yes, when policy allows | No | No | Assist only | No |
| Delete/archive own document | Yes, subject to retention policy | No | No | Assist only | No |

Rules:

- Patient documents are private by default.
- Providers can view only documents explicitly shared for their workflow.
- Download should be more restricted than view where possible.
- Providers should not retain documents outside platform policy.
- Public pages, reviews, search, and provider cards must never expose document data.
- Every view, share, download, revoke, and delete/archive action should be auditable.

---

## Consent Model

Document sharing should use explicit, scoped consent.

Consent attributes:

| Field | Purpose |
| --- | --- |
| `patient_id` | Patient granting access |
| `document_id` | Shared document or document group |
| `recipient_type` | Doctor, facility, pharmacy, diagnostics provider, support, admin |
| `recipient_id` | Specific recipient or organization |
| `purpose` | Booking, telemedicine, diagnostics review, pharmacy pickup, support, payment receipt |
| `access_level` | View, download, upload response, annotate later |
| `starts_at` | When access begins |
| `expires_at` | When access ends |
| `revoked_at` | When patient revokes access |
| `status` | Active, expired, revoked, denied |

Rules:

- Consent should be document-specific or collection-specific.
- Consent should not be bundled across unrelated providers or purposes.
- Sharing a document with one doctor should not share it with the whole facility unless explicitly chosen.
- Emergency exceptions, if ever considered, need separate legal and governance review.
- Consent history should remain auditable even after access expires.

---

## Facility and Doctor Upload Workflow

Facility and doctor uploads should wait until booking, provider ownership, identity, and storage controls exist.

Possible future flow:

1. Patient has a booking, telemedicine session, visit, or approved interaction.
2. Provider is authorized for that workflow.
3. Provider uploads a document for the patient, such as a visit summary or referral note.
4. Document is stored privately and linked to patient and workflow.
5. Patient is notified later through approved notification rules.
6. Patient can view, organize, download, or share the document according to policy.
7. Access and upload events are audited.

Rules:

- Facility staff access should be scoped by role.
- Doctor uploads should be tied to doctor profile ownership or approved facility staff context.
- Provider-uploaded documents should not automatically publish to any public page.
- Uploads should not include unrelated patients or staff notes.
- Clinical notes should not be mixed with admin review notes.

---

## Pharmacy and Diagnostics Upload Workflow

Pharmacy and diagnostics workflows have special sensitivity.

### Pharmacy Uploads

Possible future documents:

- Prescription copy
- Pickup confirmation document
- Medication instruction note
- Refill support document

Rules:

- Prescription documents should be shared only for pharmacy workflows.
- Pharmacy staff should not see unrelated patient vault content.
- Medication details should not appear in reviews, public pages, or payment records.
- Pharmacy uploads should wait until pharmacy request workflows exist.

### Diagnostics Uploads

Possible future documents:

- Lab result report
- Imaging report
- Sample collection note
- Result delivery confirmation

Rules:

- Diagnostics providers should upload only documents tied to a diagnostics request or approved workflow.
- Lab results and imaging reports should be private by default.
- Result files should not be sent to doctors or facilities without patient consent unless a specific care workflow authorizes it.
- Result interpretation should remain separate from payment, review, and public listing data.

---

## Patient-Controlled Sharing

Patient-controlled sharing means patients choose what to share, with whom, for what purpose, and for how long.

Possible future sharing options:

- Share one document with a doctor for a booking.
- Share a lab result with a specialist.
- Share a prescription with a pharmacy.
- Share a referral note with a facility.
- Share a document collection for a telemedicine session.
- Share a receipt with support for a payment dispute.

Rules:

- Default state is private.
- Patients should see exactly which documents are shared.
- Patients should be able to revoke future access where policy allows.
- Providers should see only shared documents, not the full vault.
- Sharing should not imply permission to use documents for marketing, training, or unrelated care.
- Shared documents should not become public evidence for ratings or reviews.

---

## Document Organization

Document organization should help patients find records without creating clinical complexity too early.

Possible organization methods:

- By document type
- By provider
- By booking or appointment
- By date
- By specialty
- By facility
- By pharmacy or diagnostics provider
- By tag
- By shared status
- By archived status

Recommended early organization:

1. Documents by type
2. Documents by date
3. Documents linked to booking or provider
4. Shared with whom

Avoid early overreach:

- Do not attempt full diagnosis-based medical records.
- Do not auto-classify complex clinical content without review.
- Do not create provider-facing patient timelines until consent and access controls are mature.

---

## Metadata and Tagging

Document metadata should support organization, search, sharing, and audit without exposing clinical details publicly.

Suggested metadata fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable document record ID |
| `patient_id` | Document owner |
| `document_type` | Prescription, lab result, referral, receipt, etc. |
| `title` | Patient-facing title |
| `description` | Optional patient-safe note |
| `provider_type` | Doctor, facility, pharmacy, diagnostics provider |
| `provider_id` | Linked provider if relevant |
| `booking_id` | Linked booking if relevant |
| `source_type` | Patient uploaded, provider uploaded, system generated |
| `file_mime_type` | Future file type validation |
| `file_size` | Future storage and safety validation |
| `storage_path` | Future private storage pointer |
| `created_at` | Creation timestamp |
| `uploaded_by` | Actor who uploaded |
| `shared_status` | Private, shared, expired, revoked |
| `retention_status` | Active, archived, deletion requested |

Tagging rules:

- Tags should be patient-visible and manageable where possible.
- Provider-created tags should not expose private clinical assumptions broadly.
- Internal moderation or security tags should remain separate from patient-facing tags.
- Tags should not be used for public search.

---

## Privacy and Confidentiality Rules

Patient documents require the strongest privacy rules in the product.

Rules:

- Do not expose documents in public listing payloads.
- Do not expose documents in search documents.
- Do not expose documents in patient reviews.
- Do not use documents as provider marketing material.
- Do not share documents with providers without consent or a specific active workflow.
- Do not store unnecessary medical documents.
- Do not store raw files before storage, encryption, access policy, and audit planning exist.
- Keep document metadata separate from public provider data.
- Keep clinical document content separate from payment records.
- Keep admin notes and provider notes separate from patient vault content.
- Use least-privilege access for every role.
- Treat document access as sensitive and auditable.

Data minimization rule:
If a workflow can operate without storing a document, do not store it.

---

## Audit Log Requirements

Document actions should be audited when implemented.

Actions to audit:

- Document uploaded
- Document viewed
- Document downloaded
- Document shared
- Share access accepted or opened
- Share access expired
- Share access revoked
- Document metadata changed
- Document archived
- Document deletion requested
- Document deleted or retained under policy
- Provider uploaded document
- Provider attempted unauthorized access
- Admin/support accessed document
- Security scan result recorded
- Storage access policy changed

Suggested audit fields:

| Field | Purpose |
| --- | --- |
| `actor_id` | Patient, provider, support, admin, system |
| `actor_role` | Role at time of action |
| `action_type` | Upload, view, share, revoke, download, delete, etc. |
| `document_id` | Target document |
| `patient_id` | Owning patient |
| `recipient_id` | Recipient when sharing |
| `purpose` | Booking, diagnostics, pharmacy, telemedicine, support |
| `access_level` | View, download, upload, manage |
| `created_at` | Timestamp |
| `metadata` | Public-safe technical context |

Audit logs should be append-only and protected.

---

## Supabase Storage Planning Later

Supabase Storage may be considered later, but should not be added now.

Potential future buckets:

| Bucket | Purpose | Access Direction |
| --- | --- | --- |
| `patient-documents` | Patient-owned clinical documents | Private |
| `provider-uploaded-documents` | Provider-uploaded patient documents | Private |
| `verification-documents` | Provider verification evidence | Private and separate |
| `support-attachments` | Support case attachments | Private |
| `public-provider-images` | Reviewed public logos/photos | Public or transformed public copies |

Storage rules:

- Patient documents should use private buckets.
- Verification documents should not share buckets with patient documents unless policy justifies it.
- Public provider images should stay separate from private documents.
- Signed URLs, if used later, should be short-lived.
- Storage paths should not reveal patient names, diagnoses, or sensitive details.
- File type, file size, malware scanning, and content safety rules should be defined before uploads.
- Service role keys must never be exposed to the browser.

Supabase Storage should be introduced only in a dedicated backend/storage task after RLS, auth, consent, and audit requirements are defined.

---

## Relationship to Patient Identity

The vault depends on patient identity.

Relationship rules:

- Public browsing remains identity-free.
- Document vault requires patient account and strong privacy controls later.
- Patient ID should identify the private owner of documents.
- Stronger identity verification may be required for sensitive document sharing or regulated workflows.
- Patient identity should not appear in public listings, reviews, search, or provider cards.
- Providers should access documents only through scoped consent or active care workflow.
- Patient identity and document access events should be audited.

The vault should not exist before patient identity and consent foundations are ready.

---

## Relationship to Booking

Booking can provide context for document sharing, but documents should not be required for booking.

Possible booking relationships:

- Patient shares a document before appointment.
- Provider uploads a visit summary after appointment.
- Completed booking links to a document collection.
- Cancellation or rescheduling preserves document access history.
- Verified visit review eligibility uses booking, not document content.

Rules:

- Booking notes should not become medical records.
- Documents should not expose appointment reason publicly.
- Providers should not get vault access just because a booking exists.
- Document access for booking should expire or be revocable where possible.
- Booking status and document status should remain separate.

---

## Relationship to Telemedicine

Telemedicine may need document sharing later, but only after privacy and consent rules are ready.

Possible telemedicine uses:

- Patient shares a lab result before remote consultation.
- Doctor shares a follow-up note after session.
- Patient receives prescription document later.
- Patient shares imaging report with telemedicine doctor.

Rules:

- Telemedicine links and documents should not be public.
- Session data and documents should remain separate from public doctor profiles.
- Telemedicine documents should not include chat transcripts by default unless a future policy defines it.
- Document sharing should not expose unrelated vault contents.
- Telemedicine payment records should not contain clinical document details.

---

## Relationship to Wallet and Payments

Wallet and payments should stay separate from clinical documents.

Possible document-adjacent financial documents:

- Receipt
- Invoice
- Refund confirmation
- Sponsorship confirmation
- Membership proof

Rules:

- Payment records should not contain clinical documents.
- Clinical documents should not expose wallet balances or payment methods.
- Providers should not see wallet history through document sharing.
- Receipts and invoices should be categorized separately from prescriptions or lab results.
- Payment disputes should use only the minimum document evidence needed.
- Sponsored payment does not automatically give a sponsor access to medical documents.

---

## Relationship to Reviews

Patient reviews should never expose document contents.

Rules:

- Documents should not be attached to public reviews.
- Lab results, prescriptions, diagnoses, visit summaries, and imaging reports should not appear in reviews.
- Verified visit labels should not require publishing documents.
- Review disputes should use document access only in rare, consented, protected, and audited cases.
- Providers should not pressure patients to share documents to change reviews.
- Review moderation should stay separate from document vault management.

---

## Relationship to Provider Workflows

Provider workflows may create or consume documents later, but access must be scoped.

Provider workflow examples:

- Doctor uploads visit summary.
- Facility uploads discharge note.
- Pharmacy receives prescription document.
- Diagnostics provider uploads lab result.
- Provider requests a patient to share a document.
- Provider responds to missing or expired document access.

Provider boundaries:

- Provider owners cannot browse patient vaults.
- Facility managers should see documents only for assigned workflows.
- Doctor access should be limited to their own patient interactions.
- Pharmacy and diagnostics access should be workflow-specific.
- Admin review of provider listings should not include patient documents.
- Provider verification documents should remain separate from patient documents.

Provider document workflows should come only after provider ownership, staff roles, patient identity, consent, audit logs, and storage policies exist.

---

## Future Supabase Table Mapping

This is planning only. No Supabase code, SQL, migrations, policies, storage buckets, or database files should be added yet.

Potential future tables:

| Area | Possible Table |
| --- | --- |
| Patient documents | `patient_documents` |
| Document files | `patient_document_files` |
| Document tags | `patient_document_tags` |
| Document shares | `patient_document_shares` |
| Document access events | `patient_document_access_events` |
| Document versions | `patient_document_versions` |
| Document consent records | `patient_consents` or `document_consents` |
| Patient identity | `patient_profiles` or `patient_identities` |
| Booking links | `bookings` or `appointment_requests` |
| Telemedicine links | `telemedicine_sessions` |
| Pharmacy links | `pharmacy_requests` later |
| Diagnostics links | `diagnostics_requests` later |
| Payment document links | `payment_transactions` or `payment_receipts` |
| Provider ownership | `provider_ownerships` |
| Provider staff access | `organization_memberships` |
| Support cases | `support_cases` or `contact_messages` |
| Audit history | `audit_logs` |

Future RLS direction:

- Patients can read and manage their own document records.
- Providers can read only documents explicitly shared with them or tied to an authorized active workflow.
- Providers cannot browse patient vaults.
- Support operators can access limited document context only when needed.
- Admin access should be rare, justified, and audited.
- Super Admin access should be reserved for severe security or governance cases.
- Anonymous public users cannot read document tables or storage objects.

---

## Security Considerations

Document vault security should be designed before implementation.

Security requirements:

- Private storage only.
- Strong authentication for patient vault access.
- Role-scoped provider access.
- Explicit consent checks.
- Short-lived file access links if used.
- Malware scanning or file safety checks before documents are opened or shared.
- File type and size restrictions.
- Encryption and secure transport.
- No sensitive information in storage paths.
- No service role key exposure to browser code.
- Audit logs for access and sharing.
- Retention and deletion policy.
- Backup and recovery strategy.
- Abuse and suspicious access monitoring.

Support rules:

- Support staff should not open documents unless needed for a specific case.
- Support access should be logged.
- Sensitive document incidents should escalate to Admin or Super Admin.
- Data export or deletion requests need dedicated policy later.

---

## MVP Recommendation

Do not add patient document vault, document upload UI, file storage, Supabase Storage, patient portal, clinical records, or document sharing to the MVP.

Recommended MVP stance:

- Keep public discovery, verified labels, detail pages, corrections, feedback, and provider registration preview as the core product.
- Do not collect patient documents.
- Do not ask patients to upload prescriptions, lab results, IDs, receipts, or records.
- Do not show document vault navigation or preview UI.
- Do not imply that DigitalDirectory-v2 stores medical records.

Recommended first future step:
Start with patient identity and consent planning, then booking/provider workflows, then a narrow document-sharing pilot only when storage, auth, RLS, audit logs, support, and privacy policies are ready.

---

## Risks

Key risks:

- Collecting sensitive documents before security is ready.
- Exposing patient documents through public payloads or misconfigured storage.
- Giving providers broad access to patient records.
- Mixing patient medical documents with provider verification evidence.
- Storing medical records without a clear care workflow.
- Uploading prescriptions or results before pharmacy/diagnostics workflows are real.
- Sharing documents without explicit patient consent.
- Storing sensitive names or diagnoses in file paths.
- Allowing downloads without audit history.
- Using documents in reviews or public trust claims.
- Launching storage before file scanning, RLS, auth, and retention rules exist.

Mitigations:

- Keep document vault out of MVP.
- Define consent and access boundaries first.
- Use private storage only.
- Separate patient documents from provider verification documents.
- Require audit logs for all sensitive document actions.
- Use least-privilege provider access.
- Start with one narrow workflow later.
- Avoid storing documents unless the workflow truly needs them.

---

## Recommended Next Development Order

1. Keep DigitalDirectory-v2 frontend-only and discovery-first.
2. Continue improving public listing quality, correction flows, provider detail pages, and trust labels.
3. Finalize patient identity, consent, booking, payment, transport, and provider workflow strategies.
4. Define patient document sensitivity categories and supported document types.
5. Define exact consent scopes for document sharing.
6. Define upload, view, share, download, revoke, archive, and delete permission rules.
7. Plan Supabase tables and RLS policies for document metadata only after backend scope is approved.
8. Plan Supabase Storage buckets, access rules, and file safety requirements only after storage scope is approved.
9. Add authentication only when provider/admin and patient-specific workflows justify it.
10. Add audit logging before any patient document data is stored.
11. Build patient account foundations before vault UI.
12. Pilot a narrow document workflow, such as sharing a lab result for a confirmed booking, only after consent and storage are ready.
13. Add provider upload workflows after provider ownership and staff roles are implemented.
14. Add pharmacy, diagnostics, telemedicine, payment receipt, and caregiver sharing document flows only when those workflows are real.

---

## Summary

A patient document vault could eventually support prescriptions, lab results, referrals, visit summaries, receipts, telemedicine records, diagnostics reports, and patient-controlled sharing.

It should be introduced late and carefully. The platform must first establish patient identity, consent, backend access control, private storage, provider role boundaries, audit logs, support rules, and security policy.

The recommended MVP is no document vault, no upload UI, no Supabase Storage, no patient portal, no file upload, no clinical records storage, and no document sharing functionality.
