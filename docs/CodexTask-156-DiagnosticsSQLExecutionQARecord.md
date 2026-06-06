# Codex Task 156: Diagnostics SQL Execution QA Record

## Project

DigitalDirectory-v2

## Goal

Create a QA record for the diagnostics SQL setup after manual execution.

This task follows:

- `docs/CodexTask-152-DiagnosticsTableSQLDraft.md`
- `docs/CodexTask-153-DiagnosticsRLSPolicySQLDraft.md`
- `docs/CodexTask-154-DiagnosticsTestDataSQLDraft.md`
- `docs/CodexTask-155-DiagnosticsManualSQLExecutionGuide.md`

This is a documentation-only SQL execution QA record task. Do not execute SQL. Do not modify Supabase directly. Do not create migration files. Do not modify source code, app routes, UI, RLS policies, pharmacy files, doctor files, or facility files. Do not import real production data.

---

## Execution Status

Current execution status:

```text
Not executed / pending manual execution
```

SQL execution has not been explicitly confirmed by the project owner in this prompt.

This QA record therefore does not claim that:

- the diagnostics table was created
- RLS was applied
- test data was inserted
- verification queries were run
- Supabase was changed
- public diagnostics reads are ready

---

## Context Reviewed

Documents reviewed:

- `docs/CodexTask-152-DiagnosticsTableSQLDraft.md`
- `docs/CodexTask-153-DiagnosticsRLSPolicySQLDraft.md`
- `docs/CodexTask-154-DiagnosticsTestDataSQLDraft.md`
- `docs/CodexTask-155-DiagnosticsManualSQLExecutionGuide.md`
- `docs/CodexTask-139-PharmaciesSQLExecutionQARecord.md`
- `docs/DoctorsSQLManualExecutionQARecord.md`
- `docs/FacilitiesSQLManualExecutionQA.md`
- `docs/DataModelContentStructure.md`
- `docs/DevelopmentRoadmap.md`

The facilities and doctors QA records document confirmed manual execution. This diagnostics QA record is intentionally different: it records that diagnostics SQL is still pending manual execution.

---

## Execution Metadata

| Field | QA Entry |
| --- | --- |
| QA status | Not executed / pending manual execution |
| QA owner | To be completed manually |
| Execution date | To be completed manually |
| Supabase environment | Test project only |
| Supabase project label | To be completed manually with non-secret label only |
| SQL execution method | Supabase SQL Editor, manual execution after review |
| Table SQL source | `docs/CodexTask-152-DiagnosticsTableSQLDraft.md` |
| RLS SQL source | `docs/CodexTask-153-DiagnosticsRLSPolicySQLDraft.md` |
| Test data SQL source | `docs/CodexTask-154-DiagnosticsTestDataSQLDraft.md` |
| Execution guide | `docs/CodexTask-155-DiagnosticsManualSQLExecutionGuide.md` |
| Secrets reviewed? | No keys, env values, or service-role values are recorded here |

---

## Table QA Status

Current status:

```text
Not executed / pending manual execution
```

Table QA checklist for future manual completion:

- [ ] `public.diagnostic_providers` table was created successfully.
- [ ] `id uuid primary key default gen_random_uuid()` exists.
- [ ] `slug text unique not null` exists.
- [ ] `display_name text not null` exists.
- [ ] `diagnostic_provider_type text not null` exists.
- [ ] Public discovery fields exist: `category`, `description`, `city`, `area`, `address_public`, `landmark_public`.
- [ ] Public array fields exist: `services_public`, `sample_collection_modes`.
- [ ] Public preview fields exist: `opening_hours_public`, `result_turnaround_public`, `appointment_required_preview`, `walk_in_available`, `home_sample_collection_preview`.
- [ ] Status fields exist with expected defaults: `listing_status`, `visibility_status`, `verification_status`.
- [ ] Timestamp fields exist: `last_confirmed_at`, `created_at`, `updated_at`.
- [ ] Diagnostic provider type constraint is reviewed and aligned with test data.
- [ ] `listing_status` constraint uses: `draft`, `pending`, `active`, `rejected`, `archived`, `suspended`.
- [ ] `visibility_status` constraint uses: `public`, `hidden`, `internal`.
- [ ] `verification_status` constraint uses: `unverified`, `pending`, `verified`, `disputed`, `expired`.
- [ ] Helpful indexes exist for `slug`, `listing_status + visibility_status`, `diagnostic_provider_type`, `city + area`, and `verification_status`.
- [ ] No patient records fields were added.
- [ ] No lab result fields were added.
- [ ] No diagnostic report fields were added.
- [ ] No uploaded file fields were added.
- [ ] No sample tracking fields were added.
- [ ] No private contact fields were added.
- [ ] No staff schedule fields were added.
- [ ] No admin note or verification document fields were added.
- [ ] No ordering, payment, or protected workflow fields were added.

---

## RLS QA Status

Current status:

```text
Not executed / pending manual execution
```

RLS QA checklist for future manual completion:

- [ ] RLS is enabled on `public.diagnostic_providers`.
- [ ] `anon` has usage on schema `public`.
- [ ] `anon` has select permission on `public.diagnostic_providers`.
- [ ] Public read policy exists for `anon`.
- [ ] Public read policy allows only rows where `listing_status = 'active'`.
- [ ] Public read policy allows only rows where `visibility_status = 'public'`.
- [ ] No `anon` insert policy exists.
- [ ] No `anon` update policy exists.
- [ ] No `anon` delete policy exists.
- [ ] No service-role logic is included.
- [ ] No provider/admin/reviewer policy was implemented yet.
- [ ] No private or patient-sensitive data is made readable through this policy.

Protected by intended RLS:

- draft listings
- pending listings
- rejected listings
- archived listings
- suspended listings
- hidden listings
- internal listings

---

## Test Data QA Status

Current status:

```text
Not executed / pending manual execution
```

Test data QA checklist for future manual completion:

- [ ] Fictional diagnostics provider test data inserted successfully.
- [ ] Full verification query returned the expected total row count: `8`.
- [ ] Active/public verification query returned the expected row count: `6`.
- [ ] Public active row exists: `test-diagnostic-alpha-lab`.
- [ ] Public active row exists: `test-diagnostic-eta-imaging`.
- [ ] Public active row exists: `test-diagnostic-zeta-radiology`.
- [ ] Public active row exists: `test-diagnostic-omega-pathology`.
- [ ] Public active row exists: `test-diagnostic-kappa-mixed`.
- [ ] Public active row exists: `test-diagnostic-lambda-home-sample`.
- [ ] Blocked pending row exists for later RLS/filter testing: `test-diagnostic-beta-pending`.
- [ ] Blocked hidden row exists for later RLS/filter testing: `test-diagnostic-delta-hidden`.
- [ ] No real diagnostics provider data was used.
- [ ] No patient data was used.
- [ ] No lab results, reports, uploads, sample tracking, ordering, payment, private contacts, staff personal numbers, admin notes, verification documents, keys, env values, or secrets were used.

---

## Verification Query Checklist

The following queries should be run only after manual SQL execution in a reviewed test project.

### Table Structure

```sql
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'diagnostic_providers'
order by ordinal_position;
```

Status:

```text
Not run / pending manual execution
```

### RLS Enabled

```sql
select
  relname,
  relrowsecurity
from pg_class
where relname = 'diagnostic_providers';
```

Status:

```text
Not run / pending manual execution
```

### Policy Verification

```sql
select
  policyname,
  cmd,
  roles,
  qual
from pg_policies
where schemaname = 'public'
  and tablename = 'diagnostic_providers'
order by policyname;
```

Status:

```text
Not run / pending manual execution
```

### Public Write Policy Check

```sql
select
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename = 'diagnostic_providers'
  and cmd in ('INSERT', 'UPDATE', 'DELETE');
```

Expected:

```text
0 rows
```

Status:

```text
Not run / pending manual execution
```

### Full Test Data Verification

```sql
select
  slug,
  display_name,
  diagnostic_provider_type,
  listing_status,
  visibility_status,
  verification_status
from public.diagnostic_providers
where slug like 'test-diagnostic-%'
order by display_name;
```

Expected:

```text
8 rows
```

Status:

```text
Not run / pending manual execution
```

### Active/Public Verification

```sql
select
  slug,
  display_name,
  diagnostic_provider_type,
  listing_status,
  visibility_status,
  verification_status
from public.diagnostic_providers
where listing_status = 'active'
  and visibility_status = 'public'
order by display_name;
```

Expected:

```text
6 rows
```

Status:

```text
Not run / pending manual execution
```

---

## Expected Public-Visible Rows

Expected active/public rows from Task 154:

| Expected slug | Expected display name | Expected provider type | Expected listing/visibility |
| --- | --- | --- | --- |
| `test-diagnostic-alpha-lab` | Test Diagnostic Alpha Laboratory | `laboratory` | active/public |
| `test-diagnostic-eta-imaging` | Test Diagnostic Eta Imaging Center | `imaging_center` | active/public |
| `test-diagnostic-zeta-radiology` | Test Diagnostic Zeta Radiology Center | `radiology_center` | active/public |
| `test-diagnostic-omega-pathology` | Test Diagnostic Omega Pathology Service | `pathology_service` | active/public |
| `test-diagnostic-kappa-mixed` | Test Diagnostic Kappa Mixed Center | `mixed_diagnostic_center` | active/public |
| `test-diagnostic-lambda-home-sample` | Test Diagnostic Lambda Home Sample Collection | `home_sample_collection_provider` | active/public |

These are expected to appear only after table, RLS, and test data execution have been manually completed and verified.

---

## Expected RLS-Blocked Rows

Expected blocked rows from Task 154:

| Blocked slug | Reason |
| --- | --- |
| `test-diagnostic-beta-pending` | Pending listing |
| `test-diagnostic-delta-hidden` | Hidden visibility |

These rows should exist for negative QA but should not appear in the active/public verification query.

---

## Known Provider Type Naming Risk

Current known risk:

```text
Task 152 and Task 154 do not fully align on diagnostic_provider_type values.
```

Task 152 table draft includes:

- `laboratory`
- `imaging_center`
- `pathology`
- `radiology`
- `mixed_diagnostic_center`

Task 154 test data draft includes:

- `laboratory`
- `imaging_center`
- `radiology_center`
- `pathology_service`
- `mixed_diagnostic_center`
- `home_sample_collection_provider`

Required before manual SQL execution:

- Reconcile the provider type vocabulary.
- Either expand the Task 152 table constraint or adjust the Task 154 test data rows.
- Do not bypass the constraint casually.
- Do not proceed to public read helper work until the final provider type vocabulary is confirmed.

---

## Public Read Readiness Decision

Current decision:

```text
Not ready for diagnostics public read helper implementation.
```

Reason:

- SQL has not been manually executed.
- Supabase has not been modified or verified.
- Table QA is pending.
- RLS QA is pending.
- Test data QA is pending.
- Provider type vocabulary still needs confirmation.

Diagnostics public read helper work should wait until manual SQL execution is confirmed and this QA record is updated with actual results.

---

## Required Confirmation Before Task 157

Before Task 157 begins, the project owner should explicitly confirm:

1. The diagnostics table SQL was manually executed in a test Supabase project.
2. The diagnostics RLS SQL was manually executed in the same test project.
3. The diagnostics test data SQL was manually executed in the same test project.
4. Provider type vocabulary was reconciled before execution.
5. Full verification query returned 8 fictional test rows.
6. Active/public verification query returned 6 public-visible rows.
7. Pending and hidden rows were excluded from active/public results.
8. No real production data was used.
9. No patient data, lab results, reports, uploads, sample tracking, private contacts, admin notes, verification documents, ordering workflows, payments, keys, env values, or secrets were used.
10. No source code or UI changes were made during manual SQL execution.

If these confirmations are not available, Task 157 should be deferred.

---

## Error Log

Use this table only after future manual execution. Do not paste raw keys, full connection strings, project URLs, stack traces containing secrets, or screenshots with credentials.

| Time | Step | Error observed | Safe category | Action taken | Status | Follow-up notes |
| --- | --- | --- | --- | --- | --- | --- |
| Pending | Table creation | Not run | table / constraint / index / unknown | Pending manual execution | open | To be completed manually |
| Pending | RLS policy | Not run | grant / policy / permission / unknown | Pending manual execution | open | To be completed manually |
| Pending | Test data | Not run | insert / constraint / data-shape / unknown | Pending manual execution | open | Provider type vocabulary must be reconciled first |
| Pending | Public read | Not run | empty-result / blocked-row-visible / permission / unknown | Pending manual execution | open | To be completed manually |

---

## Safety Confirmation

Confirmed for this documentation-only QA record:

- Codex did not execute SQL.
- Codex did not modify Supabase.
- Codex did not create migration files.
- Codex did not modify source code.
- Codex did not modify routes.
- Codex did not modify UI.
- Codex did not modify RLS policies.
- Codex did not import real production data.
- Codex did not expose Supabase keys, environment values, service-role keys, or secrets.

Still pending manual confirmation:

- SQL execution result.
- Table creation result.
- RLS execution result.
- Test data insertion result.
- Public read verification result.
- Blocked row exclusion result.

---

## Recommended Task 157

Recommended Task 157 title:

```text
CodexTask-157-DiagnosticsPublicReadHelperImplementation.md
```

Recommended objective:

After manual diagnostics SQL execution is confirmed and this QA record is updated with successful table, RLS, and test data verification results, implement a safe diagnostics public read helper that reads only active/public `public.diagnostic_providers` rows, selects public-safe fields only, maps rows toward `PublicProviderCard`, preserves static fallback, and hides raw Supabase errors.

Task 157 should not begin until the required manual SQL execution confirmations are available.

---

## Remaining Risks

- Diagnostics SQL has not been executed yet.
- Provider type vocabulary mismatch remains unresolved.
- Public read helper work is blocked until table/RLS/test data execution is confirmed.
- Future blocked test coverage should add rejected, archived, suspended, and internal rows.
- Future diagnostics helper must carefully normalize `providerType = diagnostics` while contact channels later use `provider_type = diagnostic`.
- Public turnaround and home sample collection values must remain general discovery previews, not workflows or patient-specific promises.

---

## Summary

Current diagnostics SQL execution status:

```text
Not executed / pending manual execution
```

Table QA, RLS QA, test data QA, verification queries, public-visible rows, and blocked rows are documented as expected outcomes only. No SQL execution or Supabase change is claimed.

The project is not ready for diagnostics public read helper implementation until manual SQL execution is explicitly confirmed, provider type vocabulary is reconciled, and verification results are recorded.
