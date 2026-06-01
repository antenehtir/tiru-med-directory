# DigitalDirectory-v2 Facilities Supabase Preview Mode Planning

## Purpose

This document plans how to enable Supabase-backed preview mode for the `/facilities` page in a controlled and reversible way.

This is planning only. It does not enable Supabase preview mode, modify app code, modify frontend UI, add authentication, add backend functionality, add protected routes, add SQL, add migrations, add RLS policies, insert test data, add patient data, or add booking, payment, document, or admin workflows.

## Preview Mode Purpose

Preview mode should let the team verify Supabase-backed facility listing reads on the real `/facilities` page without making Supabase the general public listing source.

The purpose is to confirm:

- The page can consume the existing source wrapper in Supabase preview mode.
- Static fallback still protects the user experience.
- Only active/public facility rows appear from Supabase.
- Blocked rows remain hidden.
- The UI stays visually stable.
- Rollback is fast and simple.

## Why Preview Mode Should Be `/facilities` Only

Preview mode should be limited to `/facilities` because facilities are the first provider type with the full preparation path:

- Facilities SQL table draft exists.
- Facilities RLS draft exists.
- Facilities test data draft exists.
- Manual SQL execution QA exists.
- Local env setup QA exists.
- Facilities public read helper exists.
- Facilities source wrapper opt-in mode exists.
- `/facilities` is already wired to the source wrapper in default static mode.

No other public page should be included in the first preview.

## Preview Mode Activation Options

Possible activation options for a later implementation:

1. Hardcoded local preview call in `src/app/facilities/page.tsx`.
2. A non-secret environment variable that selects the source mode.
3. A small internal-only preview helper used during local QA.

Recommended first option:

- Use a narrowly scoped implementation task that changes only `/facilities` to request `supabase-facilities-preview`.
- Keep the change easy to revert.
- Do not introduce a broad feature flag until the first page preview is proven.

Do not enable preview mode in this planning task.

## Recommended Preview Behavior

When preview mode is enabled later, `/facilities` should call:

```ts
getPublicFacilityCardsFromSource({
  mode: "supabase-facilities-preview",
});
```

Expected behavior:

- If Supabase returns active/public cards, render those cards through the existing page/card UI.
- If Supabase is unavailable, fall back to static cards.
- If the query fails, fall back to static cards.
- If Supabase returns an empty card list, fall back to static cards during MVP testing.
- Do not show raw Supabase errors in public UI.
- Do not import the direct Supabase helper into the page.

## Expected Supabase Rows

The confirmed active/public rows expected from the Supabase test project are:

- `test-facility-alpha` - Test Facility Alpha - active/public - verified
- `test-facility-eta-minimal` - Test Facility Eta Minimal - active/public - unverified
- `test-facility-zeta-disputed` - Test Facility Zeta Disputed - active/public - disputed

Preview QA should verify these rows are the only Supabase rows rendered by the preview path.

## Blocked Rows That Must Not Appear

The following rows exist for negative testing and must not appear in preview-mode public results:

- `test-facility-beta-pending`
- `test-facility-gamma-archived`
- `test-facility-delta-hidden`
- `test-facility-epsilon-internal`

These rows should remain hidden because they are not both `active` and `public`.

## Static Fallback Behavior

Static fallback must remain active.

Fallback should use the existing static facility cards when:

- Preview mode is not enabled.
- Supabase env values are missing.
- The Supabase browser client is unavailable.
- The Supabase query fails.
- Supabase returns an empty result during MVP testing.

Fallback should preserve the current `/facilities` page appearance and avoid visible user disruption.

## Missing Env Behavior

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing:

- The Supabase env helper should report unavailable state.
- The browser client should return `null`.
- The facilities read helper should return an unavailable/fallback-safe result.
- The source wrapper should return static cards.
- `/facilities` should continue rendering.
- Build should still pass.

Missing env must not crash imports, page rendering, or build.

## Query Failure Behavior

If the Supabase facilities query fails:

- The direct helper should return a generic error state.
- The source wrapper should return static facility cards.
- `/facilities` should not show raw Supabase errors.
- No service-role key should be used as a fallback.
- RLS should not be disabled to make the query pass.

Failure should be treated as a QA signal, not a reason to weaken security.

## Empty Result Behavior

During MVP testing, empty Supabase success should fall back to static cards.

Empty result QA should check:

- Whether the test project has active/public rows.
- Whether the app points at the intended test project.
- Whether RLS is filtering correctly.
- Whether local env values are from the right project.

Do not treat empty results as public launch readiness until the expected test rows are confirmed.

## UI Stability Expectations

Preview mode should not redesign `/facilities`.

Expected UI stability:

- Keep the same page shell.
- Keep the same hero.
- Keep the same search preview and category filters.
- Keep the same facility results section.
- Keep the same `FacilityCardGrid` and `FacilityCard` components.
- Keep the same trust and request facility addition sections.
- Avoid new loading states, banners, badges, debug labels, or empty states unless separately planned.

The preview should test source behavior, not visual design.

## Local QA Plan

Local QA for preview mode should include:

1. Confirm default `/facilities` still renders static cards.
2. Enable preview mode only for `/facilities`.
3. Confirm the page renders expected active/public Supabase test rows.
4. Confirm blocked rows do not appear.
5. Confirm static fallback when env values are missing.
6. Confirm static fallback when the query fails.
7. Confirm static fallback when Supabase returns an empty result.
8. Confirm no other public route switches data source.
9. Confirm no raw Supabase errors appear in UI.
10. Run `npm.cmd run lint`.
11. Run `npm.cmd run build`.

Manual browser QA should compare spacing, card wrapping, buttons, and mobile layout against the current static page.

## Build And Deployment Safety

Preview mode should be treated as local/test-only until a separate release decision is made.

Safety rules:

- Do not enable preview mode by default in production.
- Do not commit `.env.local`.
- Do not expose real Supabase keys in docs, screenshots, logs, or commits.
- Do not add service-role keys to browser code.
- Do not add writes, auth, protected routes, or backend behavior.
- Confirm `/facilities` still builds and renders if env values are missing.
- Confirm static fallback remains available before deployment.

## Rollback Plan

Rollback should require only one small change:

1. Remove the explicit `supabase-facilities-preview` request from `/facilities`.
2. Return to the default `getPublicFacilityCardsFromSource()` call.
3. Confirm `/facilities` renders static cards.
4. Run lint and build.
5. Leave SQL, RLS, and test data unchanged unless there is a separate database issue.

Rollback should not require UI redesign, route changes, or Supabase schema changes.

## Relationship To Current Source Wrapper

The source wrapper already supports:

- Default static mode.
- Explicit `supabase-facilities-preview` mode.
- Static fallback for unavailable, error, and empty results.
- Dynamic import of the Supabase facilities helper only when preview mode is requested.

Preview mode should use this wrapper and should not bypass it.

## Relationship To Facilities Read Helper

The facilities read helper already:

- Uses the browser Supabase client.
- Selects only public-safe fields.
- Filters `listing_status = active`.
- Filters `visibility_status = public`.
- Orders by `display_name`.
- Maps rows to `PublicProviderCard`.
- Avoids service-role usage.
- Avoids raw Supabase errors in UI-facing return values.

The `/facilities` page should not import this helper directly.

## What Must Not Be Implemented Yet

Do not implement the following in this planning task:

- Supabase preview mode activation.
- App code changes.
- UI changes.
- Feature flags.
- Search wiring.
- Nearby wiring.
- Facility detail wiring.
- Homepage wiring.
- Doctors, pharmacies, or diagnostics wiring.
- SQL, migrations, or RLS changes.
- Test data inserts.
- Authentication.
- Backend functionality.
- Protected routes.
- Patient, booking, payment, document, notification, or admin workflows.

## Recommended Next Development Order

1. Review this preview mode plan.
2. Create a focused implementation task to enable preview mode only on `/facilities`.
3. Keep the change easy to roll back.
4. Run lint and build.
5. Perform local browser QA on desktop and mobile.
6. Verify expected active/public rows appear.
7. Verify blocked rows do not appear.
8. Verify fallback behavior.
9. Document the preview-mode QA result.
10. Only after QA passes, plan broader public read behavior.
