# DigitalDirectory-v2 Static-to-Supabase Source Switch Planning

## Purpose

This document defines how DigitalDirectory-v2 can later switch safely between current static seed data and future Supabase-backed public listing data.

It is documentation-only. It does not add feature flag code, source wrapper code, mapper code, Supabase client code, real Supabase queries, packages, `.env` files, SQL, migrations, RLS policies, authentication, backend functionality, protected routes, public listing behavior changes, or frontend UI changes.

The goal is to protect the working static public directory while preparing a controlled path toward Supabase public listing reads.

---

## Core Principle

Static seed data remains the source of truth today.

Supabase should become a public listing source only after the schema, RLS rules, environment setup, mapper layer, test project, and rollback plan are ready. The switch should be reversible, observable, and narrow enough that the public site remains stable if Supabase reads fail or return incomplete data.

---

## Source Switch Purpose

A future source switch should allow DigitalDirectory-v2 to choose between:

- Current static seed data.
- Future Supabase public listing reads.
- Static fallback when Supabase is unavailable or incomplete.

The switch should support staged rollout without changing the public UI first.

The source switch should not:

- Add private data access.
- Add writes.
- Add authentication requirements for public browsing.
- Change public page design.
- Remove seed fallback too early.
- Bypass mappers or RLS planning.

---

## Static Source of Truth Today

The current app is a frontend/static public directory.

Current static sources include:

- `src/data/sampleFacilities.ts`
- `src/data/sampleDoctors.ts`
- `src/data/samplePharmacies.ts`
- `src/data/sampleDiagnostics.ts`
- `src/data/seed-facilities.ts`
- `src/data/seed-doctors.ts`
- `src/data/seed-pharmacies.ts`
- `src/data/seed-diagnostics.ts`
- `src/data/seed-services.ts`
- `src/data/seed-specialties.ts`
- `src/data/seed-locations.ts`
- `src/data/seed-community-channels.ts`

Current static data rules:

- Static records should continue powering the public UI until Supabase reads are intentionally introduced.
- Static sample data should not be treated as real verified production data.
- Static data should remain available during the first Supabase read rollout.
- Static fallback should preserve current public routes, cards, search previews, and detail previews.

---

## Future Supabase Source

The future Supabase source should be read-only for public listing surfaces at first.

Future Supabase public reads may include:

- Published facilities.
- Published doctors.
- Published pharmacies.
- Published diagnostics providers.
- Active public services.
- Active public specialties.
- Active public locations.
- Reviewed public contact channels.
- Reviewed public relationships such as doctor affiliations and facility services.

The future Supabase source must not include:

- Draft, hidden, rejected, archived, duplicate, or private listings.
- Provider registration requests.
- Correction requests.
- Feedback submissions.
- Admin review notes.
- Verification evidence.
- Provider ownership records.
- Audit logs.
- Patient data.
- Booking data.
- Payment or wallet data.
- Document vault data.
- Notification data.
- Chatbot or community private data.

Supabase should not become the default source until public table shape, RLS behavior, environment variables, DTO mappers, and rollback behavior are proven in a safe test environment.

---

## Data-Source Wrapper Concept

A future data-source wrapper can isolate public pages from source details.

Conceptual responsibility:

```text
public page -> public listing source wrapper -> mapper -> static or Supabase source
```

The wrapper would later:

- Select static seed data or Supabase reads based on controlled configuration.
- Return the same public DTO shape regardless of source.
- Use mappers before data reaches UI components.
- Handle loading, empty, and error states safely.
- Fall back to static data when allowed.
- Avoid exposing Supabase row shapes directly to components.

Potential future wrapper responsibilities:

| Responsibility | Purpose |
| --- | --- |
| Source selection | Decide static, Supabase, or fallback source |
| DTO stability | Return stable public card/detail shapes |
| Fallback handling | Preserve current public pages if Supabase is unavailable |
| Error normalization | Avoid leaking internal errors into UI |
| Eligibility enforcement | Use only published public-safe records |
| Route preservation | Keep known slugs and links stable |

This task does not create wrapper files or source selection code.

---

## Controlled Switch and Feature Flag Planning

A future controlled switch should make the data source explicit.

Potential future modes:

| Mode | Meaning | Use |
| --- | --- | --- |
| `static` | Use static seed data only | Current behavior and safest fallback |
| `supabase-with-fallback` | Try Supabase, fall back to static data | Early development and staging |
| `supabase-only` | Use Supabase public reads only | Later production-ready state |

Recommended default:

```text
static
```

Planning rules:

- Do not add feature flag code until a dedicated implementation task.
- Keep the default source static until Supabase readiness is proven.
- Avoid runtime switches that make debugging unclear.
- Keep source mode visible to developers through safe logs or diagnostics later, not public UI.
- Do not expose source mode controls to public users.
- Do not require login for public source selection.

The first future implementation should prefer a conservative environment-controlled switch, not a complex feature flag platform.

---

## Fallback Behavior

Fallback should protect the public site from Supabase readiness issues.

Fallback may be used when:

- Supabase environment variables are missing.
- The Supabase client is not configured.
- A query fails.
- A query times out.
- The returned data is empty unexpectedly.
- A mapper rejects incomplete or unsafe data.
- RLS blocks a query that should be public.
- The test project is unavailable.

Fallback rules:

- Static data should remain available for the first integration slices.
- Fallback should return the same public DTO shape expected by UI components.
- Fallback should not merge unsafe or partially trusted data with static data without explicit rules.
- Fallback should not hide systemic problems in staging forever.
- Fallback should not expose private Supabase error details to public users.

Recommended early fallback behavior:

```text
Use static seed data unless Supabase public reads are explicitly enabled and successful.
```

---

## Missing Environment Variable Handling

Missing environment variables should be safe and predictable.

Future public Supabase reads may require:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Missing variable rules:

- Missing public Supabase variables should keep the app on static source mode.
- Missing variables should not crash local development.
- Missing variables should not trigger real Supabase reads.
- Missing variables should not cause public pages to render blank.
- Missing variables should not expose internal setup details to public users.
- Missing server-only variables should never be required for public listing reads.

Service role key rule:

```text
The service role key must never be used for public listing source switching.
```

---

## Build and Deployment Safety

The source switch should be safe for local builds, preview deployments, staging, and production.

Build safety rules:

- Static mode should build without Supabase packages or environment variables.
- Future Supabase mode should fail safely when configuration is incomplete.
- Static fallback should avoid blocking deployment previews.
- Build-time and runtime source choices should be documented before implementation.
- Public pages should not depend on private environment variables.
- Preview deployments should not point to production writable data.

Deployment safety rules:

- Use a test Supabase project before production.
- Verify RLS before enabling Supabase reads.
- Verify source mode separately for local, preview, staging, and production.
- Keep rollback to static source simple.
- Do not remove static data until production Supabase reads are stable.

---

## Public Page Stability

Public pages should remain stable while source switching is introduced.

Pages and surfaces to protect:

- Homepage sections.
- Search results preview.
- Facilities page.
- Doctors page.
- Nearby page.
- Pharmacies page.
- Diagnostics page.
- Facility detail preview.
- Doctor detail preview.
- Footer links and public route behavior.

Stability rules:

- Do not change card layout because the data source changes.
- Do not change routes because the data source changes.
- Do not show blank buttons when labels are missing.
- Do not let long provider names break responsive layouts.
- Do not expose raw loading, error, or database text.
- Do not make public browsing require authentication.
- Do not remove static route support for `/facilities/addis-health-center` and `/doctors/dr-hana-bekele` during early rollout.

---

## Rollback Plan

Rollback should be fast and low-risk.

Rollback goal:

```text
Return public listing pages to static seed data without changing UI code.
```

Future rollback steps:

1. Set source mode back to static.
2. Confirm public pages render from static seed data.
3. Confirm known routes still work.
4. Confirm search, facilities, doctors, pharmacies, diagnostics, and detail previews are usable.
5. Capture Supabase query or mapper issue for later debugging.
6. Keep RLS and schema investigation separate from public site recovery.

Rollback should be practiced in the test project and staging before production.

Rollback should not require:

- Deleting Supabase tables.
- Disabling RLS.
- Removing packages.
- Changing public UI components.
- Editing provider data manually.
- Touching auth, admin, patient, booking, payment, or document workflows.

---

## Relationship to Public Listing Data Mapper Planning

This plan depends on `PublicListingDataMapperPlanning.md`.

Relationship:

- The source switch chooses where public data comes from.
- The mapper plan defines how source data becomes stable public DTOs.
- Static and Supabase sources should both flow through compatible public DTO shapes.
- Mappers should preserve slugs, normalize categories, and drop private fields.
- Source switching should not pass raw Supabase rows directly to UI components.

Recommended order:

```text
source strategy -> DTO design -> mapper implementation -> controlled source switch
```

---

## Relationship to Public Listing Read Implementation Prep

This plan supports `PublicListingReadImplementationPrep.md`.

Relationship:

- Implementation prep defines how future public reads should be introduced.
- This source switch plan defines how to control, fallback, and roll back those reads.
- Implementation prep emphasizes a narrow read-only slice.
- This plan keeps static fallback active while that slice is tested.

Source switching should be implemented only after implementation prep, mapper planning, and test project readiness are complete.

---

## Relationship to Supabase Client Setup Planning

This plan depends on `SupabaseClientSetupPlanning.md`.

Relationship:

- Client setup planning defines browser-safe and server/admin client boundaries.
- Source switching should use only public-safe Supabase access for public listing reads.
- Source switching should not introduce service role usage.
- Missing client configuration should fall back safely to static data.
- Public listing query helpers should remain separate from provider, admin, patient, booking, payment, document, chatbot, and community modules.

Source switching should not be the reason to add broad Supabase helper files.

---

## Relationship to RLS Policy Planning

This plan depends on `RLSPolicyPlanning.md`.

Relationship:

- RLS should protect Supabase public reads at the database boundary.
- Source switching should only enable Supabase public reads after RLS expectations are testable.
- Static fallback should not be used as a reason to ignore RLS failures.
- Public reads should remain limited to published public-safe records.
- Private/internal tables should remain inaccessible regardless of source mode.

Mapper protection and source switching do not replace RLS.

---

## Testing Checklist

Future source switch testing should verify:

1. Static mode renders all current public pages.
2. Static mode works without Supabase environment variables.
3. Static mode works without Supabase packages if packages are not installed yet.
4. Supabase-enabled mode uses only public anon credentials.
5. Supabase-enabled mode reads only published public records.
6. Supabase-enabled mode does not expose private/internal fields.
7. Missing environment variables fall back safely.
8. Query failures fall back safely where fallback is enabled.
9. Empty Supabase responses do not render broken layouts.
10. Mapper failures do not expose raw errors to public users.
11. Known static routes still work.
12. Provider card layouts remain stable.
13. Doctor names and long provider names wrap naturally.
14. Buttons keep visible labels.
15. Pharmacies and diagnostics remain discoverable.
16. Rollback from Supabase mode to static mode is quick.
17. Preview deployments do not use production writable data.
18. No service role key is used in browser code.
19. Public browsing remains login-free.
20. Lint and build pass after future implementation.

No tests are added in this planning task.

---

## MVP Recommendation

Do not add source switch code now.

Current MVP recommendation:

- Keep static seed data as the active source.
- Keep public listing behavior unchanged.
- Keep frontend UI unchanged.
- Do not add feature flag code.
- Do not add source wrapper code.
- Do not add mapper code.
- Do not add Supabase client code or packages.
- Do not add real queries.
- Do not add environment files, SQL, migrations, or RLS policies.
- Do not add auth, backend, protected routes, or dashboards.

Recommended first future implementation:

1. Keep static mode as the default.
2. Add DTO and mapper code for one low-risk public provider type.
3. Add a narrow source wrapper for that provider type only.
4. Add Supabase reads behind an explicit development-only switch.
5. Keep static fallback active.
6. Verify test project, RLS, mapping, routes, and rollback before expanding.

---

## Risks

Key risks:

- Switching to Supabase before RLS is ready.
- Accidentally making Supabase the default source too early.
- Removing static fallback before public reads are stable.
- Passing raw database rows into UI components.
- Leaking private/internal fields into public pages.
- Breaking known static routes.
- Rendering blank or awkward UI from missing database fields.
- Using service role credentials in public code.
- Connecting preview deployments to production data.
- Hiding Supabase failures behind fallback without logging or review later.
- Mixing sample seed data and real public data without clear labels.
- Requiring authentication for public browsing by mistake.

Mitigations:

- Keep static mode default.
- Introduce Supabase reads one provider type at a time.
- Use public DTO mappers.
- Preserve known slugs and fallback links.
- Keep RLS and field selection narrow.
- Use a test Supabase project first.
- Practice rollback before production.
- Keep public/private data boundaries explicit.
- Run lint and build after future implementation tasks.

---

## Recommended Next Development Order

1. Keep the current static public directory stable.
2. Review this source switch plan with mapper, read implementation, client setup, RLS, and test project docs.
3. Confirm public listing DTO shapes.
4. Confirm first provider type for mapper implementation.
5. Confirm test Supabase project readiness.
6. Confirm public table and RLS readiness for the first slice.
7. Add mappers for static data in a future task if needed.
8. Add a narrow source wrapper in a future task.
9. Add Supabase package and browser-safe client only after environment setup is approved.
10. Add one read-only public query behind controlled source mode.
11. Verify fallback behavior and rollback.
12. Expand source switching to additional provider types only after the first slice is stable.

---

## Summary

DigitalDirectory-v2 should keep static seed data as the active source today.

A future source switch can safely introduce Supabase public listing reads only after the mapper layer, RLS rules, environment setup, test project, and rollback plan are ready. The switch should keep static fallback available, preserve public page stability, protect known routes, avoid private data leakage, and remain easy to roll back.

The recommended current action is documentation only. No feature flag code, source wrapper code, mapper code, Supabase client code, queries, packages, `.env` files, SQL, migrations, RLS policies, authentication, backend functionality, protected routes, public listing behavior changes, or frontend UI modifications should be added in this task.
