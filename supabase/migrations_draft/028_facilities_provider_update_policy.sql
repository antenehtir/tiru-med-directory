-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- ROOT CAUSE FIX for live-sync silently not updating the public facilities row.
--
-- Every provider-facing write in this app (createProviderSupabaseClient) goes
-- through the anon key + the user's own session, scoped entirely by RLS — the
-- app never uses the service role key. The admin approval path works the same
-- way and is able to write to facilities because there is an RLS UPDATE policy
-- scoped to admin_users membership. No equivalent UPDATE policy exists for the
-- provider role, so when an approved provider edits their listing and
-- autoSaveStepN pushes the change straight to facilities (see
-- src/lib/provider/facility-field-mapping.ts and the 5 onboarding actions.ts
-- files), the UPDATE statement runs, matches 0 rows under RLS, and returns
-- success with no error — there is nothing for the existing error-logging
-- (added in commit 9ac60a0) to catch, because Postgres does not raise an error
-- for an UPDATE whose RLS-filtered WHERE clause matches no rows.
--
-- This grants an approved provider UPDATE on exactly the one facilities row
-- their own provider_accounts.facility_id points to, only while their status
-- is 'approved'. Mirrors the existing "Providers can update their own account"
-- policy already in place on provider_accounts.

alter table facilities enable row level security;

drop policy if exists "Providers can update their own approved facility" on facilities;

create policy "Providers can update their own approved facility"
on facilities
for update
to authenticated
using (
  id in (
    select facility_id from provider_accounts
    where provider_accounts.id = auth.uid()
      and provider_accounts.status = 'approved'
      and provider_accounts.facility_id is not null
  )
)
with check (
  id in (
    select facility_id from provider_accounts
    where provider_accounts.id = auth.uid()
      and provider_accounts.status = 'approved'
      and provider_accounts.facility_id is not null
  )
);

NOTIFY pgrst, 'reload schema';
