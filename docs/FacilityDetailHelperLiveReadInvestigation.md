# DigitalDirectory-v2 Facility Detail Helper Live Read Investigation

## Scope

This document records the Task 94 investigation into why the temporary shell-based facility detail helper test returned generic error states even though the `/facilities` list read has been confirmed working in the app/browser flow.

This task does not wire facility detail routes, modify frontend UI, add authentication, add backend functionality, add protected routes, add SQL/RLS/test data, use a service-role key, expose environment values, expose keys, or commit changes.

## Files Reviewed

Documentation reviewed:

- `docs/FacilityDetailReadPlanning.md`
- `docs/FacilityDetailReadHelperQA.md`
- `docs/CodexTask-92-FacilityDetailSupabaseReadHelperImplementation.md`
- `docs/CodexTask-93-FacilityDetailReadHelperQA.md`
- `docs/CodexTask-94-FacilityDetailHelperLiveReadInvestigation.md`

Implementation files reviewed:

- `src/lib/supabase/facilities-public-read.ts`
- `src/lib/supabase/public-client.ts`
- `src/lib/supabase/env.ts`
- `src/lib/public-listing-source.ts`
- `src/types/public-listings.ts`
- `src/lib/public-listing-mappers.ts`

## Current Context

The `/facilities` list page has a confirmed manual browser QA result showing active/public Supabase rows:

- Test Facility Alpha
- Test Facility Eta Minimal
- Test Facility Zeta Disputed

The facility detail helper added in Task 92 is intentionally not wired into any route yet.

Current helper:

```text
getSupabasePublicFacilityDetailBySlug(slug: string)
```

Current helper location:

```text
src/lib/supabase/facilities-public-read.ts
```

## Helper Query Syntax Findings

The detail helper query is shaped correctly for the planned public detail read:

```text
from facilities
select approved public fields
slug = requested slug
listing_status = active
visibility_status = public
limit 1
maybeSingle
```

The helper queries only the facilities table and does not query unrelated provider types, private tables, auth tables, admin tables, patient data, booking data, payment data, or document data.

Status:

```text
No query syntax issue found
```

## Single Vs MaybeSingle Findings

The helper already uses:

```text
maybeSingle()
```

This is the correct behavior for public detail lookup because it allows an eligible missing row to become a safe `not-found` result instead of treating no result as a query error.

No `.single()` issue was found.

Status:

```text
No fix needed
```

## Selected Field Findings

The helper uses the shared public select list:

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

These fields match the approved public-safe facilities read scope used by the list helper.

No private provider contacts, admin notes, reviewer notes, verification evidence, patient data, booking data, payment data, document data, or internal request payloads are selected.

Status:

```text
No selected-field issue found
```

## Mapper And Type Findings

The helper maps a successful Supabase row into `PublicProviderDetail`.

Mapping findings:

- It reuses the same public card mapping path as the list helper.
- It creates a safe public location object from the public location label.
- It creates an optional address from `address_public` and `landmark_public`.
- It keeps contact channels empty because reviewed public contact-channel tables are not implemented yet.
- It uses a safe public verification note.
- It creates a correction href from the public slug.

No mapper exception or type-shape issue was found during static review.

Status:

```text
No mapper/type issue found
```

## Public Client Availability Findings

A temporary shell test was run without committing scripts and without printing environment values.

The test used Next's local environment loader and then checked only safe availability metadata.

Findings:

- Public Supabase env availability: available.
- Missing public env key count: `0`.
- Public Supabase client created: yes.
- No service-role key was used.
- No real environment values were printed.

Status:

```text
Public client setup is available in the temporary runner
```

## Temporary Runner Query Findings

The temporary runner then attempted a minimal public facilities query with the public anon client.

Sanitized result:

- Data returned: no.
- Error returned: yes.
- Error key shape: `message`, `details`, `hint`, `code`.
- Error code value: blank.
- HTTP status: `0`.
- Error text category: fetch-style failure.

The same temporary runner also invoked:

- `getSupabasePublicFacilityCards`
- `getSupabasePublicFacilityDetailBySlug`

Both returned generic `error` states in that shell context.

Interpretation:

The generic error is not specific to the new detail helper. The existing list helper also fails in the same temporary shell runner, even though `/facilities` has a confirmed browser QA success record. This points to a temporary-runner/network/fetch limitation in the shell context, not a detail query syntax issue.

## Requested Slug Existence Findings

The requested positive slugs are known from the manually confirmed facilities test data and list-page QA:

- `test-facility-alpha`
- `test-facility-eta-minimal`
- `test-facility-zeta-disputed`

The requested blocked slugs are known blocked test rows:

- `test-facility-beta-pending`
- `test-facility-gamma-archived`
- `test-facility-delta-hidden`
- `test-facility-epsilon-internal`

Because the temporary runner could not complete even the existing list helper read, this investigation could not independently confirm slug-level live detail results from the shell.

## Error Handling Findings

The helper intentionally hides raw Supabase errors from UI-facing return values.

This remains correct for public UI safety.

However, the Task 93 result showed that the helper's generic `error` state is not enough by itself to distinguish:

- query syntax errors
- RLS errors
- network/fetch failures
- unavailable Supabase project
- temporary runner limitations

Recommendation:

- Keep public-facing helper errors generic.
- If deeper diagnostics are needed later, add developer-only diagnostics behind a separate reviewed task.
- Do not expose raw errors to public UI.

No error-shape fix was made in this task.

## Route Wiring Findings

Search confirmed the detail helper is not wired into any route.

Current references in `src`:

- `src/lib/supabase/facilities-public-read.ts`

The existing detail route remains static:

```text
src/app/facilities/addis-health-center/page.tsx
```

It still renders the static `FacilityDetailPage` component.

Status:

```text
Route isolation preserved
```

## Positive Slug Result

Positive slugs tested in the temporary runner:

- `test-facility-alpha`
- `test-facility-eta-minimal`
- `test-facility-zeta-disputed`

Expected:

```text
success with detail
```

Observed:

```text
error
detail: null
source: static-fallback
fallbackRecommended: true
```

Root interpretation:

The shell runner could not complete public Supabase reads at all, including the already-working list helper. The positive slug result is therefore inconclusive in this runner.

## Blocked Slug Result

Blocked slugs tested in the temporary runner:

- `test-facility-beta-pending`
- `test-facility-gamma-archived`
- `test-facility-delta-hidden`
- `test-facility-epsilon-internal`

Expected:

```text
not-found
detail: null
```

Observed:

```text
error
detail: null
source: static-fallback
fallbackRecommended: true
```

Root interpretation:

The shell runner could not reach a clean query result. The helper still applies the required active/public filters, so blocked rows should remain unavailable when the read path can execute successfully.

## Unknown Slug Result

Unknown slug tested:

```text
unknown-facility-slug
```

Expected:

```text
not-found
detail: null
```

Observed:

```text
error
detail: null
source: static-fallback
fallbackRecommended: true
```

Root interpretation:

The shell runner could not reach a clean empty-result query. The helper uses `maybeSingle()` and returns `not-found` when Supabase successfully returns no eligible row.

## Root Cause

The likely root cause of the Task 93 temporary helper failure is the temporary shell runner's inability to complete the public Supabase fetch from this execution context.

Evidence:

- The public environment was available.
- The public Supabase client was created.
- A minimal direct public facilities query failed with HTTP status `0` and a fetch-style failure.
- The existing list helper also returned generic `error` in the same temporary runner.
- The `/facilities` list read has a separate confirmed browser QA success record.

No detail-helper-specific query syntax, `.single()`/`.maybeSingle()`, selected-field, mapper, type, route-wiring, or service-role issue was found.

## Fix Implemented

No code fix was implemented.

Reason:

- The detail helper already uses `maybeSingle()`.
- The active/public filters are present.
- The selected fields are public-safe.
- The mapper shape is safe.
- The public client path is correct.
- The helper is not wired into routes.
- The observed failure also affects the existing list helper in the same temporary runner.

Changing app code based on this shell-only fetch failure would risk solving the wrong problem.

## Checks Run

Temporary investigation checks:

- Reviewed helper code and planning docs.
- Verified helper export exists.
- Verified `.maybeSingle()` is used.
- Verified no service-role key reference in the public read path.
- Verified no route imports the detail helper.
- Ran temporary local helper tests without committing scripts.
- Ran a sanitized direct public client query check without printing keys or raw error payloads.

Verification commands after this document:

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

## Remaining Issues

Remaining issue:

- The shell-based temporary runner cannot confirm live detail reads because public Supabase fetches fail from that execution context.

Before wiring a detail route, the next QA should use an app/runtime path that matches the successful `/facilities` browser behavior.

## Recommended Next Steps

1. Keep the detail helper unwired.
2. Do not add a dynamic `[slug]` route yet.
3. Do not change query syntax unless a Next-runtime detail diagnostic finds a helper-specific issue.
4. Add a future reviewed diagnostic path or test harness that runs inside the Next runtime if live helper confirmation is required.
5. Confirm positive slugs return `success` with detail in that runtime.
6. Confirm blocked and unknown slugs return `not-found` in that runtime.
7. Keep raw errors out of public UI.
8. Keep service-role keys out of the public read path.
9. Run lint/build after any future helper or wrapper changes.

## Summary

The facility detail helper appears structurally correct and safely isolated. The temporary shell failure is best explained by a fetch/network limitation in the shell runner because the existing list helper fails there too, while `/facilities` has been confirmed working in browser QA.

No code change was made.
