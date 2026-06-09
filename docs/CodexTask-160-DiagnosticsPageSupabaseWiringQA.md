# Codex Task 160: Diagnostics Page Supabase Wiring QA

## Project

DigitalDirectory-v2

## Goal

Record QA for the diagnostics page Supabase wiring completed in Task 159.

This is a documentation-only QA record. No source code, SQL, RLS, schema, migrations, probe scripts, package scripts, diagnostics detail pages, diagnostics contact channels, UI, brand, logo, pharmacy, doctors, facilities, or real data files were modified for this QA task.

---

## Task 159 Implementation Summary

Task 159 wired the diagnostics listing page to the diagnostics public read helper created in Task 157.

The diagnostics page now:

- imports and calls `getSupabasePublicDiagnosticsCards`
- requests diagnostics cards from the public helper on the server route
- maps returned `PublicProviderCard` values into the existing facility-card data shape used by the diagnostics UI
- passes diagnostics cards into `DiagnosticsPage`
- passes diagnostics cards into `DiagnosticsResultsSection`
- preserves the existing diagnostics layout and card system
- preserves safe static fallback behavior

The diagnostics route is dynamic so it can use the public Supabase helper at request time.

---

## Files Modified In Task 159

Task 159 modified these files:

```text
src/app/diagnostics/page.tsx
src/components/diagnostics/DiagnosticsPage.tsx
src/components/diagnostics/DiagnosticsResultsSection.tsx
```

No SQL, RLS, schema, migration, diagnostics detail, diagnostics contact channel, pharmacy, doctors, facilities, global UI, brand, logo, color, package script, or real data files were modified as part of Task 159 page wiring.

---

## Helper Usage

The diagnostics page now uses:

```text
getSupabasePublicDiagnosticsCards
```

from:

```text
src/lib/supabase/diagnostics-public-read.ts
```

The helper queries:

```text
public.diagnostic_providers
```

with public-read filters:

```text
listing_status = active
visibility_status = public
```

Pending and hidden diagnostics rows are excluded by those helper filters and by the verified RLS policy from Task 156.

---

## Safe Fallback Behavior

Safe fallback/static behavior is preserved.

If Supabase is unavailable, the public client is unavailable, the helper returns a safe error, or no helper cards are returned, the diagnostics page can still render using existing static diagnostics data.

The page does not expose:

- raw Supabase errors
- Supabase URL
- anon key
- environment variable values
- service-role values
- secrets
- private/internal database fields

The page remains public discovery only.

---

## Validation Results Recorded

Validation results from Task 159:

| Command | Result |
| --- | --- |
| `npm.cmd run lint` | Passed |
| `npm.cmd run build` | Passed |
| `npm.cmd run probe:diagnostics` | Safe fallback/error, `DIAGNOSTICS_PUBLIC_READ_FAILED` |
| `npm.cmd run probe:pharmacies` | Passed with safe static fallback |
| `npm.cmd run probe:pharmacy-detail` | Passed with safe static fallback |

The build confirmed the diagnostics route compiled successfully after page wiring.

---

## Runtime Supabase Verification Limitation

The six live Supabase diagnostics rows were manually verified in SQL during Task 156:

```text
test-diagnostic-alpha-lab
test-diagnostic-eta-imaging
test-diagnostic-zeta-radiology
test-diagnostic-omega-pathology
test-diagnostic-kappa-mixed
test-diagnostic-lambda-home-sample
```

The blocked rows were also manually verified as excluded from active/public SQL results during Task 156:

```text
test-diagnostic-beta-pending
test-diagnostic-delta-hidden
```

However, the six live Supabase diagnostics rows were not verified through the local/Codex diagnostics probe runtime yet.

Current probe limitation:

```text
npm.cmd run probe:diagnostics returned safe fallback/error with DIAGNOSTICS_PUBLIC_READ_FAILED.
```

This is a runtime Supabase verification limitation, not a diagnostics page build failure.

---

## QA Status

```text
Passed with runtime Supabase verification limitation
```

Reason:

- Diagnostics page Supabase wiring was implemented.
- Diagnostics page imports and calls the diagnostics public read helper.
- Diagnostics page can render helper-provided cards.
- Safe fallback/static diagnostics behavior is preserved.
- No raw Supabase errors, env values, URLs, anon keys, or secrets are exposed.
- Pending/hidden diagnostics rows are excluded by helper active/public filters and RLS.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- The live Supabase rows were manually verified in SQL during Task 156.
- The live Supabase rows were not verified through `probe:diagnostics` in the current local/Codex runtime.

---

## Readiness

```text
Ready for Task 161 — Diagnostics Detail Read Planning.
```

Task 161 should remain planning-focused unless separately instructed. Diagnostics detail pages and diagnostics contact channels are not implemented in this QA record.

---

## Safety Confirmation

For Task 160:

- No source code was modified.
- No diagnostics page files were modified.
- No diagnostics helper was modified.
- No probe scripts were modified.
- No package scripts were modified.
- No SQL, RLS, schema, or migration files were modified.
- No diagnostics detail pages were created.
- No diagnostics contact channels were implemented.
- No pharmacy, doctors, or facilities behavior was changed.
- No UI, brand, logo, colors, or real data were changed.
- No Task 161 file was created.

---

## Summary

Diagnostics page Supabase wiring QA is complete.

The page is wired to the diagnostics public read helper, preserves safe static fallback behavior, and builds successfully. Runtime verification of the six live Supabase diagnostics rows remains limited in the local/Codex probe runtime because `probe:diagnostics` returned a safe fallback/error result with `DIAGNOSTICS_PUBLIC_READ_FAILED`.
