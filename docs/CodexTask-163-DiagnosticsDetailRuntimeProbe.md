# Codex Task 163: Diagnostics Detail Runtime Probe

## Project

DigitalDirectory-v2

## Goal

Create a runtime probe for the diagnostics detail read helper implemented in Task 162.

This task verifies that the diagnostics detail helper can safely execute by slug and correctly handle public, blocked, missing, and invalid diagnostics provider slugs.

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
* CodexTask-162-DiagnosticsDetailReadHelperImplementation.md

---

## Important Context

Task 162 added a diagnostics detail read helper.

Expected helper name:

```ts
getSupabasePublicDiagnosticDetailBySlug(slug: string)
```

Expected helper module:

```text
src/lib/supabase/diagnostics-public-read.ts
```

The helper should read from:

```text
public.diagnostic_providers
```

using active/public filters:

```text
listing_status = active
visibility_status = public
```

---

## Main Objective

Create a diagnostics detail runtime probe script.

Recommended script target:

```text
scripts/probe-diagnostics-detail.ts
```

Add a package script if consistent with existing project conventions:

```json
"probe:diagnostics-detail": "..."
```

Follow existing pharmacy detail runtime probe patterns as the main guide.

---

## Required Probe Behavior

The probe should:

1. Import and call `getSupabasePublicDiagnosticDetailBySlug`.
2. Test at least one expected public diagnostics slug.
3. Test expected blocked slugs.
4. Test a missing/nonexistent slug.
5. Test an invalid slug.
6. Print a safe probe summary.
7. Confirm the helper returns without crashing.
8. Confirm blocked rows are not exposed.
9. Confirm invalid/missing slugs resolve safely.
10. Avoid printing raw Supabase errors, env values, URLs, anon keys, or secrets.
11. Exit with a non-zero code if safety expectations fail.
12. Exit successfully if safe runtime behavior is confirmed, even if live Supabase rows are unavailable but safe fallback/not-found behavior is correct and documented.

---

## Expected Public Test Slugs

When Supabase runtime is available, the probe should be able to verify detail reads for one or more of:

```text
test-diagnostic-alpha-lab
test-diagnostic-eta-imaging
test-diagnostic-zeta-radiology
test-diagnostic-omega-pathology
test-diagnostic-kappa-mixed
test-diagnostic-lambda-home-sample
```

At minimum, test:

```text
test-diagnostic-alpha-lab
```

---

## Expected Blocked Test Slugs

The probe must verify these are not exposed as public detail records:

```text
test-diagnostic-beta-pending
test-diagnostic-delta-hidden
```

These should resolve to safe not-found, unavailable, fallback, or error behavior depending on runtime availability, but they must not return public detail display data.

---

## Missing / Invalid Slug Cases

The probe should test:

```text
missing slug:
test-diagnostic-missing-slug

invalid slug:
../test-diagnostic-alpha-lab
```

Invalid slug should not be passed through dangerously and should not return a public provider.

---

## Safe Output Requirements

The probe may print:

* Probe name
* Helper result status
* Source
* Tested slug labels
* Whether public slug detail was returned or safely unavailable
* Whether blocked slugs were excluded
* Whether missing/invalid slugs were handled safely
* Final pass/fail status

The probe must not print:

* Supabase URL
* Supabase anon key
* Environment variable values
* Raw Supabase error object
* Private/internal database fields
* Stack traces unless existing probe conventions already allow safe stack traces

---

## Known Runtime Limitation

Current local/Codex runtime has not successfully verified live diagnostics Supabase rows through `probe:diagnostics`.

Known result from previous tasks:

```text
npm.cmd run probe:diagnostics: safe fallback/error, DIAGNOSTICS_PUBLIC_READ_FAILED
```

For this task:

* If the same runtime limitation appears, document it clearly.
* The probe should still verify that blocked, missing, and invalid slugs are not exposed.
* Do not make broad tooling or Supabase client rewrites.
* Keep changes focused on diagnostics detail probe behavior.

---

## Scope

Allowed:

* Create `scripts/probe-diagnostics-detail.ts`.
* Add `probe:diagnostics-detail` to `package.json` if consistent.
* Make tiny helper export/type adjustments only if required.
* Run validation commands.

Not allowed:

* Do not create diagnostics detail route yet.
* Do not modify diagnostics listing page.
* Do not implement contact channels.
* Do not modify SQL.
* Do not modify RLS.
* Do not modify Supabase migrations.
* Do not change pharmacy, doctors, or facilities behavior.
* Do not change UI, brand, logo, colors, or real data.
* Do not create Task 164.

---

## Validation Commands

Run:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run probe:diagnostics-detail
npm.cmd run probe:diagnostics
npm.cmd run probe:pharmacies
npm.cmd run probe:pharmacy-detail
```

If PowerShell blocks `npm`, use `npm.cmd`.

---

## Acceptance Criteria

* Diagnostics detail runtime probe exists.
* Package script exists if consistent.
* Probe calls `getSupabasePublicDiagnosticDetailBySlug`.
* Probe tests at least one public diagnostics slug.
* Probe tests pending and hidden blocked slugs.
* Probe tests missing and invalid slugs.
* Probe output is safe.
* Blocked rows are not exposed.
* Missing/invalid slugs are handled safely.
* `npm.cmd run lint` passes.
* `npm.cmd run build` passes.
* Probe results are reported clearly.
* No diagnostics detail route is created yet.
* No SQL/RLS/migration/schema files are modified.
* Task 164 is not created.

---

## Deliverable

A focused diagnostics detail runtime probe for the diagnostics detail read helper.

Do not proceed beyond Task 163.
