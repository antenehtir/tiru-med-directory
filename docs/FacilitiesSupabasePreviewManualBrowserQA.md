# DigitalDirectory-v2 Facilities Supabase Preview Manual Browser QA

## Purpose

This document guides manual browser QA for the `/facilities` page after Supabase preview mode was enabled.

It is documentation-only. It does not modify app code, frontend UI, authentication, backend functionality, protected routes, SQL, migrations, RLS policies, test data, patient data, booking/payment/document/admin workflows, or any other public routes.

The goal is to help confirm whether `/facilities` renders the expected active/public Supabase facility rows in a local browser, or safely falls back to static facility cards.

## Manual Browser QA Purpose

Manual browser QA should answer:

- Does `/facilities` load without crashing?
- Does `/facilities` request preview mode through the source wrapper?
- Are expected active/public Supabase rows visible when the test project is reachable?
- Are blocked rows absent?
- Does static fallback keep the page usable if Supabase is unavailable, failing, or empty?
- Do browser console and terminal output avoid secrets and raw public-facing errors?
- Are other public routes still isolated from Supabase preview mode?

This QA is a local verification step before any broader public listing read rollout.

## Starting Local Dev Server

Before starting:

1. Confirm `.env.local` exists locally only.
2. Confirm `.env.local` is ignored by Git.
3. Do not paste or screenshot real Supabase values.
4. Confirm only these public variables are needed locally:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Do not add or use:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Start the local development server:

```powershell
npm.cmd run dev
```

If port 3000 is already in use, use the URL shown by the local server output.

Do not commit runtime output, `.env.local`, screenshots containing keys, or temporary debug files.

## Opening The Facilities Page

Open:

```text
http://localhost:3000/facilities
```

Expected baseline behavior:

- The page loads without a crash.
- The existing facilities page layout remains visually unchanged.
- Header, footer, search preview, filter chips, facility cards, trust block, and request facility addition CTA remain present.
- No login, account, admin, booking, payment, upload, or protected route behavior appears.
- No debug banner or raw Supabase error appears in the UI.

## Expected Supabase Rows

If Supabase preview mode succeeds, the facilities list should show these active/public test rows:

| Slug | Display name | Listing status | Visibility status | Verification status |
| --- | --- | --- | --- | --- |
| `test-facility-alpha` | Test Facility Alpha | `active` | `public` | `verified` |
| `test-facility-eta-minimal` | Test Facility Eta Minimal | `active` | `public` | `unverified` |
| `test-facility-zeta-disputed` | Test Facility Zeta Disputed | `active` | `public` | `disputed` |

Expected visual interpretation:

- Test Facility Alpha should display as a verified-style facility card.
- Test Facility Eta Minimal may display with community-submitted style because `unverified` maps to the public `community-submitted` badge.
- Test Facility Zeta Disputed may display with community-submitted style because `disputed` maps to the public `community-submitted` badge.
- Missing optional public fields should use safe fallback labels such as location or hours fallback text.

## Blocked Rows That Must Not Appear

The following rows must not appear on `/facilities` through preview mode:

- `test-facility-beta-pending`
- `test-facility-gamma-archived`
- `test-facility-delta-hidden`
- `test-facility-epsilon-internal`

If any blocked row appears:

1. Stop the QA pass.
2. Do not expand Supabase preview mode.
3. Review RLS policy behavior and query filters.
4. Confirm the page still filters `listing_status = 'active'` and `visibility_status = 'public'`.
5. Do not weaken RLS to make preview mode pass.

## Static Fallback Interpretation

If `/facilities` shows static sample rows instead of Supabase test rows, expect to see cards such as:

- Addis Health Center
- Unity Medical Clinic
- Sunrise Diagnostic Lab
- Kazanchis Community Clinic

This means static fallback likely protected the page.

Static fallback is acceptable when:

- Supabase environment variables are missing.
- The Supabase browser client is unavailable.
- The query fails.
- Supabase returns an empty result.
- The test project is unreachable.

Static fallback is safe, but it does not prove live Supabase preview-row rendering. If fallback appears, record it and investigate separately without exposing env values.

## Browser Console Safety Check

Open browser developer tools and inspect the console.

Acceptable:

- No console errors.
- Framework development warnings that are unrelated to Supabase preview.
- Generic network or fetch failures that do not expose secrets.

Not acceptable:

- Real Supabase keys printed in the console.
- `.env.local` values printed in the console.
- Service-role key references.
- Raw database policy details displayed as public UI errors.
- Repeated runtime crashes.
- Hydration mismatch warnings caused by this page.

If unsafe output appears, stop QA and remove the unsafe logging or behavior in a separate focused fix.

## Terminal Safety Check

Review the local dev server terminal output.

Acceptable:

- Normal Next.js startup output.
- Route compilation messages.
- Generic request logs.

Not acceptable:

- Real Supabase URL or key printed in terminal output.
- Service-role key references.
- Raw database error payloads intended for public users.
- Repeated server crashes.
- Build/runtime errors caused by `/facilities`.

Do not paste terminal output containing secrets into docs, chat, screenshots, commits, or issue comments.

## Other Route Spot Checks

Spot-check these routes to confirm preview mode is isolated:

```text
http://localhost:3000/
http://localhost:3000/search
http://localhost:3000/nearby
http://localhost:3000/facilities/addis-health-center
http://localhost:3000/doctors
http://localhost:3000/pharmacies
http://localhost:3000/diagnostics
```

Expected:

- These routes still render their existing static or preview-only UI.
- Search, nearby, detail, doctors, pharmacies, and diagnostics pages do not switch to Supabase data.
- No new auth, backend, booking, payment, upload, admin, or protected-route behavior appears.
- Existing navigation remains stable.

## Git Safety Check

After manual QA, confirm:

- `.env.local` is still ignored by Git.
- No secrets were added to tracked files.
- No runtime files or screenshots were added accidentally.
- No app code changed during manual QA.

Recommended local check:

```powershell
git status --short
```

Expected for this task:

- Only this documentation file should be new if no other work is in progress.
- `.env.local` should not appear.

## Manual QA Checklist

Use this checklist during browser QA:

- [ ] Local dev server starts.
- [ ] `/facilities` opens.
- [ ] Page layout is visually stable.
- [ ] No blank facility section appears.
- [ ] No blank buttons appear.
- [ ] No raw Supabase error appears in the UI.
- [ ] Expected Supabase active/public rows appear, or static fallback rows appear.
- [ ] Blocked rows do not appear.
- [ ] Browser console does not expose secrets.
- [ ] Terminal output does not expose secrets.
- [ ] Homepage still uses existing behavior.
- [ ] Search page remains unwired to Supabase.
- [ ] Nearby page remains unwired to Supabase.
- [ ] Facility detail page remains unwired to Supabase.
- [ ] Doctors page remains unwired to Supabase.
- [ ] Pharmacies page remains unwired to Supabase.
- [ ] Diagnostics page remains unwired to Supabase.
- [ ] `.env.local` remains ignored.
- [ ] No app code was modified during QA.

## Decision Rules After QA

If expected Supabase rows appear and blocked rows do not appear:

1. Record the manual QA result.
2. Keep preview mode limited to `/facilities`.
3. Run lint and build before any follow-up implementation task.
4. Plan a narrow QA document confirming the successful browser result.

If static fallback appears:

1. Record that fallback appeared.
2. Treat the page as safe but not live-read confirmed.
3. Check env setup, test project availability, RLS, and active/public test rows.
4. Do not expand Supabase wiring until live preview rows are confirmed.

If blocked rows appear:

1. Stop immediately.
2. Do not expand Supabase wiring.
3. Review RLS and query filters.
4. Fix the issue in a separate focused task.

If secrets appear:

1. Stop immediately.
2. Remove unsafe output in a separate focused task.
3. Rotate any exposed secret if needed.
4. Do not paste the exposed value anywhere.

## What Must Not Be Implemented Yet

Do not implement the following during this manual browser QA phase:

- App code changes.
- Frontend UI changes.
- Authentication.
- Backend functionality.
- Protected routes.
- SQL.
- Migrations.
- RLS policies.
- Test data inserts.
- Patient data.
- Booking, payment, document, notification, or admin workflows.
- Search wiring.
- Nearby wiring.
- Facility detail wiring.
- Doctors wiring.
- Pharmacies wiring.
- Diagnostics wiring.
- Service-role browser usage.
- Secret logging.

## Recommended Next Development Order

1. Run the manual browser QA using this guide.
2. Record whether `/facilities` showed Supabase rows or static fallback.
3. Confirm blocked rows did not appear.
4. Confirm no secrets appeared in browser or terminal output.
5. Confirm other routes remain isolated.
6. If live preview rows are confirmed, create a QA result document for the browser pass.
7. If fallback persists, investigate env, RLS, query, and test data in a separate focused task.
8. Keep static fallback active.
9. Keep Supabase preview limited to `/facilities`.
10. Only after manual QA is confirmed, plan the next controlled public read step.
