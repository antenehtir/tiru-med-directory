-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- ROOT CAUSE FIX for "Something went wrong submitting your correction."
--
-- Confirmed live against the DB (service role + anon clients): the
-- public.correction_requests table exists, but NO role — not anon, not
-- authenticated, not even service_role — has been granted any privileges on
-- it. Every query returns Postgres error 42501 "permission denied for table
-- correction_requests", with a hint to run the exact GRANT statements below.
-- This is a table-level ACL gap (checked before RLS ever runs), not an RLS
-- policy gap — so it affects every caller: the public correction form
-- (src/components/corrections/CorrectionsPage.tsx), the feedback form
-- (src/components/feedback/FeedbackPage.tsx), and the admin dashboard count
-- (src/app/admin/(protected)/page.tsx).
--
-- This migration:
-- 1. Ensures the table + expected columns exist (idempotent — safe even
--    though the table is already live, matches the columns every current
--    caller in the codebase writes/reads).
-- 2. Enables RLS.
-- 3. Grants anon INSERT (open public submission form — no auth required)
--    and authenticated SELECT (for the admin dashboard, which reads via the
--    anon key + a logged-in session per src/lib/supabase/admin-client.ts).
-- 4. Adds the matching RLS policies: anon can insert (with check true),
--    admin_users members can select. Mirrors the existing admin_users
--    membership pattern used for facilities/facility_claims policies.

create table if not exists public.correction_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  provider_name text,
  correction_type text not null,
  description text,
  submitter_name text,
  submitter_contact text
);

alter table public.correction_requests
  add column if not exists provider_name text,
  add column if not exists correction_type text,
  add column if not exists description text,
  add column if not exists submitter_name text,
  add column if not exists submitter_contact text;

alter table public.correction_requests enable row level security;

grant usage on schema public to anon;
grant insert on table public.correction_requests to anon;
grant select on table public.correction_requests to authenticated;

drop policy if exists "Anon can submit correction requests" on public.correction_requests;

create policy "Anon can submit correction requests"
on public.correction_requests
for insert
to anon
with check (true);

drop policy if exists "Admins can read correction requests" on public.correction_requests;

create policy "Admins can read correction requests"
on public.correction_requests
for select
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
);

NOTIFY pgrst, 'reload schema';
