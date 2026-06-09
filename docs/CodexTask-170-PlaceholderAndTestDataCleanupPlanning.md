# Codex Task 170: Placeholder and Test Data Cleanup Planning

## Project

DigitalDirectory-v2

## Goal

Plan a safe cleanup process for placeholder, test, demo, fictional, static fallback, and mock data before MVP review.

This is a documentation-only planning task. No source code, test data, Supabase SQL, RLS, schema, migrations, real data, static data, UI, brand, logo, colors, routes, probe scripts, or package scripts were modified for this task.

---

## Context Reviewed

Planning and QA references:

- `docs/CodexTask-169-PostDiagnosticsMVPCheckpoint.md`
- `docs/CodexTask-168-DiagnosticsContactChannelsQA.md`
- `docs/CodexTask-150-PharmacyContactChannelsQA.md`

Source areas inspected for later inventory planning:

- `src/data`
- `src/app`
- `src/components`
- `src/lib/public-listing-mappers.ts`
- `src/lib/supabase`

Current MVP position from Task 169:

```text
Pharmacy: MVP-stable
Diagnostics: MVP-stable
```

Known diagnostics runtime limitation:

```text
npm.cmd run probe:diagnostics: safe fallback/error, DIAGNOSTICS_PUBLIC_READ_FAILED
```

The diagnostics rows were manually verified in Supabase SQL during Task 156, but the local/Codex diagnostics runtime probe still does not verify the six live Supabase diagnostics rows.

---

## Cleanup Categories

Future cleanup work should identify and classify these categories.

### Placeholder Content

Content that exists to reserve space for future functionality, future pages, future workflows, or future data.

Examples to inventory later:

- placeholder labels
- placeholder form fields
- placeholder search boxes
- placeholder cards
- placeholder empty states
- placeholder route copy

### Test Data

Data created specifically for QA, RLS checks, probe checks, or manual Supabase verification.

Diagnostics test rows should not be deleted until a real-data replacement and QA strategy is approved.

### Demo Data

Data or copy intended to demonstrate an experience rather than represent an actual provider, action, contact method, or workflow.

Examples to inventory later:

- demo-only public cards
- frontend-only workflow examples
- fake request examples
- static provider dashboard examples

### Fictional Provider Data

Provider names, addresses, services, or contact-like details that look real to users but are not verified real provider records.

These are high-priority MVP review risks because they may appear trustworthy even when they are only sample content.

### Static Fallback Data

Static cards or details returned when Supabase is unavailable, the public client is unavailable, or a safe read helper falls back.

Static fallback data should be reviewed carefully because it can still appear in production-like public pages if runtime configuration is missing or unavailable.

### Mock Workflow Data

Static workflow examples that represent future actions, provider dashboards, registration flows, booking flows, account previews, correction requests, or review queues.

Mock workflow content may be acceptable for internal preview routes, but should be clearly classified before MVP review.

### Preview-Only UI Copy

Copy that tells users an interaction is a preview, not active, not submitted, frontend-only, or future-only.

This may be useful during development but should be reviewed for public MVP trust and clarity.

### Empty-State And Not-Listed Copy

Fallback labels such as "not listed", "not available", or "details not available yet" should be reviewed for user clarity and consistency.

### Contact Channel Empty States

Missing pharmacy or diagnostics contact channel rows should continue to resolve safely, but the public user experience should be reviewed so empty contact sections do not feel broken or misleading.

---

## Known Diagnostics Test Slugs

Public-visible diagnostics test slugs manually verified in SQL during Task 156:

```text
test-diagnostic-alpha-lab
test-diagnostic-eta-imaging
test-diagnostic-zeta-radiology
test-diagnostic-omega-pathology
test-diagnostic-kappa-mixed
test-diagnostic-lambda-home-sample
```

Blocked diagnostics test slugs manually verified as excluded from active/public SQL results:

```text
test-diagnostic-beta-pending
test-diagnostic-delta-hidden
```

Recommended classification for these rows before real-data replacement:

```text
Keep for QA
```

Reason:

- They verify active/public filtering.
- They verify pending/hidden blocking behavior.
- They support diagnostics runtime probe expectations.
- They should not be deleted before a replacement QA dataset exists.

---

## Likely Areas To Inspect Later

The next inventory task should inspect these source areas.

### Static Data

```text
src/data/index.ts
src/data/sampleDiagnostics.ts
src/data/sampleDoctors.ts
src/data/sampleFacilities.ts
src/data/samplePharmacies.ts
src/data/seed-community-channels.ts
src/data/seed-diagnostics.ts
src/data/seed-doctors.ts
src/data/seed-facilities.ts
src/data/seed-locations.ts
src/data/seed-pharmacies.ts
src/data/seed-services.ts
src/data/seed-specialties.ts
src/data/seed-types.ts
```

Inspection focus:

- sample provider names
- sample slugs
- sample addresses
- sample services
- sample verification labels
- seeded locations
- seeded specialties
- seeded contact-like data
- community channel seed content

### Public Routes

```text
src/app
```

High-priority route groups to inspect:

- `src/app/page.tsx`
- `src/app/search/page.tsx`
- `src/app/facilities/page.tsx`
- `src/app/facilities/[slug]/page.tsx`
- `src/app/facilities/addis-health-center/page.tsx`
- `src/app/doctors/page.tsx`
- `src/app/doctors/[slug]/page.tsx`
- `src/app/doctors/dr-hana-bekele/page.tsx`
- `src/app/pharmacies/page.tsx`
- `src/app/pharmacies/[slug]/page.tsx`
- `src/app/diagnostics/page.tsx`
- `src/app/diagnostics/[slug]/page.tsx`
- `src/app/nearby/page.tsx`
- `src/app/register/page.tsx`
- `src/app/corrections/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/feedback/page.tsx`

Preview-only routes to classify:

- `src/app/account-preview/page.tsx`
- `src/app/admin-review-preview/page.tsx`
- `src/app/booking-request-preview/page.tsx`
- `src/app/patient-account-preview/page.tsx`
- `src/app/provider-dashboard-preview/page.tsx`

Internal probe routes to keep out of public MVP navigation unless intentionally retained:

- `src/app/internal/doctor-detail-probe/page.tsx`
- `src/app/internal/doctors-public-read-probe/page.tsx`
- `src/app/internal/facility-detail-probe/page.tsx`
- `src/app/internal/provider-contact-channels-probe/page.tsx`

### Components

```text
src/components
```

Component groups likely to contain sample, preview, fallback, or demo-only wording:

- `src/components/home`
- `src/components/search`
- `src/components/search-results`
- `src/components/facilities`
- `src/components/facility-detail`
- `src/components/doctors`
- `src/components/doctor-detail`
- `src/components/pharmacies`
- `src/components/diagnostics`
- `src/components/nearby`
- `src/components/register`
- `src/components/registration`
- `src/components/corrections`
- `src/components/contact`
- `src/components/feedback`
- `src/components/auth`
- `src/components/admin-review`
- `src/components/booking-request`
- `src/components/provider-dashboard`

Inspection focus:

- text containing "preview", "sample", "mock", "test", or "frontend-only"
- action buttons that are not active
- workflow descriptions that imply future functionality
- public trust language around verification
- public empty-state language

### Public Listing Mapper

```text
src/lib/public-listing-mappers.ts
```

Inspection focus:

- default fallback labels
- sample-only trust labels
- preview contact channels
- hardcoded detail slug mappings
- provider detail path behavior
- contact channel placeholders
- "not listed" fallback labels
- route link behavior for diagnostics cards

### Supabase Public Read Helpers

```text
src/lib/supabase/diagnostics-public-read.ts
src/lib/supabase/pharmacies-public-read.ts
src/lib/supabase/facilities-public-read.ts
src/lib/supabase/doctors-public-read.ts
src/lib/supabase/provider-contact-channels-public-read.ts
src/lib/supabase/public-client.ts
src/lib/supabase/env.ts
```

Inspection focus:

- static fallback card behavior
- static fallback detail behavior
- safe fallback messages
- missing environment behavior
- "not listed" labels
- preview-only labels
- safe error codes
- public-safe field mapping

---

## Search Terms For Demo-Only Wording

Recommended search terms for the next inventory task:

```text
test
demo
sample
fictional
placeholder
preview
preview-only
frontend-only
future
coming soon
not listed
not available
details not available
fallback
static
mock
fake
seed
example
request preview
save preview
contact preview
booking preview
dashboard preview
verification preview
trust label
sample-only
not a real
nothing is submitted
no real
no geolocation
no booking
no contact
```

Recommended file search scope:

```text
src/data
src/app
src/components
src/lib/public-listing-mappers.ts
src/lib/supabase
```

---

## Classification Labels

Every inventory item should receive one of these labels.

### Keep for QA

Use for data or copy that is still needed to verify filters, fallback behavior, blocked-row behavior, route safety, or probe expectations.

Examples:

- diagnostics active/public test slugs
- diagnostics pending/hidden blocked slugs
- safe static fallback records needed when Supabase is unavailable

### Replace With Real Data

Use for public-facing provider content that should become real Addis Ababa private healthcare provider data before MVP review.

Examples:

- fictional provider cards
- fictional addresses
- fictional service lists
- fictional public contact previews

### Hide From Public UI

Use for content that may remain in the codebase for development or internal review but should not be visible to public users.

Examples:

- internal preview routes
- admin review previews
- provider dashboard mock views
- patient account preview routes

### Remove After Real Data Import

Use for placeholder, sample, or fallback content that should be removed only after real data and replacement QA are ready.

Examples:

- static fallback cards that duplicate real provider records
- sample-only provider detail pages
- seed records no longer needed after real imports

### Needs Product Decision

Use for content where cleanup depends on product strategy, MVP scope, trust language, brand direction, or whether a route should be public.

Examples:

- preview workflow pages
- correction and registration wording
- public trust language
- future booking/action labels
- fallback UI copy

---

## Recommended Staged Cleanup

### Stage 1: Inventory Only

Find and list placeholder, test, demo, fictional, static fallback, mock, and preview-only content.

Do not delete anything.

Do not replace data.

Do not change routes.

Do not change UI.

Recommended output:

```text
Item
File path
Publicly visible?
Current text/data
Category
Initial classification label
Risk note
Recommended next action
```

### Stage 2: Classify

Apply the classification labels:

```text
Keep for QA
Replace with real data
Hide from public UI
Remove after real data import
Needs product decision
```

Each item should have one owner decision before implementation.

### Stage 3: Real-Data Replacement Plan

Define what real provider data is required before replacing or removing fallback content.

Plan should identify:

- required fields
- optional fields
- public-safe fields
- source tracking
- verification status
- last confirmed date
- correction flow compatibility
- add-provider flow compatibility
- rollback/fallback approach

### Stage 4: Public UI Cleanup

After inventory and classification are approved, remove or hide user-facing demo/test wording where appropriate.

Likely cleanup targets:

- "sample" labels on public pages
- "preview-only" text on public discovery pages
- "mock data" statements visible to public users
- public-facing route copy that implies inactive workflows
- placeholder provider cards
- confusing empty-state language

### Stage 5: Regression QA

After cleanup implementation, run regression checks.

Recommended validation commands:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run probe:diagnostics-detail
npm.cmd run probe:diagnostics
npm.cmd run probe:pharmacies
npm.cmd run probe:pharmacy-detail
```

Recommended manual QA:

- landing page
- search page
- facilities listing and detail
- doctors listing and detail
- pharmacies listing and detail
- diagnostics listing and detail
- contact/action panels
- correction page
- registration page
- feedback page
- mobile viewport
- desktop viewport

---

## Real Data Readiness Considerations

Real data replacement should preserve public safety and avoid unverified claims.

Before replacing test, sample, fallback, or mock data, define:

- provider display name
- provider slug
- provider type
- category/provider subtype
- city
- area
- public address
- public landmark if available
- public services
- public specialties where applicable
- public opening hours
- public contact channels
- public website or maps URL if approved
- public availability summary
- listing status
- visibility status
- verification status
- last confirmed date
- source or collection note
- correction workflow compatibility
- add-provider workflow compatibility

Do not include:

- patient data
- private phone numbers
- private email addresses
- owner personal contacts unless explicitly approved for public display
- staff personal contacts
- lab reports
- diagnostic results
- uploaded files
- prescriptions
- orders
- payment details
- admin notes
- reviewer notes
- verification evidence
- Supabase keys
- environment values
- secrets

---

## Immediate Next Task Recommendation

Recommended next task:

```text
Task 171 - Placeholder and Test Data Inventory
```

Recommended Task 171 objective:

```text
Create an inventory of placeholder, test, demo, fictional, static fallback, mock, and preview-only content across the planned source areas. Do not modify or delete content during inventory.
```

Task 171 should remain inventory-only unless the project owner separately approves cleanup implementation.

---

## Scope Confirmation

For Task 170:

- No source code was modified.
- No test data was deleted.
- No Supabase SQL was modified.
- No RLS was modified.
- No schema was modified.
- No Supabase migrations were modified.
- No real data was inserted.
- No static data was changed.
- No UI was changed.
- No brand, logo, or colors were changed.
- No routes were changed.
- No probe scripts were modified.
- No package scripts were modified.
- Task 171 was not created.

---

## Planning Status

```text
Planning complete.
```

Cleanup categories, likely inspection areas, known diagnostics test slugs, demo-only search terms, staged cleanup approach, classification labels, real data readiness considerations, and the recommended next inventory task are documented.
