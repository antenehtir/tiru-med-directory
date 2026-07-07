-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
-- Depends on 029_correction_requests_grants_and_rls.sql having been run first
-- (that migration grants the base table access this one builds on).
--
-- Adds an admin review workflow to public.correction_requests, which today
-- has no status tracking at all — submitted corrections land in the table
-- with no way for an admin to mark them reviewed/resolved/dismissed.
--
-- Confirmed actual columns on this table (from 029 and the app code that
-- writes to it — src/components/corrections/CorrectionsPage.tsx,
-- src/components/feedback/FeedbackPage.tsx): id, created_at, provider_name,
-- correction_type, description, submitter_name, submitter_contact. There is
-- no facility_id, and no separate current_value/suggested_value columns —
-- both are folded into the single `description` text field by the submit
-- handler. This migration only adds the review-workflow columns; it does not
-- rename or restructure the existing ones.

alter table public.correction_requests
  add column if not exists status text not null default 'pending',
  add column if not exists reviewed_by uuid references admin_users(id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists admin_note text;

alter table public.correction_requests drop constraint if exists correction_requests_status_check;

alter table public.correction_requests
  add constraint correction_requests_status_check
  check (status in ('pending', 'reviewed', 'resolved', 'dismissed'));

-- Admin review actions run through createAdminSupabaseClient() (anon key +
-- the admin's own session), same as every other admin write in this app —
-- see src/lib/supabase/admin-client.ts. 029 only granted authenticated
-- SELECT; without UPDATE here, admin status changes would hit the same
-- silent-0-rows-or-42501 failure class fixed in 028/029.
grant update on table public.correction_requests to authenticated;

drop policy if exists "Admins can update correction requests" on public.correction_requests;

create policy "Admins can update correction requests"
on public.correction_requests
for update
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
);

NOTIFY pgrst, 'reload schema';
