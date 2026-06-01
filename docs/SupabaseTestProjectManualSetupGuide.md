# DigitalDirectory-v2 Supabase Test Project Manual Setup Guide

## Purpose

This document defines the manual steps and safety rules for creating a Supabase test project for DigitalDirectory-v2.

It is documentation-only. It does not create a Supabase project, create tables, add SQL, add migrations, add RLS policies, insert test data, add Supabase reads, modify source wrapper code, modify mapper code, add authentication, add backend functionality, add protected routes, modify frontend UI, create `.env.local`, add real keys, commit, or push.

The goal is to prepare a safe test project before any schema, test data, RLS, or public read implementation work begins.

---

## Core Principle

The first Supabase project for DigitalDirectory-v2 should be a test project with no sensitive data.

It should exist only to validate public listing schemas, RLS expectations, public anon key behavior, mapper compatibility, static fallback, and future read-only public listing integration.

---

## Manual Setup Purpose

Manual setup should help the team:

- Create a clearly non-production Supabase project.
- Keep keys out of git.
- Separate public anon key usage from service-role key safety.
- Prepare local environment values without creating repository files.
- Avoid adding tables, data, auth, storage, or Edge Functions too early.
- Establish a safe foundation for future public listing read testing.

Manual setup should stop after project creation and key handling are understood.

---

## Why a Test Project Is Needed

A test project is needed because healthcare directory data can become sensitive or misleading if handled carelessly.

Reasons:

- Public listing schema needs to be tested without production data.
- RLS behavior needs positive and negative tests.
- Environment handling needs practice without production secrets.
- Mapper output needs safe mock rows later.
- Static fallback needs a safe Supabase-unavailable path.
- Future public reads should be proven before touching production.

The test project should not become production by accident.

---

## Supabase Account and Workspace Preparation

Before creating the project:

1. Confirm which Supabase account or organization owns DigitalDirectory-v2 test infrastructure.
2. Confirm who should have dashboard access.
3. Confirm the project is for testing only.
4. Confirm no real patient or provider-sensitive data will be uploaded.
5. Confirm secrets will be stored outside git.
6. Confirm the project will not be connected to production deployments.

Access rule:

```text
Only trusted project contributors should have Supabase dashboard access.
```

---

## Test Project Creation Steps

Manual steps for later setup:

1. Sign in to Supabase.
2. Choose the approved workspace or organization.
3. Create a new project.
4. Use a clear test-only project name.
5. Select a region according to the guidance below.
6. Generate or store the database password in a secure password manager.
7. Wait for project provisioning to complete.
8. Open project settings.
9. Record the project URL outside git.
10. Record the public anon or publishable key outside git.
11. Store the service-role key securely, but do not use it for frontend work.
12. Confirm no tables, data, policies, auth settings, storage buckets, or Edge Functions are created yet.

This guide does not perform these steps.

---

## Project Naming Recommendation

Recommended project name:

```text
digitaldirectory-v2-test
```

Alternative acceptable names:

```text
digitaldirectory-v2-dev
digitaldirectory-v2-public-read-test
```

Naming rules:

- Include `test` or `dev`.
- Avoid names that could be mistaken for production.
- Do not reuse a production project for early experiments.
- Do not promote a test project to production unless it is intentionally reviewed and cleaned.

---

## Region Selection Guidance

Choose a region deliberately.

Selection considerations:

- Development team access speed.
- Expected future user geography.
- Data residency expectations.
- Supabase availability.
- Consistency with later staging/production decisions.

Guidance:

- For a test project, choose a practical region that supports stable development.
- Do not treat the test region as a final production region decision.
- Document the chosen region outside git or in non-secret project notes.
- Revisit region choice before production.

---

## Project URL and Key Handling

Supabase will provide project values after setup.

Expected values later:

```text
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Handling rules:

- Store real values outside git.
- Do not paste real values into documentation.
- Do not paste real values into issues, PR comments, chat logs, or screenshots.
- Do not commit `.env.local`.
- Do not print keys in build or runtime logs.
- Rotate keys if they are exposed.

Current helper files expect only public browser-safe values:

- `src/lib/supabase/env.ts`
- `src/lib/supabase/browser-client.ts`

---

## Public Anon and Publishable Key Usage

The public anon or publishable key may be visible to browser users later.

Rules:

- Treat the public key as visible.
- Do not rely on the public key for privacy.
- Rely on RLS to protect data.
- Use it only for public-safe reads at first.
- Do not use it to read private tables.
- Do not use it for admin, reviewer, provider-owner, patient, booking, payment, document, chatbot, notification, or community-private workflows.

Future local variables should use:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Secret and Service-Role Key Safety

The service-role key is privileged and bypasses RLS.

Rules:

- Never expose the service-role key in browser code.
- Never prefix the service-role key with `NEXT_PUBLIC_`.
- Never paste it into docs.
- Never commit it.
- Never put it in screenshots.
- Never use it for public listing reads.
- Store it only in a secure secret manager when a future server-side workflow truly needs it.
- Rotate it immediately if exposed.

Current implementation rule:

```text
DigitalDirectory-v2 public listing reads must not use the service-role key.
```

---

## Local Environment Variable Plan

When a future implementation task explicitly asks for local Supabase testing, developers may create local environment values on their own machine.

Future local-only `.env.local` shape:

```text
NEXT_PUBLIC_SUPABASE_URL=YOUR_TEST_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_TEST_PROJECT_ANON_OR_PUBLISHABLE_KEY
```

Rules:

- Use test project values only.
- Do not use production values locally during early testing.
- Restart the dev server after changing env vars.
- Do not create `.env.local` in this task.
- Do not commit `.env.local`.
- Do not add `.env.example` unless a future task explicitly requests it.

---

## `.env.local` Safety

`.env.local` should remain local to each developer machine.

Safety checklist:

1. Confirm `.env.local` is ignored by git.
2. Add only test project values during early integration.
3. Do not store service-role keys unless a future server-side task requires them.
4. Do not copy `.env.local` into docs or chat.
5. Do not share screenshots that reveal `.env.local`.
6. Do not include `.env.local` in support bundles.
7. Rotate any key that appears in git, screenshots, terminal recordings, logs, or shared messages.

This task does not create `.env.local`.

---

## What Not to Screenshot or Share

Do not screenshot or share:

- Service-role key.
- Database password.
- JWT secret.
- Connection strings.
- Full `.env.local` file.
- API settings page showing keys.
- Private project settings.
- Real test user emails or phone numbers.
- Any future patient-like data.
- Verification documents.
- Audit logs.
- Admin or reviewer notes.

Safe to share in docs:

- Placeholder variable names.
- Non-secret setup steps.
- High-level project naming guidance.
- Public planning checklists.

---

## What Not to Create Yet

Do not create the following during manual test project setup:

- Tables.
- SQL.
- Migrations.
- RLS policies.
- Storage buckets.
- Edge Functions.
- Auth providers.
- Admin users.
- Provider accounts.
- Patient accounts.
- Test data rows.
- Public read helpers.
- Backend routes.
- Protected routes.
- Scheduled jobs.
- Webhooks.

The first setup step is only project creation and key handling preparation.

---

## Manual Checklist Before Continuing

Before moving to table/schema work, confirm:

1. Test project exists and is clearly non-production.
2. Project owner/workspace is approved.
3. Region choice is documented.
4. Project URL is stored outside git.
5. Public anon/publishable key is stored outside git.
6. Service-role key is stored securely and not used in frontend work.
7. No real patient or provider-sensitive data exists in the project.
8. No tables have been created yet unless a later task explicitly requested them.
9. No `.env.local` was committed.
10. No screenshots reveal keys.
11. Team understands that public reads require RLS before production.
12. Team understands that static data remains the current app source.

---

## Relationship to Existing Supabase Helper Files

Current helper files:

- `src/lib/supabase/env.ts`
- `src/lib/supabase/browser-client.ts`

Relationship:

- The helpers expect `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Missing env vars return a safe unavailable/null state.
- The browser client helper does not use service-role keys.
- These helpers should not be connected to reads until a future read implementation task.

This guide explains how real test values should be handled later without committing them.

---

## Relationship to Public Listing Read Planning

This guide supports `SupabasePublicListingReadPlanning.md`.

Relationship:

- Read planning defines the first future read-only public listing implementation.
- This guide defines how to safely create the test project before that work.
- Read planning recommends facilities first.
- This guide stops before tables, data, RLS, or read helpers are added.

---

## Relationship to Test Data Setup Plan

This guide supports `SupabasePublicListingTestDataSetupPlan.md`.

Relationship:

- Manual setup creates the safe project shell.
- Test data setup later defines fictional records for public and blocked read outcomes.
- Test data should not be inserted until schema and RLS work is explicitly approved.
- Both documents require no real patient or provider-sensitive data.

---

## MVP Recommendation

MVP recommendation:

- Create a non-production Supabase test project manually only when ready.
- Store project URL and public anon/publishable key outside git.
- Do not use service-role key in frontend work.
- Do not create tables or data during initial project setup.
- Keep public pages static.
- Keep source wrapper static-first.
- Add schema, RLS, test data, and reads only through later dedicated tasks.

---

## Risks

Key risks:

- Creating a project that is mistaken for production.
- Pasting keys into the repository.
- Sharing screenshots that reveal secrets.
- Using service-role keys in frontend work.
- Connecting preview deployments to production data.
- Creating tables or data before RLS expectations are ready.
- Uploading real patient or provider-sensitive data.
- Treating public anon key as private security.

Mitigations:

- Use clear test project naming.
- Store keys outside git.
- Share placeholders only.
- Keep service-role key secure and unused for public reads.
- Keep test data fictional later.
- Review RLS planning before any public tables are tested.
- Keep static source as the default until read QA passes.

---

## Recommended Next Development Order

1. Keep the current app static-first.
2. Review this manual setup guide.
3. Create the Supabase test project manually only when approved.
4. Store project URL and public anon/publishable key outside git.
5. Confirm no keys or `.env.local` are committed.
6. Review public listing schema draft.
7. Review RLS planning.
8. Plan schema/table creation in a separate task.
9. Plan fictional test data insertion in a separate task.
10. Add read-only public query helpers only after schema, RLS, and test data are ready.
11. Keep source wrapper static until read output is QA-approved.

---

## Summary

The Supabase test project should be created manually as a safe, non-production shell before any schema, data, RLS, or read implementation work begins.

This guide covers account preparation, project creation, naming, region choice, URL/key handling, anon key use, service-role key safety, local environment planning, `.env.local` safety, screenshot rules, what not to create yet, and next development order. It adds no code, keys, env files, tables, SQL, migrations, RLS policies, Supabase reads, backend functionality, authentication, protected routes, UI changes, commits, or pushes.
