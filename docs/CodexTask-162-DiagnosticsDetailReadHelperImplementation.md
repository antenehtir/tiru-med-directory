# Codex Task 162: Diagnostics Detail Read Helper Implementation

## Project

DigitalDirectory-v2

## Goal

Implement a safe diagnostics detail read helper that reads one public diagnostics provider by slug.

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
* CodexTask-161-DiagnosticsDetailReadPlanning.md

---

## Important Context

The diagnostics listing helper and diagnostics listing page are already implemented.

The diagnostics detail read planning task identified the future route as:

```text
src/app/diagnostics/[slug]/page.tsx
```

The future detail helper should read from:

```text
public.diagnostic_providers
```

The helper should use the verified active/public filters:

```text
listing_status = active
visibility_status = public
```

---

## Main Objective

Add a diagnostics detail read helper that can safely return one diagnostics provider detail record by slug.

Preferred implementation location:

```text
src/lib/supabase/diagnostics-public-read.ts
```

Use the existing diagnostics public read helper file if that is now the established diagnostics read module.

Recommended helper name:

```ts
getSupabasePublicDiagnosticDetailBySlug(slug: string)
```

Follow existing pharmacy detail helper patterns as closely as possible.

---

## Required Helper Behavior

The helper should:

1. Accept a slug string.
2. Safely validate or normalize the slug.
3. Return safe not-found behavior for:

   * missing slug
   * invalid slug
   * no matching row
   * pending row
   * hidden row
4. Query `public.diagnostic_providers`.
5. Select public-safe fields only.
6. Filter by:

   * `slug = provided slug`
   * `listing_status = active`
   * `visibility_status = public`
7. Return one public diagnostics detail result.
8. Never expose raw Supabase errors, Supabase URL, anon key, env values, or secrets.
9. Preserve safe fallback behavior if Supabase env/client/query is unavailable.
10. Use matching static diagnostics fallback only if available and safe.
11. Avoid changing diagnostics listing behavior unless a tiny shared type/helper adjustment is necessary.

---

## Public-Safe Detail Fields

The helper may select public-safe fields already used by the listing helper, such as:

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

Only include `created_at` and `updated_at` if existing detail helper patterns use them safely.

Do not select private/internal fields.

---

## Expected Public Test Slugs

The helper should be able to return detail data for these active/public slugs when Supabase runtime is available:

```text
test-diagnostic-alpha-lab
test-diagnostic-eta-imaging
test-diagnostic-zeta-radiology
test-diagnostic-omega-pathology
test-diagnostic-kappa-mixed
test-diagnostic-lambda-home-sample
```

---

## Expected Blocked Test Slugs

The helper should not return public detail data for:

```text
test-diagnostic-beta-pending
test-diagnostic-delta-hidden
```

These should resolve to safe not-found or unavailable/fallback behavior, not a public detail display.

---

## Result Shape

Follow existing pharmacy detail result patterns.

The result may include statuses such as:

* success
* not-found
* unavailable
* error

The result should include safe metadata such as:

* source
* detail/card/provider
* fallbackRecommended
* safe reason or errorCode

Do not expose raw error objects.

---

## Fallback Behavior

If Supabase env is missing, client is unavailable, or query fails:

* Return safe unavailable/error behavior.
* Use a matching static diagnostics provider fallback only if such data exists.
* If no matching static fallback exists, return safe not-found or unavailable behavior.
* Do not invent runtime fake detail data.

Follow the pharmacy detail helper pattern.

---

## Scope

Allowed:

* Modify `src/lib/supabase/diagnostics-public-read.ts`.
* Add types or small internal mapper functions if necessary.
* Reuse existing diagnostics mapping logic.
* Run validation commands.

Not allowed:

* Do not create diagnostics detail route yet.
* Do not modify diagnostics page wiring.
* Do not create diagnostics detail runtime probe yet.
* Do not implement contact channels.
* Do not modify SQL.
* Do not modify RLS.
* Do not modify Supabase migrations.
* Do not change pharmacy, doctors, or facilities behavior.
* Do not change UI, brand, logo, colors, or real data.
* Do not create Task 163.

---

## Validation Commands

Run:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run probe:diagnostics
npm.cmd run probe:pharmacies
npm.cmd run probe:pharmacy-detail
```

If PowerShell blocks `npm`, use `npm.cmd`.

---

## Acceptance Criteria

* Diagnostics detail read helper exists.
* Helper accepts slug.
* Helper validates or safely normalizes slug.
* Helper reads `public.diagnostic_providers`.
* Helper filters by slug, active listing status, and public visibility status.
* Helper selects public-safe fields only.
* Helper returns safe not-found behavior for missing, invalid, pending, hidden, or absent slugs.
* Helper preserves safe fallback/unavailable/error behavior.
* No raw errors or secrets are exposed.
* No diagnostics detail route is created yet.
* No SQL/RLS/migration/schema files are modified.
* `npm.cmd run lint` passes.
* `npm.cmd run build` passes.
* Existing probes are attempted and results are reported.
* Task 163 is not created.

---

## Deliverable

A focused diagnostics detail read helper implementation.

Do not proceed beyond Task 162.
