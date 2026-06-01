# DigitalDirectory-v2 Facility Detail Read Helper QA

## Scope

This document records the Task 93 QA pass for the facility detail Supabase public read helper.

The QA scope is limited to the helper layer. This task does not wire any facility detail route, modify frontend UI, add authentication, add backend functionality, add protected routes, add SQL/RLS/test data, use a service-role key, expose environment values, or commit changes.

## Files Reviewed

Documentation reviewed:

- `docs/FacilityDetailReadPlanning.md`
- `docs/FacilitiesSupabasePreviewStabilizationQA.md`
- `docs/CodexTask-92-FacilityDetailSupabaseReadHelperImplementation.md`
- `docs/CodexTask-93-FacilityDetailReadHelperQA.md`

Implementation files reviewed:

- `src/lib/supabase/facilities-public-read.ts`
- `src/lib/supabase/public-client.ts`
- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`

## Helper Existence

The helper exists in:

```text
src/lib/supabase/facilities-public-read.ts
```

Export reviewed:

```text
getSupabasePublicFacilityDetailBySlug(slug: string)
```

Status:

```text
Pass
```

## Public Anon Client Safety

The helper uses:

```text
getSupabasePublicClientStatus()
getSupabasePublicClient()
```

These helpers are provided by:

```text
src/lib/supabase/public-client.ts
```

The reviewed public client uses only the existing public env helper, which reads:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

No service-role key is used or referenced in the helper path.

Status:

```text
Pass
```

## Query Scope

The helper queries only:

```text
facilities
```

This maps to the public facilities table planned as:

```text
public.facilities
```

The helper does not query doctors, pharmacies, diagnostics providers, search, nearby, facility detail routes, patient data, booking data, payment data, document data, admin data, or protected-route data.

Status:

```text
Pass
```

## Public-Safe Selected Fields

The helper uses the shared facilities public select list:

```text
id
slug
display_name
facility_type
category
description
city
area
address_public
landmark_public
listing_status
visibility_status
verification_status
last_confirmed_at
```

No private provider fields, admin notes, reviewer notes, verification evidence, submitter data, patient data, booking data, payment data, document data, or internal request payloads are selected.

Status:

```text
Pass
```

## Active/Public Filters

The helper applies all required filters:

```text
slug = requested slug
listing_status = active
visibility_status = public
```

It also limits the result to one row and uses `maybeSingle()` for a nullable single-record result.

Status:

```text
Pass
```

## Return Shape

The helper returns a typed safe result union:

- `success` with `detail: PublicProviderDetail`
- `not-found` with `detail: null`
- `unavailable` with `detail: null`
- `error` with `detail: null`

The helper recommends fallback for not-found, unavailable, and error states.

Status:

```text
Pass
```

## Error Safety

The helper does not expose raw Supabase errors in its return value.

On query failure, it returns:

```text
errorCode: FACILITY_DETAIL_PUBLIC_READ_FAILED
message: Supabase facility detail public read failed. Use static facility detail data.
```

No database error object, SQL message, project URL, key, policy name, or environment value is exposed.

Status:

```text
Pass
```

## Route Wiring Check

Search results show the helper is not wired into any route yet.

Current references found:

- Helper definition in `src/lib/supabase/facilities-public-read.ts`
- Task QA documentation references

The existing facility detail route remains:

```text
src/app/facilities/addis-health-center/page.tsx
```

That route still renders the static `FacilityDetailPage` component and does not import the Supabase detail helper.

Status:

```text
Pass
```

## Temporary Local Helper Test

A temporary local helper invocation was attempted without committing scripts.

Safety constraints followed:

- No real environment values were printed.
- No keys were printed.
- No service-role key was used.
- No raw Supabase error payload was printed.
- No route was wired.
- No app code or UI was modified for the test.

The temporary runner loaded only the two public variable names from local env:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

The temporary runner invoked:

```text
getSupabasePublicFacilityDetailBySlug
```

It also invoked the existing list helper once for comparison.

## Positive Slug QA Result

Positive slugs tested:

- `test-facility-alpha`
- `test-facility-eta-minimal`
- `test-facility-zeta-disputed`

Expected:

```text
success with detail
```

Observed in the temporary local runner:

```text
error
detail: null
source: static-fallback
fallbackRecommended: true
```

Comparison result:

- The existing list helper also returned the same generic `error` state in the same temporary runner.

Interpretation:

The temporary runner did not confirm live positive slug success. Because the existing list helper also returned a generic error under the same runner, this appears to be an environment/diagnostic-runner limitation or live read availability issue in this shell context rather than evidence of a detail-helper-specific wiring problem.

Status:

```text
Inconclusive live-read result in temporary runner
```

## Blocked Slug QA Result

Blocked slugs tested:

- `test-facility-beta-pending`
- `test-facility-gamma-archived`
- `test-facility-delta-hidden`
- `test-facility-epsilon-internal`

Expected:

```text
not-found
detail: null
```

Observed in the temporary local runner:

```text
error
detail: null
source: static-fallback
fallbackRecommended: true
```

Interpretation:

The temporary runner did not reach a clean blocked-row not-found confirmation. The helper code still applies the required active/public filters, so blocked rows should not be returned when the Supabase read path is available.

Status:

```text
Inconclusive live-read result in temporary runner
```

## Unknown Slug QA Result

Unknown slug tested:

```text
unknown-facility-slug
```

Expected:

```text
not-found
detail: null
```

Observed in the temporary local runner:

```text
error
detail: null
source: static-fallback
fallbackRecommended: true
```

Interpretation:

The temporary runner did not reach a clean unknown-slug not-found confirmation. The helper code uses `maybeSingle()` and returns `not-found` when the query succeeds with no eligible row.

Status:

```text
Inconclusive live-read result in temporary runner
```

## Lint And Build Results

Commands run after creating this QA record:

```text
npm.cmd run lint
npm.cmd run build
```

Results:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Build used Next.js `16.2.6`.
- Build detected `.env.local`.
- Build output kept `/facilities` dynamic.
- Build output kept `/facilities/addis-health-center` static.

## Issues Found

No static code-review blocker was found in the helper implementation.

Issue to review:

- The temporary local helper test returned generic `error` for all detail slugs.
- The existing list helper also returned generic `error` in the same temporary runner.
- This prevented live positive/not-found confirmation from the shell runner.
- A browser or Next runtime QA pass should be used before wiring the detail page.

## Recommended Next Steps

1. Keep the detail helper unwired.
2. Do not add a dynamic detail route yet.
3. Re-run helper QA in a Next runtime path or approved diagnostic route/task if live confirmation is required.
4. Confirm positive slugs return `success` with detail before wiring.
5. Confirm blocked and unknown slugs return `not-found` before wiring.
6. Keep static fallback and safe errors.
7. Keep service-role keys out of the public read path.
8. Run lint/build after any future helper or wrapper changes.

## Summary

The facility detail helper exists, uses the public anon client path, selects only public-safe fields, applies slug plus active/public filters, returns safe typed states, avoids raw Supabase error exposure, and is not wired into any route.

The temporary shell-based live read test was inconclusive because both the new detail helper and the existing list helper returned the same generic error state in that runner.
