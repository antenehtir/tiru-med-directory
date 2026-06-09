# Codex Task 161: Diagnostics Detail Read Planning

## Project

DigitalDirectory-v2

## Goal

Plan the diagnostics detail read flow before implementing a diagnostics detail helper or route.

This task defines how an individual diagnostics provider detail page should safely read and display one public diagnostics provider by slug.

This task follows:

* CodexTask-151-DiagnosticsDiscoverySchemaPlanning.md
* CodexTask-152-DiagnosticsTableSQLDraft.md
* CodexTask-153-DiagnosticsRLSPolicySQLDraft.md
* CodexTask-154-DiagnosticsTestDataSQLDraft.md
* CodexTask-155-DiagnosticsManualSQLExecutionGuide.md
* CodexTask-156-DiagnosticsSQLExecutionQARecord.md
* CodexTask-157-DiagnosticsPublicReadHelperImplementation.md
* CodexTask-158-DiagnosticsRuntimeProbe.md
* CodexTask-159-DiagnosticsPageSupabaseWiring.md
* CodexTask-160-DiagnosticsPageSupabaseWiringQA.md

---

## Important Context

The diagnostics listing page has now been wired to the diagnostics public read helper.

The diagnostics database setup has been manually verified:

* `public.diagnostic_providers` table exists.
* RLS is enabled.
* Public read policy allows only:

  * `listing_status = 'active'`
  * `visibility_status = 'public'`
* Total test rows: 8.
* Active/public rows: 6.
* Blocked rows: 2.

The next goal is to plan how `/diagnostics/[slug]` should safely read one diagnostics provider detail record.

---

## Main Objective

Create a planning document for the diagnostics detail read implementation.

Recommended target file:

```text
docs/CodexTask-161-DiagnosticsDetailReadPlanning.md
```

This task should not implement code.

---

## Detail Route Goal

The future route will likely be:

```text
src/app/diagnostics/[slug]/page.tsx
```

The future helper will likely be:

```text
src/lib/supabase/diagnostics-detail-read.ts
```

Recommended helper name:

```ts
getSupabasePublicDiagnosticDetailBySlug(slug)
```

Use existing pharmacy detail patterns as the primary guide.

---

## Required Planning Areas

The planning document should define:

1. Target route path.
2. Target helper file.
3. Expected helper name.
4. Public-safe fields for detail display.
5. Slug-based read behavior.
6. Active/public filtering behavior.
7. Safe fallback behavior.
8. Not-found behavior.
9. Error handling behavior.
10. Static fallback behavior if available.
11. Relationship to diagnostics listing helper.
12. What must not be implemented yet.
13. Validation plan for the next implementation task.

---

## Public-Safe Detail Fields

The future detail helper may select public-safe fields such as:

* id
* slug
* display_name
* diagnostic_provider_type
* category
* description
* city
* area
* address_public
* landmark_public
* services_public
* sample_collection_modes
* opening_hours_public
* result_turnaround_public
* appointment_required_preview
* walk_in_available
* home_sample_collection_preview
* listing_status
* visibility_status
* verification_status
* last_confirmed_at
* created_at
* updated_at

Only include `created_at` and `updated_at` if existing detail patterns use them safely.

Do not expose private/internal fields.

---

## Required Future Helper Behavior

The future helper should:

1. Accept a slug.
2. Sanitize or validate that slug safely.
3. Query `public.diagnostic_providers`.
4. Select public-safe fields only.
5. Filter by:

   * `slug = provided slug`
   * `listing_status = active`
   * `visibility_status = public`
6. Return a safe detail result.
7. Return not-found for pending, hidden, missing, or invalid slugs.
8. Never expose raw Supabase errors, URLs, anon keys, env values, or secrets.
9. Use static fallback only if a matching static diagnostics provider exists.
10. Avoid showing blocked rows.

---

## Expected Public Test Slugs

Future detail read should be able to return these public slugs:

```text
test-diagnostic-alpha-lab
test-diagnostic-eta-imaging
test-diagnostic-zeta-radiology
test-diagnostic-omega-pathology
test-diagnostic-kappa-mixed
test-diagnostic-lambda-home-sample
```

---

## Expected Blocked Slugs

Future detail read should not return these slugs:

```text
test-diagnostic-beta-pending
test-diagnostic-delta-hidden
```

These should resolve to not-found or safe unavailable behavior, not public detail display.

---

## Fallback Planning

If Supabase is unavailable, env is missing, or the query fails:

* Future detail route should not crash.
* If a matching static diagnostics provider exists, it may render fallback detail.
* If no matching static diagnostics provider exists, it should return safe not-found behavior.
* No raw technical details should be shown to users.

Follow the pharmacy detail fallback pattern.

---

## Not-Found Planning

The future route should handle these safely:

* Missing slug.
* Invalid slug format.
* Slug not found.
* Pending diagnostics provider.
* Hidden diagnostics provider.
* Supabase unavailable and no fallback match.

Recommended user-facing behavior should match existing pharmacy detail not-found behavior.

---

## Scope

Allowed:

* Create/update `docs/CodexTask-161-DiagnosticsDetailReadPlanning.md`.
* Inspect existing pharmacy detail planning/helper/route docs if needed.
* Document future implementation plan.

Not allowed:

* Do not modify source code.
* Do not create diagnostics detail helper.
* Do not create diagnostics detail route.
* Do not create diagnostics runtime probe for detail yet.
* Do not implement diagnostics contact channels.
* Do not modify SQL, RLS, schema, or migrations.
* Do not modify diagnostics listing page.
* Do not modify pharmacy, doctors, or facilities behavior.
* Do not change UI, brand, logo, colors, or real data.
* Do not create Task 162.

---

## Validation

No code validation is required for this planning-only task.

Recommended checks:

```bash
git status
```

No lint/build is required unless Codex modifies source code, which it must not do.

---

## Acceptance Criteria

* Diagnostics detail read planning document exists.
* Future route path is identified.
* Future helper file and helper name are identified.
* Public-safe detail fields are listed.
* Active/public slug filtering is specified.
* Blocked slug behavior is specified.
* Safe fallback behavior is specified.
* Not-found behavior is specified.
* Error handling behavior is specified.
* Scope boundaries are clear.
* No source code is modified.
* No SQL/RLS/migration/schema files are modified.
* Task 162 is not created.

---

## Deliverable

A focused planning document for diagnostics detail read implementation.

Do not proceed beyond Task 161.
