# DigitalDirectory-v2 Supabase Local Env Setup Guide

## Purpose

This guide explains how to safely prepare local Supabase environment variables later, when the project is ready to test public listing reads from the Supabase test project.

This document uses placeholders only. It does not create `.env.local`, add real keys, add Supabase reads, change source wrapper code, change mapper code, change frontend UI, add authentication, or add backend functionality.

## Core Principle

Local Supabase environment setup should expose only browser-safe public values needed for future public reads.

The app must not use or reference a service-role key in browser code.

## Local Env Setup Purpose

The local env setup will eventually let the existing browser client helper know which Supabase test project to connect to.

This setup is for future public listing read testing only. It is not for authentication, admin access, provider dashboards, patient data, write operations, storage, Edge Functions, or protected routes.

## Required Env Variable Names

The existing helper files expect these exact variable names:

```text
NEXT_PUBLIC_SUPABASE_URL=<your-test-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-test-project-public-anon-key>
```

These are the only local variables needed for the current browser helper path.

Do not add `SUPABASE_SERVICE_ROLE_KEY` to browser-facing setup.

## Where To Find The Supabase Project URL

In the Supabase dashboard for the test project:

1. Open the intended test project, not production.
2. Go to the project settings area.
3. Find the API or project connection settings.
4. Copy the public project URL.
5. Use it later as the value for `NEXT_PUBLIC_SUPABASE_URL`.

Placeholder format:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project-ref.supabase.co
```

Do not paste the real project URL into repository documentation.

## Where To Find The Public Anon Or Publishable Key

In the same Supabase test project settings:

1. Open the API key section for the test project.
2. Locate the public anon or publishable key.
3. Confirm it is not the service-role key.
4. Use it later as the value for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Placeholder format:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

Do not paste the real anon key into repository documentation, chat, screenshots, or issue comments.

## Service-Role Key Safety

The service-role key is private and must never be exposed to browser code.

Rules:

- Do not place the service-role key in `.env.local` for browser-side testing.
- Do not use a `NEXT_PUBLIC_` prefix for any secret key.
- Do not commit, screenshot, or paste the service-role key anywhere.
- Do not use the service-role key to test public reads.
- Do not add service-role logic to `src/lib/supabase/browser-client.ts`.
- Do not add service-role logic to frontend pages, public listing source files, or mapper files.

If a server/admin client is needed later, it should be planned separately and reviewed with strict server-only boundaries.

## How To Create `.env.local` Later

When the team is ready for future local public read testing, create `.env.local` manually in the project root:

```text
NEXT_PUBLIC_SUPABASE_URL=<your-test-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-test-project-public-anon-key>
```

Keep this file local only.

Do not create `.env.local` as part of this documentation task.

## How To Confirm `.env.local` Is Ignored By Git

Before adding real local values, confirm `.env.local` is ignored by Git.

Safe checks later:

```text
git status --short
```

Expected behavior:

- `.env.local` should not appear as a file to commit.
- Real Supabase keys should never appear in `git diff`.
- If `.env.local` appears in Git status, stop and fix `.gitignore` before continuing.

Do not commit `.env.local`.

## What Not To Paste Into Chat, Docs, Or Screenshots

Do not paste or expose:

- Real Supabase project URLs.
- Real anon or publishable keys.
- Service-role keys.
- Database passwords.
- Connection strings.
- Supabase settings pages that show keys.
- Screenshots showing account, organization, project, or key details.
- Real provider data, patient data, documents, or admin notes.

Use placeholders in documentation and communication.

## How To Restart The Local Dev Server After Env Changes

Next.js reads environment variables at startup.

After `.env.local` is created or changed later:

1. Stop the local dev server.
2. Start it again.
3. Reopen or refresh the local app.

This makes the new `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values available to browser-side code.

## How To Verify The App Still Builds

After future env setup or code integration, run:

```text
npm.cmd run lint
npm.cmd run build
```

If using a shell where `npm` is not blocked, `npm run lint` and `npm run build` are also acceptable.

For this documentation-only task, no build is required because no app code changed.

## Relationship To Existing Helper Files

The current helper files already define a safe browser-side boundary:

- `src/lib/supabase/env.ts` reads only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `src/lib/supabase/env.ts` returns an unavailable state when values are missing.
- `src/lib/supabase/browser-client.ts` returns `null` when the public env values are missing.
- `src/lib/supabase/browser-client.ts` does not reference a service-role key.

This means missing local env values should not crash the app during import or build.

## Relationship To Public Listing Source Files

The public listing source remains static today:

- `src/lib/public-listing-source.ts` reports static seed data as the active public listing source.
- Supabase public listing reads are not connected yet.
- Mapper code remains compatible with static data and future public-safe provider shapes.

Local env setup alone should not change public listing behavior.

## Relationship To Future Facilities Public Read

The facilities SQL manual QA confirmed that the Supabase test project has expected active/public rows for later testing.

Future facilities public read work should:

- Use the public anon key only.
- Read only public-safe fields.
- Return active/public rows only.
- Preserve static fallback behavior.
- Avoid service-role usage.
- Avoid private fields, patient data, provider documents, and admin notes.
- Run a dedicated QA pass before expanding to doctors, pharmacies, diagnostics, services, or relationship tables.

## What Must Not Be Implemented Yet

Do not implement the following as part of local env setup:

- Supabase public listing reads.
- Source wrapper switching.
- Mapper changes.
- Authentication.
- Protected routes.
- Backend routes.
- Admin/server clients.
- SQL migrations.
- RLS policy changes.
- Storage buckets.
- Edge Functions.
- Real provider management.
- Patient data features.
- Payment, booking, notification, chatbot, or community features.

## Recommended Next Development Order

1. Keep this setup guide as the reference for future local env work.
2. Confirm `.env.local` is ignored before adding any local values later.
3. Add only the two public placeholder-backed variables locally when the team is ready.
4. Restart the local dev server after local env values are added.
5. Verify lint and build still pass.
6. Plan the first facilities public read implementation with static fallback preserved.
7. QA active/public reads against the confirmed facilities test rows.
8. Document the app-read QA result before expanding the Supabase read scope.
