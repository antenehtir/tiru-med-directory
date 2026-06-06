# Codex Task 149: Wire Pharmacy Contact Channels Into Detail Page

## Project

DigitalDirectory-v2

## Goal

Wire public-safe pharmacy contact channels into the pharmacy detail page using the existing shared provider contact channel architecture.

This task follows:

- CodexTask-148-PharmacyContactChannelsPlanning.md
- CodexTask-147-PharmacyDetailRouteQA.md
- CodexTask-146-PharmacyDetailRouteControl.md
- CodexTask-145-PharmacyDetailRuntimeProbe.md
- CodexTask-144-PharmacyDetailReadHelperImplementation.md

The planning task confirmed that pharmacies should reuse the existing shared contact channel helper:

```ts
getSupabasePublicProviderContactChannels(providerType, providerSlug)