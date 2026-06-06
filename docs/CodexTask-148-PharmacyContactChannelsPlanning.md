# Codex Task 148: Pharmacy Contact Channels Planning

## Project

DigitalDirectory-v2

## Goal

Plan the public-safe pharmacy contact channel strategy before implementation.

This task follows:

- CodexTask-144-PharmacyDetailReadHelperImplementation.md
- CodexTask-145-PharmacyDetailRuntimeProbe.md
- CodexTask-146-PharmacyDetailRouteControl.md
- CodexTask-147-PharmacyDetailRouteQA.md

The pharmacy list-to-detail journey is now working. The next step is to plan how pharmacy contact channels should appear safely on pharmacy detail pages and pharmacy cards.

This is a planning task only.

Do not implement code in this task.

---

## Important Context

Before writing the plan, inspect:

- docs/CodexTask-117-ProviderContactChannelsPlanning.md
- docs/CodexTask-118-ProviderContactChannelsModelPlanning.md
- docs/CodexTask-119-ProviderContactChannelsImplementation.md
- docs/CodexTask-120-ProviderContactChannelsQA.md
- docs/CodexTask-121-ProviderContactChannelsRuntimeProbe.md
- docs/CodexTask-122-ProviderContactChannelsPageWiring.md
- docs/CodexTask-123-ProviderContactChannelsRouteQA.md
- docs/CodexTask-124-ProviderContactChannelsRuntimeProbe.md
- docs/CodexTask-126-WireContactChannels.md
- docs/CodexTask-127-FacilityContactChannels.md
- docs/CodexTask-128-WireContactChannels.md
- docs/CodexTask-129-DoctorContactChannels.md

Also inspect:

- src/app/pharmacies/page.tsx
- src/app/pharmacies/[slug]/page.tsx
- src/lib/supabase/pharmacies-public-read.ts
- src/lib/public-listing-mappers.ts
- src/types/public-listings.ts
- existing facility contact channel implementation
- existing doctor contact channel implementation
- docs/DataModelContentStructure.md
- docs/DevelopmentRoadmap.md

Use the existing provider/facility/doctor contact channel architecture as the main guide.

---

## Main Objective

Create a written implementation plan for pharmacy contact channels.

The plan should define:

1. What contact channels pharmacies should support for MVP.
2. Which contact fields are public-safe.
3. Which contact fields must remain private or excluded.
4. Whether existing provider contact channel types/components can be reused.
5. Whether the current `pharmacies` SQL/table fields support contact channels already.
6. Whether new SQL fields are required later or whether existing public fields are enough for now.
7. How pharmacy cards should display contact actions.
8. How pharmacy detail pages should display contact actions.
9. How delivery/pickup inquiry should be represented.
10. What Task 149 should implement.

---

## Pharmacy Contact Channels to Consider

For MVP, consider the following public-safe contact actions:

- Phone call
- WhatsApp
- Telegram
- Website
- Google Maps / map link
- Address display
- Opening hours display
- Pickup inquiry
- Delivery inquiry
- Prescription upload preview label, if already supported

Do not assume all of these are already available in the schema.

---

## Public Safety Rules

The plan must clearly separate public-safe and private/internal data.

Public-safe examples:

- public phone number
- public WhatsApp number
- public Telegram link or handle
- public website
- public map link
- public address
- public landmark
- public opening hours

Private/internal examples:

- owner phone
- staff personal phone
- admin notes
- internal verification notes
- private documents
- private registration files
- private email not intended for public display
- internal Supabase IDs if not needed in UI

No private/internal contact information should be exposed.

---

## Planning Questions

Answer these clearly in the task output:

1. What contact channel system already exists for facilities and doctors?
2. Can pharmacy contact channels reuse the same system?
3. What fields does the pharmacy public read helper currently return?
4. Does the current pharmacy helper return enough data for real contact actions?
5. Are contact fields missing from the pharmacy public read helper?
6. Are contact fields missing from the pharmacy SQL/table?
7. Should Task 149 only wire existing fields, or should it first add contact field support?
8. How should pharmacy pickup/delivery inquiry actions appear?
9. How should missing contact data be handled in the UI?
10. What should Task 149 be called?

---

## Scope

Allowed:

- Inspect existing contact channel patterns.
- Inspect pharmacy helper and route.
- Inspect public listing/contact channel types.
- Write a planning section inside this task file.
- Recommend the safest implementation path for Task 149.

Not allowed:

- Do not modify source code.
- Do not modify SQL.
- Do not modify RLS.
- Do not add pharmacy columns.
- Do not wire contact buttons yet.
- Do not modify pharmacy pages.
- Do not implement diagnostics.
- Do not import real data.
- Do not change brand/logo UI.
- Do not create Task 149.

---

## Expected Output

Update this task markdown with a planning section containing:

- Existing contact channel architecture found
- Pharmacy public data currently available
- Missing pharmacy contact data, if any
- Public/private safety decision
- Recommended pharmacy contact channel fields for MVP
- Recommended UI placement
- Recommended implementation sequence
- Risks
- Recommended Task 149 title and objective

---

## Acceptance Criteria

- Existing provider/facility/doctor contact channel patterns are inspected.
- Pharmacy contact channel requirements are documented.
- Public-safe vs private/internal fields are clearly separated.
- Current pharmacy data limitations are documented.
- Recommended implementation path is documented.
- No source code is modified.
- No SQL, schema, or RLS changes are made.
- No UI changes are made.
- Task 149 is recommended but not created.

---

## Deliverable

A planning-only task that prepares the project for safe pharmacy contact channel implementation.

Do not create Task 149 in this task.