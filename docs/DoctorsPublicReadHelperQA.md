# DigitalDirectory-v2 Doctors Public Read Helper QA

## Scope

This document records the Task 106 QA pass for the doctors public read helper.

The QA scope is limited to the helper layer. This task does not wire the doctors page, modify public UI, add SQL/RLS/test data, add authentication, add backend functionality, add protected routes, use a service-role key, expose environment values, expose keys, expose raw Supabase errors, or commit changes.

## Files Reviewed

Documentation reviewed:

- `docs/DoctorsSQLManualExecutionQARecord.md`
- `docs/DoctorsSchemaSQLPlanning.md`
- `docs/CodexTask-105-DoctorsPublicReadHelperImplementation.md`
- `docs/CodexTask-106-DoctorsPublicReadHelperQA.md`

Implementation files reviewed:

- `src/lib/supabase/doctors-public-read.ts`
- `src/lib/supabase/public-client.ts`
- `src/types/public-listings.ts`
- `src/app/doctors/page.tsx`
- `src/app/doctors/dr-hana-bekele/page.tsx`

## Helper Existence

The helper exists in:

```text
src/lib/supabase/doctors-public-read.ts
```

Export reviewed:

```text
getSupabasePublicDoctorCards
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

Those helpers are provided by:

```text
src/lib/supabase/public-client.ts
```

The reviewed public client path uses only public environment variable names through the existing env helper. No service-role key is used or referenced by the doctors public read helper.

Status:

```text
Pass
```

## Query Scope

The helper queries only:

```text
doctors
```

This maps to the planned and manually executed table:

```text
public.doctors
```

The helper does not query facilities, pharmacies, diagnostics providers, patients, bookings, payments, reviews, ratings, protected tables, admin tables, auth tables, or document tables.

Status:

```text
Pass
```

## Public-Safe Selected Fields

The helper selects only these public-safe fields:

- `id`
- `slug`
- `display_name`
- `title`
- `specialty`
- `subspecialty`
- `bio_public`
- `facility_name_public`
- `city`
- `area`
- `consultation_modes`
- `languages`
- `listing_status`
- `visibility_status`
- `verification_status`
- `last_confirmed_at`

No private phone, private email, license documents, uploaded certificates, verification evidence, admin notes, patient data, booking data, payment data, review data, or rating data is selected.

Status:

```text
Pass
```

## Active/Public Filters

The helper applies both required public-read filters:

```text
listing_status = active
visibility_status = public
```

The helper orders results by:

```text
display_name
```

Status:

```text
Pass
```

## Return Shape

The helper returns a safe typed result union:

- `success` with `cards: PublicProviderCard[]`
- `unavailable` with empty cards, fallback guidance, and missing key names only
- `error` with empty cards, generic safe error code, and fallback guidance

The helper does not return raw Supabase error objects.

Status:

```text
Pass
```

## Mapper Findings

Successful rows are mapped into the existing `PublicProviderCard` shape.

Mapping reviewed:

- `id` maps to card `id`.
- `slug` maps to card `slug`.
- `display_name` and optional `title` map to card `name`.
- `specialty` maps to `categoryLabel` and `specialties`.
- `subspecialty` is included in `specialties` when present.
- `bio_public` or public facility affiliation text maps to `summary`.
- `city` and `area` map to `locationLabel`.
- `verification_status` maps into the existing verification status display vocabulary.
- `facility_name_public` maps to `affiliations`.
- `consultation_modes` maps to safe availability and telemedicine preview labels.

The mapper uses safe fallback text for missing optional fields.

Status:

```text
Pass
```

## Raw Error Safety

On query failure, the helper returns:

```text
errorCode: DOCTORS_PUBLIC_READ_FAILED
message: Supabase doctors public read failed. Use static doctor data.
```

It does not expose:

- Raw Supabase error objects
- SQL messages
- Policy names
- Project URLs
- Environment values
- Keys
- Stack traces

Status:

```text
Pass
```

## Route Wiring Check

Search confirmed the helper is not wired into the doctors page yet.

Current reference found:

```text
src/lib/supabase/doctors-public-read.ts
```

The `/doctors` page still renders:

```text
DoctorsPage
```

through:

```text
src/app/doctors/page.tsx
```

No Supabase import exists in the doctors route.

Status:

```text
Pass
```

## Active/Public Doctors Result

Database-side manual QA from `docs/DoctorsSQLManualExecutionQARecord.md` confirmed the active/public query returned:

- Test Doctor Alpha
- Test Doctor Eta Minimal
- Test Doctor Zeta Disputed

The helper is designed to return the same rows because it applies the same active/public filters.

Live helper invocation was not performed in this QA pass because no existing local TypeScript runtime runner is installed, and adding packages or committed probe routes was out of scope for this helper-only QA task.

Status:

```text
Design matches confirmed database QA; live helper invocation deferred
```

## Blocked Doctors Result

Database-side manual QA confirmed these blocked doctors did not appear in the active/public query:

- Test Doctor Beta Pending
- Test Doctor Gamma Archived
- Test Doctor Delta Hidden
- Test Doctor Epsilon Internal

The helper is designed to exclude them because it filters:

```text
listing_status = active
visibility_status = public
```

Status:

```text
Pass by query design and confirmed database QA
```

## Checks Run

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
- Build output kept `/doctors` static.

## Issues Found

No static helper implementation issue was found.

Remaining limitation:

- The helper was not live-invoked in this task. A future temporary internal probe or controlled source-wrapper QA task should confirm live Supabase results before wiring `/doctors`.

## Recommended Next Steps

1. Keep `/doctors` static for now.
2. Do not wire the doctors page until helper runtime QA is approved.
3. Add a temporary internal doctors public read probe in a later task if live confirmation is needed.
4. Confirm active/public rows render as cards before source-wrapper wiring.
5. Confirm blocked rows do not appear through the helper.
6. Preserve static fallback and route isolation.
7. Keep service-role keys out of frontend and public read paths.

## Summary

The doctors public read helper exists, uses the public anon client path only, queries only `public.doctors`, selects public-safe fields only, filters active/public rows, returns safe result states, avoids raw Supabase error exposure, and is not wired into the doctors page.

The expected active/public rows are Test Doctor Alpha, Test Doctor Eta Minimal, and Test Doctor Zeta Disputed. Blocked pending, archived, hidden, and internal doctors are excluded by the helper filters and confirmed database-side QA.
