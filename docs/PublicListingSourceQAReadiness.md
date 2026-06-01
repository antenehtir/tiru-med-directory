# DigitalDirectory-v2 Public Listing Source QA Readiness

## Purpose

This document defines the QA and readiness checklist for the public listing mapper layer and static source wrapper before any Supabase public read implementation is connected to live pages.

It is documentation-only. It does not add Supabase reads, modify mapper code, modify source wrapper code, change public listing behavior, modify frontend UI, add SQL, migrations, RLS policies, authentication, backend functionality, protected routes, or data writes.

The goal is to make sure the current static public directory remains stable while the future Supabase read path is prepared carefully.

---

## Core Principle

QA should prove that the mapper and source-wrapper layer is safe before Supabase reads are introduced.

Static data remains the active source. Supabase should not become part of the live public listing flow until mapping, route preservation, missing-field handling, public/private field protection, static regression checks, and rollback expectations are reviewed.

---

## QA Purpose

Public listing source QA should confirm that:

- Static seed data still works as the default public source.
- Mapper output is stable and public-safe.
- Source wrapper helpers return predictable static data.
- Provider cards and detail DTOs have complete required fields.
- Known detail paths remain stable.
- Missing fields degrade safely.
- Private/internal fields do not reach public DTOs.
- Current public pages remain unchanged.
- The project is ready for a later Supabase-read implementation slice.

QA should be completed before any future task connects Supabase reads to public pages.

---

## Why QA Is Needed Before Supabase Reads

Supabase reads will add more moving parts than static seed data.

Risks before QA:

- Raw database rows could leak into UI components.
- Private or internal fields could appear publicly.
- Known static routes could break.
- Search and filter labels could change unexpectedly.
- Missing database fields could create blank buttons or awkward layouts.
- Draft or hidden records could appear publicly if eligibility rules are wrong.
- Fallback behavior could hide data problems or fail to protect public pages.

QA creates a baseline for the static mapper/source layer before a real database source exists.

---

## Static Source Wrapper QA Checklist

Review `src/lib/public-listing-source.ts`.

Checklist:

1. `getPublicListingSourceMode()` returns `static`.
2. Static source mode is the only active source.
3. No environment variables are required.
4. No Supabase client is imported.
5. No Supabase queries exist.
6. No authentication state is required.
7. No backend or protected route behavior is introduced.
8. `isSupabasePublicListingSourceAvailable()` returns `false`.
9. Facility, doctor, pharmacy, and diagnostics card helpers return arrays.
10. `getAllPublicProviderCards()` combines all public provider card groups.
11. Detail helpers use static seed records and mapper output only.
12. The wrapper does not change existing page imports or behavior.

Expected current source behavior:

```text
static seed data -> public listing mapper -> public DTOs
```

---

## Mapper Output Review Checklist

Review `src/lib/public-listing-mappers.ts` and `src/types/public-listings.ts`.

Checklist:

1. Public provider type values are explicit.
2. Facility mapper returns `PublicProviderCard` and `PublicProviderDetail` shapes.
3. Doctor mapper returns `PublicProviderCard` and `PublicProviderDetail` shapes.
4. Pharmacy mapper returns `PublicProviderCard` and `PublicProviderDetail` shapes.
5. Diagnostics mapper returns `PublicProviderCard` and `PublicProviderDetail` shapes.
6. Category labels are normalized.
7. Slugs are normalized.
8. Detail paths are generated through a helper.
9. Known current routes are preserved.
10. Missing text fields use safe fallback labels.
11. Empty services, specialties, and affiliations become empty arrays.
12. Contact channels are preview/public-safe only.
13. Verification labels stay sample-preview labels.
14. Private/internal seed metadata is not exposed in public DTOs.

---

## Provider Card Shape Validation

Every public card should include:

- `id`
- `slug`
- `name`
- `providerType`
- `categoryLabel`
- `summary`
- `locationLabel`
- `verificationStatus`
- `listingHref`
- `primaryActionLabel`
- `secondaryActionLabel`
- `services`
- `specialties`
- `affiliations`

Provider-specific card checks:

- Facility cards include services and hours preview where available.
- Doctor cards include specialty, affiliation, availability, and telemedicine preview.
- Pharmacy cards include pickup and delivery preview labels.
- Diagnostics cards include diagnostics type where available.

Card output should not include:

- Admin notes.
- Reviewer notes.
- Verification evidence.
- Owner account IDs.
- Review assignments.
- Source confidence.
- Audit logs.
- Patient, booking, payment, document, notification, chatbot, or community-private data.

---

## Provider Detail Shape Validation

Every public detail DTO should include all card fields plus:

- `description`
- `location`
- `contactChannels`
- `workingHours`
- `verification`
- `relatedProviderIds`
- `correctionHref`

Detail validation checks:

1. `location` uses public display fields only.
2. `contactChannels` are preview-safe and public.
3. `workingHours` has a safe fallback.
4. `verification` is a public trust state, not evidence.
5. `relatedProviderIds` are public-safe identifiers only.
6. `correctionHref` routes to the correction flow.
7. Missing optional fields do not produce raw `null`, `undefined`, or blank UI labels.

---

## Route and Detail Path Validation

Known routes must remain stable.

Current static detail routes:

- `/facilities/addis-health-center`
- `/doctors/dr-hana-bekele`

Checklist:

1. Addis Health Center maps to `/facilities/addis-health-center`.
2. Dr. Hana Bekele maps to `/doctors/dr-hana-bekele`.
3. Other facility cards use safe facility detail paths or fallback category paths according to mapper rules.
4. Pharmacy cards use `/pharmacies` until pharmacy detail pages exist.
5. Diagnostics cards use `/diagnostics` until diagnostics detail pages exist.
6. Raw internal IDs are not exposed as public route segments unless intentionally approved later.
7. Slug conflicts are treated as data readiness issues, not UI component responsibilities.

---

## Search and Filter Compatibility Checklist

The mapper/source layer should preserve future search compatibility.

Checklist:

1. Provider type values remain stable.
2. Category labels remain user-friendly.
3. Services remain arrays of public labels.
4. Specialties remain arrays of public labels.
5. Locations remain public display strings or public location DTOs.
6. Facility, pharmacy, and diagnostics categories stay distinguishable.
7. Doctor specialties are not confused with services.
8. Empty filters can still render without crashing.
9. Public listing cards can be grouped by provider type.
10. Static seed output can serve as the expected shape for later Supabase result mapping.

No real search or filter logic should be added during QA readiness.

---

## Missing Field Fallback Review

Missing fields should degrade quietly.

Checklist:

1. Missing name uses a safe provider-specific fallback.
2. Missing category uses a provider-type fallback.
3. Missing summary uses a neutral public description.
4. Missing location uses `Location not listed`.
5. Missing hours uses `Hours not listed`.
6. Missing services produce an empty array.
7. Missing specialties produce an empty array.
8. Missing affiliations produce an empty array.
9. Missing action labels use visible fallback text.
10. Missing verification status should be handled before production Supabase mapping.

Fallback rules:

- Do not invent medical services.
- Do not invent verification.
- Do not fill missing public contact fields from private data.
- Do not show raw errors or database values to users.

---

## Public and Private Field Safety Review

Public DTOs should be explicitly safe for frontend use.

Fields that must never appear in public DTOs:

- Admin notes.
- Reviewer notes.
- Verification evidence.
- Private provider contacts.
- Private submitter contacts.
- Provider owner account IDs.
- Organization membership IDs.
- Source confidence.
- Review assignments.
- Audit logs.
- Request payloads.
- Patient identity data.
- Booking data.
- Payment or wallet data.
- Document vault records.
- Notification history.
- Chatbot logs.
- Private community memberships or posts.

Safety checklist:

1. Mapper output includes only fields required by public UI.
2. Wrapper output returns mapper DTOs, not raw seed or future row objects.
3. Source metadata such as `sourceType`, `reviewStatus`, and `verificationNote` is not exposed as general public card data.
4. Verification notes remain sample-only and should be reviewed before production data exists.
5. Future Supabase rows should be selected narrowly and mapped before UI use.

---

## Static Behavior Regression Checklist

Before Supabase reads are connected, current public behavior should remain unchanged.

Manual regression pages:

- `/`
- `/search`
- `/nearby`
- `/facilities`
- `/facilities/addis-health-center`
- `/doctors`
- `/doctors/dr-hana-bekele`
- `/pharmacies`
- `/diagnostics`

Checklist:

1. Pages still render with current static data.
2. Homepage sections remain present.
3. Facility cards remain readable.
4. Doctor cards keep readable names.
5. Buttons remain visible.
6. Footer links remain stable.
7. No public page requires Supabase env vars.
8. No public page requires login.
9. No public page shows source-wrapper diagnostics.
10. No public route changes are introduced.

---

## Build and Lint Checklist

Future source-related code changes should run:

```text
npm.cmd run lint
npm.cmd run build
```

Checklist:

1. Lint has no errors.
2. Build completes without Supabase environment variables.
3. Static pages prerender successfully.
4. TypeScript accepts mapper and source wrapper exports.
5. No service role key reference exists in browser-facing code.
6. No `.env` files are created.
7. No SQL, migration, or RLS files are added during frontend-only tasks.

This QA readiness task does not require an app build if it only adds documentation.

---

## Supabase-Read Readiness Checklist

Before the first real Supabase public read task, confirm:

1. A safe test Supabase project exists.
2. No real patient-sensitive data is present.
3. Public listing schema draft has been reviewed.
4. RLS expectations are implemented and testable.
5. Public anon key usage is understood.
6. Service role key is not used for public reads.
7. Mapper output is reviewed against expected Supabase row shapes.
8. Static fallback behavior is documented.
9. Rollback to static source is simple.
10. First implementation slice is narrow, likely one provider type.
11. Public pages can remain static if Supabase is unavailable.
12. QA knows which pages must be manually checked.

Supabase reads should not be connected to live pages until this checklist is satisfied.

---

## Suggested Manual QA Steps

Suggested manual QA before Supabase reads:

1. Start the app locally.
2. Open the homepage.
3. Review search, nearby, doctors, facilities, pharmacies, and diagnostics sections.
4. Open `/facilities/addis-health-center`.
5. Open `/doctors/dr-hana-bekele`.
6. Confirm no page asks for login.
7. Confirm no page depends on Supabase environment variables.
8. Confirm cards and buttons remain readable on mobile width.
9. Confirm footer links remain stable.
10. Confirm `npm.cmd run lint` passes.
11. Confirm `npm.cmd run build` passes.
12. Review mapper/source output in code before using it in pages.

Suggested data-shape QA later:

1. Inspect output from `getPublicFacilityCards()`.
2. Inspect output from `getPublicDoctorCards()`.
3. Inspect output from `getPublicPharmacyCards()`.
4. Inspect output from `getPublicDiagnosticsCards()`.
5. Inspect output from `getAllPublicProviderCards()`.
6. Confirm no private/internal fields are present.

---

## What Must Not Be Implemented Yet

Do not implement the following in this QA readiness task:

- Supabase reads.
- Real Supabase queries.
- Mapper code changes.
- Source wrapper code changes.
- Public page data rewiring.
- Public listing behavior changes.
- Frontend UI changes.
- SQL.
- Migrations.
- RLS policies.
- Authentication.
- Backend functionality.
- Protected routes.
- Data writes.
- Real provider data migration.

---

## Relationship to Public Listing Mapper Implementation

This document reviews the output from Task 59.

Relationship:

- Task 59 created public listing DTO types and mapper helpers.
- This QA plan defines how to review those DTOs and helpers.
- Mapper QA should confirm stable public card and detail shapes.
- Mapper QA should confirm private/internal fields are not exposed.
- Mapper QA should confirm missing fields degrade safely.

Mapper QA should happen before Supabase row mapping is introduced.

---

## Relationship to Static-to-Supabase Source Wrapper Implementation

This document reviews the output from Task 60.

Relationship:

- Task 60 created the static source wrapper.
- This QA plan confirms static remains the active source.
- Source wrapper QA should confirm no Supabase query path exists yet.
- Source wrapper QA should confirm public pages are not wired to the wrapper unless explicitly approved later.
- Source wrapper QA should confirm future helper exports are build-safe.

Source wrapper QA should happen before source switching is expanded.

---

## Relationship to Supabase Read Implementation Later

This document prepares the path for a later Supabase read task.

Relationship:

- Supabase read implementation should use mapper DTOs.
- Supabase read implementation should keep static fallback available.
- Supabase read implementation should not bypass RLS.
- Supabase read implementation should start with a narrow provider type.
- Supabase read implementation should not expose private fields.
- Supabase read implementation should not require auth for public browsing.

This QA document should be reviewed before the first read-only public Supabase query is added.

---

## MVP Recommendation

Current MVP recommendation:

- Keep public pages static.
- Keep the mapper layer disconnected from pages unless a future task explicitly wires it.
- Keep the source wrapper static-only.
- Do not add Supabase reads yet.
- Do not add SQL, migrations, or RLS policies in frontend tasks.
- Do not add auth or protected routes.
- Use QA to confirm the mapper/source layer is stable before implementation continues.

The next implementation step should be a small, testable, read-only Supabase slice only after test project and RLS readiness are confirmed.

---

## Risks

Key risks:

- Connecting Supabase reads before mapper QA.
- Passing raw rows to UI.
- Leaking private/internal fields.
- Breaking known public routes.
- Losing static fallback.
- Changing public page behavior unintentionally.
- Making public browsing depend on auth.
- Hiding Supabase failures behind fallback without review.
- Treating sample verification labels as real production verification.
- Forgetting mobile/card readability regressions when data changes.

Mitigations:

- Keep static mode default.
- Review mapper output manually before using it in pages.
- Use narrow public DTOs.
- Preserve known detail paths.
- Run lint/build after code changes.
- Use a safe test Supabase project.
- Confirm RLS before public reads.
- Keep rollback to static source available.

---

## Recommended Next Development Order

1. Keep public pages static and stable.
2. Review mapper output against this QA checklist.
3. Review source wrapper output against this QA checklist.
4. Confirm no public/private field leaks.
5. Confirm known routes remain stable.
6. Confirm lint/build pass after any code change.
7. Confirm Supabase test project readiness.
8. Confirm public listing schema and RLS readiness.
9. Choose one provider type for the first read-only Supabase slice.
10. Add Supabase read helpers in a future task without page rewiring first.
11. Test fallback and rollback.
12. Wire one public surface only after output shape and safety are verified.

---

## Summary

The public listing mapper and static source wrapper should be QA-reviewed before any Supabase reads reach public pages.

This readiness document establishes the checks for mapper output, source wrapper behavior, provider card/detail shapes, route preservation, search/filter compatibility, missing-field fallbacks, public/private field safety, static behavior regression, build/lint safety, and future Supabase-read readiness.

No Supabase reads, mapper edits, source wrapper edits, frontend UI changes, backend functionality, authentication, SQL, migrations, RLS policies, protected routes, or data writes are added in this task.
