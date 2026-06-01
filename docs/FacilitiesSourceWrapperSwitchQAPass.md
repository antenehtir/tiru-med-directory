# DigitalDirectory-v2 Facilities Source Wrapper Switch QA Pass

## Scope

This document records a controlled QA pass for the facilities source wrapper switch added after Task 77.

The QA scope is limited to verifying that static data remains the default, Supabase facilities mode is opt-in only, fallback behavior is safe, and current public listing behavior remains unchanged.

This QA pass does not wire public pages to Supabase, modify frontend UI, add authentication, add backend functionality, add protected routes, add SQL, add migrations, add RLS policies, insert test data, add patient data, or add booking, payment, document, or admin workflows.

## Files Reviewed

Implementation files reviewed:

- `src/lib/public-listing-source.ts`
- `src/lib/supabase/facilities-public-read.ts`
- `src/lib/supabase/env.ts`
- `src/lib/supabase/browser-client.ts`
- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`

Planning and QA documents reviewed:

- `docs/FacilitiesSourceWrapperControlledSwitchPlanning.md`
- `docs/FacilitiesPublicReadQAPass.md`
- `docs/PublicListingSourceWrapperQAPass.md`
- `docs/SupabaseLocalEnvManualSetupQA.md`
- `docs/FacilitiesSQLManualExecutionQA.md`
- `docs/SupabasePublicListingReadPlanning.md`
- `docs/StaticToSupabaseSourceSwitchPlanning.md`

## Source Wrapper Findings

`src/lib/public-listing-source.ts` now exposes a controlled async facilities source function:

- `getPublicFacilityCardsFromSource`

Existing public listing exports remain available:

- `getPublicListingSourceMode`
- `getPublicListingSourceStatus`
- `getPublicFacilityCards`
- `getPublicDoctorCards`
- `getPublicPharmacyCards`
- `getPublicDiagnosticsCards`
- `getAllPublicProviderCards`
- `getPublicFacilityDetails`
- `getPublicDoctorDetails`
- `getPublicPharmacyDetails`
- `getPublicDiagnosticsDetails`
- `getPublicProviderCardsByType`
- `isSupabasePublicListingSourceAvailable`

The existing synchronous exports still return static seed data.

## Static Default Findings

Static remains the default source.

Confirmed behavior:

- `getPublicListingSourceMode()` returns `static`.
- `getPublicListingSourceStatus()` reports static seed data as the active public listing source.
- `getPublicFacilityCards()` still maps static seed facilities.
- `getAllPublicProviderCards()` still uses the static synchronous provider card functions.
- Calling `getPublicFacilityCardsFromSource()` without options returns static facility cards.

No default code path calls Supabase.

## Opt-In Supabase Mode Findings

The Supabase facilities path is available only through explicit preview mode:

```ts
getPublicFacilityCardsFromSource({
  mode: "supabase-facilities-preview",
});
```

This opt-in mode is limited to facilities. Doctors, pharmacies, diagnostics, details, search, homepage, and public pages remain static.

## Dynamic Import And No Default Query Findings

The wrapper uses a dynamic import for the Supabase facilities helper:

```ts
await import("./supabase/facilities-public-read");
```

This means:

- The Supabase helper is not called on module import.
- The Supabase helper is not called by default.
- Existing static functions do not trigger Supabase reads.
- Public pages do not trigger Supabase reads unless they are explicitly changed later.

## Fallback Findings

The wrapper preserves static fallback.

Fallback behavior:

- Non-preview mode returns static cards.
- Supabase unavailable result returns static cards.
- Supabase error result returns static cards.
- Supabase empty success result returns static cards during MVP testing.

Fallback results include a safe `fallbackReason` value and do not expose raw Supabase errors.

## Missing Env, Error, And Empty Result Findings

Missing env behavior:

- The Supabase env helper checks only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Missing values produce an unavailable result in the helper.
- The source wrapper falls back to static cards with `fallbackReason: "supabase-unavailable"`.

Query failure behavior:

- The facilities read helper returns a generic failed-read state.
- The source wrapper falls back to static cards with `fallbackReason: "supabase-error"`.
- Raw Supabase errors are not surfaced by the wrapper.

Empty result behavior:

- Supabase success with zero cards falls back to static cards for MVP testing.
- The wrapper marks this as `fallbackReason: "supabase-empty"`.

## Public Page Behavior Findings

Public page behavior remains unchanged.

No page imports were changed. No public page calls `getPublicFacilityCardsFromSource`.

Current public pages continue to use the existing static source paths, so the homepage, search page, facilities page, facility detail page, and other public routes should continue rendering static data.

## Service Role Safety Findings

No service-role key is used or referenced by the source wrapper switch.

The reviewed path uses:

- Existing browser env helper
- Existing browser client helper
- Public anon Supabase client path only
- Public facilities read helper only when explicitly requested

No auth, server/admin client, write query, insert, update, delete, RPC, private field, or protected route behavior was added.

## Lint And Build Results

Results from this QA pass:

- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed.

Build details:

- Next.js `16.2.6`
- `.env.local` detected by the build
- TypeScript completed successfully
- `22` static routes generated

## Issues Found

No blocking issues were found in the source wrapper switch review.

Non-blocking follow-up:

- The helper still maps Supabase verification values `unverified`, `disputed`, and `expired` to the current frontend `community-submitted` status. This remains safe but should be revisited if the UI needs more precise verification labels.

## Recommended Next Steps

1. Keep public pages on static data until a page wiring task is explicitly approved.
2. Add a focused source-wrapper QA utility or test task to call `getPublicFacilityCardsFromSource` in both modes.
3. Verify default calls return static cards.
4. Verify preview mode returns active/public Supabase rows when env and test data are available.
5. Verify missing env, query failure, and empty result paths return static fallback.
6. Decide whether to expand frontend verification statuses before public page wiring.
7. Document the source-wrapper runtime QA result before wiring facilities pages.
