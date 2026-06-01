# DigitalDirectory-v2 Facilities Source Wrapper Controlled Switch Planning

## Purpose

This document plans a future controlled switch for facilities data from static seed data toward a Supabase-backed facilities source.

This is a planning-only document. It does not modify the source wrapper, wire public pages to Supabase, add feature flags, change UI, add SQL, add migrations, add RLS policies, insert data, add authentication, add backend functionality, or add protected routes.

## Controlled Switch Purpose

The controlled switch should let DigitalDirectory-v2 test Supabase-backed facilities reads without risking public page stability.

The switch should:

- Keep static data as the default and fallback source.
- Use the facilities public read helper only when explicitly enabled later.
- Preserve current public listing behavior until QA approves the change.
- Avoid exposing private fields, raw Supabase errors, or service-role logic.
- Make rollback simple if Supabase reads fail, return empty data unexpectedly, or behave differently from static data.

## Why Source Wrapper Should Switch Before Pages

The source wrapper should become the first integration point because it already owns public listing data access.

Switching inside the wrapper before touching pages helps:

- Keep page components stable.
- Avoid duplicating source-selection logic across pages.
- Preserve the current UI and route behavior.
- Centralize fallback handling.
- Centralize logging or status reporting later.
- Make the Supabase read path easier to disable.

Public pages should continue calling the same source-wrapper functions where possible.

## Static-First Default Rule

Static seed data must remain the default source until a later implementation task explicitly changes behavior.

Default rule:

- Missing feature control means static data.
- Missing Supabase env means static data.
- Supabase client unavailable means static data.
- Supabase query failure means static data.
- Unexpected Supabase result shape means static data.

Static fallback should be treated as a product safety feature, not a temporary workaround.

## Supabase Facilities Source Option

The future Supabase facilities option should use:

- `src/lib/supabase/facilities-public-read.ts`
- The existing browser client helper
- Public anon access only
- Public-safe fields only
- `listing_status = 'active'`
- `visibility_status = 'public'`
- Static fallback for unavailable or failed reads

The source wrapper should not use the service-role key, authenticated sessions, server-only clients, private fields, or admin tables.

## Source Mode Options

Future source modes should stay simple and explicit.

Recommended modes:

- `static`: current default; all public listing data comes from seed files.
- `supabase-facilities-preview`: facilities can be read from Supabase when available, while all other provider types remain static.
- `supabase-public-preview`: future broader mode for multiple public listing types after facilities QA passes.

Avoid making Supabase the implicit default in early phases.

## Environment Flag Planning

A future implementation can introduce a controlled public source mode flag, but this task does not add one.

Possible future variable name:

```text
NEXT_PUBLIC_PUBLIC_LISTING_SOURCE_MODE=static
```

Possible future values:

- `static`
- `supabase-facilities-preview`
- `supabase-public-preview`

Rules for a future flag:

- Default to `static` if missing or invalid.
- Treat unknown values as `static`.
- Keep the value non-secret.
- Do not use the flag to enable writes, auth, admin access, or protected routes.
- Document the flag before enabling it in deployment.

## Fallback Behavior

The source wrapper should use static fallback when Supabase cannot safely provide public facility cards.

Recommended wrapper behavior:

1. Check the source mode.
2. If mode is `static`, return static facilities.
3. If mode allows Supabase facilities, call `getSupabasePublicFacilityCards`.
4. If the helper returns `success`, use Supabase cards.
5. If the helper returns `unavailable` or `error`, return static facilities.
6. Preserve a source status object so QA can confirm what happened.

Fallback should not show raw database errors in UI.

## Missing Env Behavior

When `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing:

- The browser env helper returns unavailable state.
- The browser client returns `null`.
- The facilities public read helper recommends static fallback.
- The source wrapper should return static facilities.
- Public pages should remain usable.

Missing env must not crash build, import, or page rendering.

## Query Failure Behavior

If the Supabase facilities query fails:

- Do not expose raw Supabase error details to public UI.
- Return static facility cards from the wrapper.
- Keep a safe source status for QA or development review.
- Avoid retry loops in the first implementation.
- Do not switch to service-role credentials.
- Do not disable RLS to make the query pass.

The public user experience should remain stable.

## Empty Result Behavior

An empty Supabase result can mean either no active/public rows exist or a setup issue exists.

Recommended first implementation behavior:

- Treat `success` with an empty card list as a valid Supabase response.
- During QA, compare against the known test data from `docs/FacilitiesSQLManualExecutionQA.md`.
- If active/public test rows are expected but missing, investigate RLS, env, project selection, or test data setup.
- Do not silently treat empty Supabase success as failure unless the source mode plan explicitly requires that.

For public launch readiness, define whether an empty result should show an empty state or fall back to static data.

## Public Page Wiring Strategy

Public pages should not be wired directly to Supabase.

Recommended strategy:

- Keep pages reading from source-wrapper functions.
- Update wrapper behavior first.
- Avoid importing Supabase helpers into page components.
- Preserve existing component props and card shapes.
- Add page wiring only after source wrapper QA passes.
- Start with facilities list/search surfaces before detail pages.

The wrapper should absorb source complexity so the UI stays calm and predictable.

## Local QA Strategy

Local QA should confirm:

- Static mode still returns current seed facilities.
- Missing env still returns static facilities.
- Supabase facilities preview mode returns only active/public rows when env is present.
- Query failure returns static fallback.
- Public pages remain unchanged until explicitly wired.
- Build and lint pass.
- No real keys are committed.
- `.env.local` stays ignored.

Use the confirmed active/public test rows:

- `test-facility-alpha`
- `test-facility-eta-minimal`
- `test-facility-zeta-disputed`

Also confirm blocked rows do not appear through the anon Supabase path.

## Build And Deployment Safety

Build and deployment safety rules:

- Default source mode must be static.
- Missing env must not fail build.
- Invalid mode must fall back to static.
- Public pages must remain static unless explicitly switched.
- Vercel or deployment env values must be reviewed before enabling Supabase preview modes.
- Real keys must not be committed.
- The service-role key must not be available to browser code.

Every source-switch implementation should run:

```text
npm.cmd run lint
npm.cmd run build
```

## Rollback Plan

Rollback should be simple:

1. Set source mode back to `static`, or remove the source mode variable if missing means static.
2. Restart local or deployment runtime if env changed.
3. Confirm source wrapper reports static mode.
4. Confirm public pages render existing static data.
5. Keep Supabase SQL and test data untouched unless a separate database rollback is required.

Rollback should not require page rewrites.

## Relationship To Facilities Public Read Helper

`src/lib/supabase/facilities-public-read.ts` is the future read path for public facilities.

The helper already:

- Uses the browser client helper.
- Selects public-safe fields only.
- Filters active/public rows.
- Orders by `display_name`.
- Maps rows to `PublicProviderCard`.
- Returns fallback-safe unavailable and error states.
- Avoids raw Supabase errors in UI-facing results.
- Avoids service-role usage.

The source wrapper should consume this helper only in a later implementation task.

## Relationship To Public Listing Source Wrapper

`src/lib/public-listing-source.ts` currently remains static-only.

Future wrapper changes should:

- Keep existing public functions stable where possible.
- Add mode/status reporting without breaking current imports.
- Add Supabase facilities preview as an optional path.
- Keep doctors, pharmacies, and diagnostics static until their own read helpers and QA exist.
- Preserve static fallback for every public source function.

## What Must Not Be Implemented Yet

Do not implement the following yet:

- Source wrapper code changes.
- Page wiring to Supabase.
- Feature flag code.
- UI changes.
- SQL changes.
- New migrations.
- New RLS policies.
- Test data inserts.
- Authentication.
- Backend routes.
- Protected routes.
- Admin workflows.
- Provider ownership workflows.
- Patient data, booking, payment, document, or notification workflows.

## Recommended Next Development Order

1. Review this controlled switch plan.
2. Define the exact source mode type and env variable name for a later implementation.
3. Add source wrapper support for static and Supabase facilities preview modes.
4. Keep static as the default and fallback.
5. Run lint and build.
6. QA missing-env, query-failure, empty-result, and active/public success cases.
7. Document the source wrapper QA result.
8. Only after wrapper QA passes, plan public page wiring.
9. Expand to other provider types only after facilities source switching is proven safe.
