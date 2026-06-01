# DigitalDirectory-v2 Facilities Supabase Preview Mode QA

## Scope

This document records the QA pass for Task 84 after enabling Supabase preview mode on the `/facilities` page.

The scope is limited to verifying that `/facilities` requests Supabase-backed facility cards through the public listing source wrapper, that static fallback remains available, that route isolation remains intact, and that lint/build still pass.

This QA pass does not modify frontend UI, add authentication, add backend functionality, add protected routes, add SQL, add migrations, add RLS policies, insert test data, add patient data, add booking/payment/document/admin workflows, or wire search, nearby, detail, doctors, pharmacies, or diagnostics pages.

## Files Reviewed

Planning and QA documents reviewed:

- `docs/ProductVision.md`
- `docs/Architecture.md`
- `docs/DevelopmentRoadmap.md`
- `docs/SupabaseBackendPlanning.md`
- `docs/SupabaseIntegrationPhase1.md`
- `docs/SupabaseEnvironmentSetupGuide.md`
- `docs/SupabaseTestProjectManualSetupGuide.md`
- `docs/SupabaseLocalEnvSetupGuide.md`
- `docs/SupabaseLocalEnvManualSetupQA.md`
- `docs/PublicListingSchemaSQLPlanning.md`
- `docs/FacilitiesSQLManualExecutionQA.md`
- `docs/SupabasePublicListingReadPlanning.md`
- `docs/SupabasePublicListingTestDataSetupPlan.md`
- `docs/PublicListingSourceWrapperQAPass.md`
- `docs/FacilitiesPublicReadQAPass.md`
- `docs/FacilitiesSourceWrapperControlledSwitchPlanning.md`
- `docs/FacilitiesSourceWrapperSwitchQAPass.md`
- `docs/FacilitiesPageControlledWiringPlanning.md`
- `docs/FacilitiesPageControlledWiringQAPass.md`
- `docs/FacilitiesSupabasePreviewModePlanning.md`
- `docs/CodexTask-82-FacilitiesSupabasePreviewModePlanning.md`
- `docs/CodexTask-83-FacilitiesSupabasePreviewModeImplementation.md`
- `docs/CodexTask-84-FacilitiesSupabasePreviewModeQA.md`

Implementation files reviewed:

- `src/app/facilities/page.tsx`
- `src/components/facilities/FacilitiesPage.tsx`
- `src/lib/public-listing-source.ts`
- `src/lib/supabase/facilities-public-read.ts`
- `src/lib/supabase/env.ts`
- `src/lib/supabase/browser-client.ts`
- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`

## Preview Mode Findings

`src/app/facilities/page.tsx` now requests preview mode through the source wrapper:

```ts
getPublicFacilityCardsFromSource({
  mode: "supabase-facilities-preview",
});
```

The page does not import `getSupabasePublicFacilityCards` directly and does not duplicate Supabase query logic.

`src/lib/public-listing-source.ts` remains the controlled boundary:

- Static cards remain the default when no preview mode is requested.
- Supabase preview mode is explicit.
- The Supabase helper is dynamically imported only when preview mode is requested.
- Static fallback is returned when Supabase is unavailable, errors, or returns an empty result.

## Supabase Row Findings

The expected active/public Supabase test rows are:

- `test-facility-alpha` - Test Facility Alpha - active/public - verified
- `test-facility-eta-minimal` - Test Facility Eta Minimal - active/public - unverified
- `test-facility-zeta-disputed` - Test Facility Zeta Disputed - active/public - disputed

Build artifact inspection did not find those expected Supabase test rows in the generated `/facilities` output.

The generated `/facilities` output contained the static facility cards instead, including:

- Addis Health Center
- Unity Medical Clinic
- Sunrise Diagnostic Lab
- Kazanchis Community Clinic

QA interpretation:

- The page is correctly requesting preview mode through the wrapper.
- During this build, the wrapper returned static fallback cards instead of Supabase cards.
- Live Supabase row rendering was not confirmed by this build artifact check.

## Blocked Row Exclusion Findings

The blocked rows expected not to appear are:

- `test-facility-beta-pending`
- `test-facility-gamma-archived`
- `test-facility-delta-hidden`
- `test-facility-epsilon-internal`

Build artifact inspection did not find these blocked rows in the generated `/facilities` output.

Because the page output used static fallback, this confirms blocked rows were not exposed in the rendered page, but it does not fully prove the live Supabase/RLS exclusion path in browser-rendered preview mode.

## Static Fallback Findings

Static fallback is working.

Evidence:

- The `/facilities` page requested preview mode.
- The generated page output used existing static facility cards.
- The route still rendered successfully.
- No blank facility section, runtime crash, or raw Supabase error appeared in the generated output.

This matches the intended MVP safety behavior for unavailable, failing, or empty Supabase preview results.

## UI Stability Findings

No frontend UI files were changed during this QA task.

Code review confirms:

- `FacilitiesPage` still renders the same hero, search preview, filters, facility results section, trust block, and request facility addition CTA.
- `FacilityCardGrid` and facility cards remain the visible card system.
- No loading state, debug banner, style change, route change, or new public-facing text was added.

The build output confirmed the `/facilities` route still generated successfully.

## Route Isolation Findings

Preview mode remains isolated to the `/facilities` list route.

No wiring changes were made to:

- Search
- Nearby
- Facility detail pages
- Doctors
- Pharmacies
- Diagnostics
- Homepage
- Registration, corrections, contact, feedback, auth/account previews, provider dashboard preview, patient account preview, booking preview, or admin review preview pages

The build still generated 22 static routes.

## Secret Safety Findings

Secret safety remains intact:

- No real Supabase URL or key is recorded in this document.
- No `.env.local` values were printed or documented.
- No service-role key is referenced by the browser helpers or facilities read path.
- The facilities helper uses only the public browser client helper.
- The helper reads only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` through existing env helpers.

## Browser QA Result

Browser QA was not performed in this pass.

Instead, QA used code review, lint, build, and generated build artifact inspection. A later browser QA pass should run the local app and visually confirm whether `/facilities` renders the expected Supabase preview rows when the test project is reachable.

## Lint And Build Results

Results from this QA pass:

- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed.

Build details:

- Next.js `16.2.6`
- `.env.local` detected
- TypeScript completed successfully
- 22 static routes generated
- `/facilities` generated as a static route

Generated artifact inspection:

- Expected active/public Supabase test rows were not found in the generated `/facilities` output.
- Blocked Supabase test rows were not found in the generated `/facilities` output.
- Static facility cards were found in the generated `/facilities` output.

## Issues Found

No blocking lint, build, UI, route isolation, or secret safety issue was found.

Non-blocking QA issue:

- Live Supabase preview-row rendering was not confirmed in the generated `/facilities` output. The page fell back to static cards during this build.

This is safe behavior, but a separate live browser/helper QA pass should confirm why the Supabase preview result was unavailable, errored, or empty in this environment before broadening the integration.

## Recommended Next Steps

1. Keep preview mode limited to `/facilities`.
2. Do not wire search, nearby, detail, doctors, pharmacies, or diagnostics pages yet.
3. Perform a focused local browser QA pass with the Supabase test project reachable.
4. Confirm whether `/facilities` renders the three expected active/public Supabase rows.
5. Confirm blocked rows remain hidden through the live preview path.
6. If fallback occurs again, inspect the source wrapper result safely without exposing env values or raw public UI errors.
7. Keep static fallback active until live preview QA is confirmed.
8. Run lint and build after any follow-up code change.
