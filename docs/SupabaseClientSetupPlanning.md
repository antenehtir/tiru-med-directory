# DigitalDirectory-v2 Supabase Client Setup Planning

## Purpose

This document defines how Supabase client setup should be introduced later in DigitalDirectory-v2.

It is documentation-only. It does not add Supabase client code, Supabase packages, `.env` files, SQL, migrations, RLS policies, backend functionality, authentication, dashboards, protected routes, storage, or frontend UI changes.

The goal is to define safe client boundaries, file organization, environment usage, public listing query strategy, seed fallback behavior, loading and error handling, type safety, and testing expectations before any real Supabase integration code is written.

---

## Core Principle

Supabase client code should be introduced only after environment variables, public listing schemas, and RLS rules are ready.

DigitalDirectory-v2 should not add a Supabase client simply because backend planning exists. The first client setup should be narrow, public-safe, and focused on read-only public listing data. Private operations, service role usage, auth, admin actions, storage, and Edge Functions should wait for later dedicated phases.

---

## Supabase Client Setup Purpose

Future Supabase client setup should provide:

- A browser-safe client for public reads that uses only public environment variables.
- A server-only/admin client boundary for future privileged workflows, if needed.
- Clear separation between public listing queries and private/internal data access.
- A fallback strategy while seed data and database-backed data overlap.
- Consistent loading and error states.
- Type safety tied to future schema definitions.
- Tests that prove no private data is exposed.

Client setup should not become a shortcut around RLS, admin review, provider ownership, auth, or patient privacy rules.

---

## Future File Organization

Future Supabase files should be small, explicit, and separated by runtime boundary.

Potential future file layout:

```text
src/lib/supabase/
  browser-client.ts
  server-client.ts
  admin-client.ts
  public-listings.ts
  errors.ts
  types.ts
```

Potential responsibilities:

| File | Future Purpose | Boundary |
| --- | --- | --- |
| `browser-client.ts` | Create browser-safe Supabase client | Public anon key only |
| `server-client.ts` | Server-side client for non-privileged server reads later | Server-only |
| `admin-client.ts` | Service-role client for rare privileged workflows later | Server-only, never browser |
| `public-listings.ts` | Public listing query helpers | Public-safe reads |
| `errors.ts` | Normalize query/loading errors | Shared |
| `types.ts` | Generated or hand-maintained types later | Shared |

Rules:

- Do not create these files in this planning task.
- Keep browser and server/admin clients separate.
- Avoid a single catch-all Supabase helper that can be misused everywhere.
- Public listing query helpers should not return private fields.
- Admin/service-role helpers should not be imported by client components.

---

## Browser Client Boundaries

The browser client should use only public-safe environment variables.

Future browser variables:

```text
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Browser client may later:

- Read published public listings.
- Read active public services.
- Read active public specialties.
- Read active public locations.
- Read reviewed public contact channels.
- Read reviewed public relationship tables.

Browser client must not:

- Use the service role key.
- Read private request/review tables.
- Read provider ownership tables.
- Read admin notes.
- Read audit logs.
- Read patient data.
- Read booking data.
- Read payment or wallet data.
- Read document vault data.
- Read chatbot logs.
- Read private community data.
- Perform privileged writes.

Rules:

- Browser client access must rely on RLS.
- Browser queries should request only fields needed by UI.
- Public read helpers should filter for published/public visibility.
- Browser error messages should not reveal internal table names or private details.

---

## Server and Admin Client Boundaries

Server-side client boundaries should be stricter than browser boundaries.

### Server Client

A future server client may use public anon credentials or session-aware credentials when auth exists.

Possible use cases:

- Server-rendered public listing reads.
- Future authenticated user workflows.
- Request validation before returning public data.

Rules:

- Server client does not automatically mean privileged access.
- Server client should still respect RLS unless intentionally using a server-only privileged path.
- Server code should not leak private query results into public props or JSON payloads.

### Admin Client

A future admin client may use the service role key only in server-only contexts.

Possible future use cases:

- Controlled admin review actions.
- Validated request processing.
- Search indexing jobs.
- Notification scheduling jobs.
- Payment webhook handling.
- Storage processing.
- Data migration scripts.

Rules:

- Do not create an admin client until a real server-side workflow needs it.
- Never import admin client code into client components.
- Never expose service role key to browser bundles.
- Keep admin actions narrow and auditable.
- Prefer RLS-respecting access where possible.

---

## Environment Variable Usage

Client setup depends on the environment setup guide.

Future variable usage:

| Variable | Client Boundary | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Public anon key protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/admin only | Privileged key, never browser |
| `SUPABASE_PROJECT_REF` | Server/tooling only | Optional setup/deployment reference |

Rules:

- Do not create `.env.local` in this task.
- Do not add real keys to docs.
- Do not add environment variable reads until client code is approved.
- Never prefix service role variables with `NEXT_PUBLIC_`.
- Validate required variables at startup later without printing secret values.
- Keep local, preview, staging, and production variables separate.

---

## Service Role Key Safety

The service role key bypasses RLS and must be treated as highly sensitive.

Rules:

- Never expose it in browser code.
- Never commit it.
- Never paste it into docs, PRs, issues, screenshots, or logs.
- Never use it for ordinary public listing reads.
- Use it only in secure server-side workflows later.
- Keep service role operations narrow.
- Audit actions that use privileged access.
- Rotate it immediately if it leaks.

Client setup rule:
If the first Supabase integration is read-only public listings, the service role key should not be required.

---

## Public Listing Query Strategy

The first query strategy should be public-safe and read-only.

Potential future public read helpers:

- `getPublishedFacilities`
- `getPublishedDoctors`
- `getPublishedPharmacies`
- `getPublishedDiagnosticsProviders`
- `getPublicLocations`
- `getPublicServices`
- `getPublicSpecialties`
- `getFacilityBySlug`
- `getDoctorBySlug`

Query rules:

- Select only public-safe fields.
- Filter by published listing status.
- Filter by public visibility status.
- Join only reviewed public relationships.
- Exclude private ownership, review, evidence, request, and audit fields.
- Keep search logic simple until a future search index exists.
- Do not fetch patient, booking, payment, document, chatbot, notification, or community data.

Example query intent in plain language:

```text
Fetch published facilities with public location, public services, and reviewed public contact channels.
```

This is not SQL or client code.

---

## Static Seed Fallback Strategy

Static seed data should remain useful while Supabase integration is phased in.

Current static seed layer:

- `src/data/seed-facilities.ts`
- `src/data/seed-doctors.ts`
- `src/data/seed-pharmacies.ts`
- `src/data/seed-diagnostics.ts`
- `src/data/seed-services.ts`
- `src/data/seed-specialties.ts`
- `src/data/seed-locations.ts`
- `src/data/seed-community-channels.ts`

Future fallback options:

| Strategy | Use |
| --- | --- |
| Seed-only | Current frontend-only state |
| Supabase with seed fallback | Temporary rollout while backend stabilizes |
| Supabase-only public listings | After RLS and data quality are proven |

Fallback rules:

- Seed data is sample-only and should not be treated as verified production data.
- Fallback should not hide backend errors in production without logging.
- Fallback should not mix stale sample data with real verified records without clear labeling.
- Fallback behavior should be environment-aware.
- Public UI should remain stable during the transition.

Recommended first rollout later:
Use static seed data until a small Supabase read-only public listing slice is ready and tested.

---

## Loading and Error Handling

Supabase-backed public pages need predictable loading and error behavior.

Future loading rules:

- Show stable page structure while public listing data loads.
- Avoid layout shifts in cards and grids.
- Keep mobile layouts usable.
- Use public-safe empty states.
- Do not show raw database errors to users.

Future error handling rules:

- Log detailed errors server-side when appropriate.
- Show generic public-facing messages.
- Do not reveal private table names, policies, keys, or internal IDs.
- Use seed fallback only when explicitly allowed.
- Distinguish no results from backend failure.
- Avoid retry loops that overload Supabase.

Public-facing error tone:

```text
We could not load these listings right now. Please try again shortly.
```

Avoid:

```text
RLS denied select on provider_ownerships.
```

---

## Type Safety Planning

Type safety should connect Supabase data to the existing frontend types carefully.

Current frontend data areas:

- Facility card types
- Doctor card types
- Pharmacy sample data
- Diagnostics sample data
- Seed provider types
- Location, service, specialty seed types

Future type strategy:

| Type Source | Use |
| --- | --- |
| Hand-written public DTO types | Early integration and stable UI boundaries |
| Generated Supabase database types | After migrations exist |
| Mapper functions | Convert database rows to UI card/detail props |
| Public listing DTOs | Prevent private fields from leaking to UI |

Rules:

- Do not pass raw database rows directly into broad UI surfaces if they include private fields.
- Use public DTOs for cards and detail pages.
- Keep database types separate from display types.
- Add mapper tests later.
- Regenerate types after schema changes later.
- Do not generate types in this planning task.

---

## Auth Boundary Planning

Supabase client setup should not imply auth launch.

Auth should wait for:

- Admin/reviewer workflows
- Provider ownership claims
- Provider dashboards
- Patient booking history
- Patient notification preferences
- Patient document vault
- Patient reviews requiring identity
- Community group membership

Client setup rules:

- Do not add auth helpers in the first public listing client slice.
- Do not require login for public browsing.
- Do not add protected routes.
- Do not store session assumptions in public listing queries.
- Add auth-aware server/browser clients only when a future auth task approves it.

Public listing reads should work without login.

---

## Admin and Server Action Planning Later

Admin/server actions should be planned separately from public client setup.

Future server actions may include:

- Provider registration processing
- Correction submission processing
- Feedback/contact submission processing
- Admin review decisions
- Provider ownership approval
- Verification updates
- Search indexing
- Notification scheduling
- Storage processing

Rules:

- Do not add server actions in this task.
- Do not add backend routes in this task.
- Public listing client setup should not include privileged mutations.
- Server actions using service role must be carefully scoped.
- Admin actions require auth, roles, RLS, audit logs, and dashboards.
- Public form submissions require validation, rate limits, abuse controls, and review queues.

---

## Testing Checklist

Future client setup should be tested before rollout.

Checklist:

1. Public listing queries use only public anon credentials.
2. Browser bundle does not contain service role key.
3. Missing public env vars fail safely during development.
4. Published public listings load successfully.
5. Draft, hidden, archived, rejected, and duplicate listings do not load publicly.
6. Private request/review/ownership/audit fields are never returned to public UI.
7. Public card and detail DTOs contain only public-safe fields.
8. Seed fallback works only where explicitly intended.
9. Backend errors show generic user-facing messages.
10. Empty states show when no public records match.
11. Mobile layouts remain stable during loading and error states.
12. RLS denial does not expose raw details in UI.
13. Public pages remain accessible without login.
14. Tests cover facilities, doctors, pharmacies, diagnostics, services, specialties, and locations.
15. Preview/staging uses non-production credentials.

No tests are added in this documentation task.

---

## What Must Not Be Implemented Yet

Do not implement any of the following in this task:

- Supabase package installation
- Supabase browser client
- Supabase server client
- Supabase admin client
- Environment files
- Real environment keys
- SQL
- Migrations
- RLS policies
- Backend routes
- Server actions
- Authentication
- Protected routes
- Dashboards
- Storage buckets
- Edge Functions
- Public form submissions
- Provider owner workflows
- Admin/reviewer workflows
- Patient workflows
- UI changes

This document is a planning artifact only.

---

## Relationship to Supabase Environment Setup Guide

This document depends on `SupabaseEnvironmentSetupGuide.md`.

Relationship:

- The environment guide defines placeholder variables and secret rules.
- This client setup plan defines where and how those variables may be used later.
- The environment guide separates anon and service role keys.
- This plan separates browser and server/admin clients.
- The environment guide warns against committing secrets.
- This plan warns against importing privileged clients into browser code.

Rule:
No client setup should begin until environment variable names and key safety rules are understood.

---

## Relationship to Public Listing Schema Draft

This document depends on `PublicListingSchemaDraft.md`.

Relationship:

- The schema draft defines future public listing tables and fields.
- This client plan defines future query helpers around those tables.
- The schema draft separates public and private fields.
- This client plan requires public DTOs and mapper functions to preserve that separation.
- The schema draft defines status fields.
- This client plan requires published/public visibility filters.

Rule:
Client queries should not be written until public-safe fields and status filters are final enough to test.

---

## Relationship to RLS Policy Planning

This document depends on `RLSPolicyPlanning.md`.

Relationship:

- RLS planning defines who can access data.
- Client setup defines how the app will request data.
- RLS protects data even if a client query is too broad.
- Client helpers should still request only the fields they need.
- Browser clients must rely on anon key plus RLS.
- Admin clients must remain server-only.

Rule:
No public client should connect to Supabase production until RLS policies are tested.

---

## MVP Recommendation

Do not add Supabase client setup in this documentation task.

Current MVP stance:

- Keep the app frontend-only.
- Keep static seed data active.
- Do not add Supabase packages.
- Do not add Supabase client files.
- Do not create `.env` files.
- Do not add SQL, migrations, or RLS policies.
- Do not add backend, auth, dashboards, protected routes, or storage.
- Do not modify frontend UI.

Recommended first implementation later:
Add a browser-safe read-only public listing client in a dedicated implementation task after environment variables, public schema, and RLS policies are ready in a development or staging Supabase project.

---

## Risks

Key risks:

- Adding client code before RLS is ready.
- Exposing service role key to the browser.
- Querying private fields into public UI.
- Treating sample seed data as production verified data.
- Removing seed fallback too early.
- Hiding backend errors with stale fallback data.
- Requiring auth for public browsing.
- Mixing public listing reads with admin/provider/patient workflows.
- Letting raw database rows leak into UI components.
- Logging private Supabase errors to users.
- Connecting preview deployments to production data accidentally.

Mitigations:

- Keep first client slice read-only and public-safe.
- Use anon key plus tested RLS for browser reads.
- Keep service role server-only.
- Use public DTOs and mapper functions.
- Keep seed fallback explicit and temporary.
- Test public/private data boundaries before rollout.
- Add auth and server/admin clients only in later dedicated tasks.

---

## Recommended Next Development Order

1. Keep DigitalDirectory-v2 frontend-only until Supabase implementation is approved.
2. Review `SupabaseEnvironmentSetupGuide.md`.
3. Review `PublicListingSchemaDraft.md`.
4. Review `RLSPolicyPlanning.md`.
5. Finalize environment variable names.
6. Finalize first public listing table fields.
7. Define public DTOs for facility, doctor, pharmacy, and diagnostics listings.
8. Define read-only query helper names and expected return shapes.
9. Implement Supabase package/client setup only in a future approved task.
10. Add public listing migrations and RLS in a future approved database task.
11. Test RLS and public read queries in staging.
12. Add seed fallback behavior intentionally.
13. Connect one public listing surface to Supabase as a narrow first slice.
14. Add public request submission only after validation and review queues are ready.
15. Add auth, provider/admin clients, dashboards, storage, booking, payments, documents, notifications, chatbot, and community features only in later phases.

---

## Summary

Supabase client setup should be introduced carefully and late enough that environment variables, public schemas, and RLS policies are already understood.

The safest first client setup is a browser-safe, read-only public listing client that uses the anon key with tested RLS, public DTOs, and seed fallback. Server/admin clients, service role usage, auth, protected routes, dashboards, storage, and advanced workflows should wait for later dedicated tasks.

The recommended current action is documentation only. No Supabase client code, packages, `.env` files, SQL, migrations, RLS policies, backend functionality, auth, dashboards, protected routes, storage, or frontend UI changes should be added in this task.
