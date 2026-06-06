# Codex Task 150: Pharmacy Contact Channels QA

## Project

DigitalDirectory-v2

## Goal

Verify the pharmacy contact channel wiring completed in Task 149.

This task follows:

- CodexTask-148-PharmacyContactChannelsPlanning.md
- CodexTask-149-WirePharmacyContactChannelsIntoDetailPage.md

The purpose is to confirm that the pharmacy detail page safely loads and displays public contact channels through the shared provider contact channel architecture.

This is a QA and small-fix task only.

Do not implement diagnostics in this task.

---

## Important Context

Before making changes, read:

- docs/CodexTask-148-PharmacyContactChannelsPlanning.md
- docs/CodexTask-149-WirePharmacyContactChannelsIntoDetailPage.md
- src/app/pharmacies/[slug]/page.tsx
- src/lib/supabase/pharmacies-public-read.ts
- existing provider contact channel helper file
- existing facility contact channel QA patterns
- existing doctor contact channel QA patterns
- docs/CodexTask-120-ProviderContactChannelsQA.md
- docs/CodexTask-123-ProviderContactChannelsRouteQA.md
- docs/CodexTask-127-FacilityContactChannels.md
- docs/CodexTask-129-DoctorContactChannels.md

Use the existing facility and doctor contact-channel QA style as the main guide.

---

## Main Objective

Verify that pharmacy contact channels are wired safely into:

```text
/pharmacies/[slug]