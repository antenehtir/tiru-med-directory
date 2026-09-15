-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- CONTEXT: audit_log only ever recorded admin actions (every existing row
-- has admin_id set, entry point is always an authenticated admin session —
-- see the ~12 call sites across src/app/admin/**/actions.ts). Nothing wrote
-- an entry when a provider edited their own listing, which is exactly how
-- the missing-RLS-policy bug (028) went unnoticed for 2.5 months: a
-- provider's edit could silently fail to reach the public page and nothing,
-- anywhere, would say so.
--
-- src/lib/provider/facility-field-mapping.ts now has syncToFacilityIfApproved(),
-- called from all 5 onboarding autoSaveStepN actions, which logs to
-- audit_log on every attempt — success, a Postgres error, or the 0-rows-
-- silently-blocked case this whole investigation started from. It writes
-- through the PROVIDER's own session (anon key + RLS), so it needs:
--   1. admin_id nullable (every row so far has had it set NOT NULL if it was
--      ever declared that way at all; a provider has no admin_id to give).
--   2. A new provider_id column identifying which provider made the entry,
--      so /admin/audit-log can show who without stuffing it into free text.
--   3. An RLS INSERT policy scoped the same way 028 scoped the facilities
--      UPDATE policy: an approved provider may only insert audit_log rows
--      naming themselves and their own facility.
--
-- admin_id's exact current nullability could not be verified directly before
-- writing this file — the service role key is denied SELECT on both
-- admin_users and audit_log (deliberately, per whatever earlier hardening
-- revoked those grants), so this could not be queried the way every other
-- migration this project has written was verified. `alter column ... drop
-- not null` is a no-op if the column is already nullable, so this is safe
-- either way; there was no way to confirm the "already nullable" case here
-- the way this project's migrations normally confirm state before writing
-- SQL, so read this file over once yourself before running it.

alter table audit_log alter column admin_id drop not null;

alter table audit_log add column if not exists provider_id uuid references provider_accounts(id) on delete set null;

alter table audit_log enable row level security;

drop policy if exists "Providers can log their own facility edits" on audit_log;

create policy "Providers can log their own facility edits"
on audit_log
for insert
to authenticated
with check (
  provider_id = auth.uid()
  and entity_type = 'facility'
  and entity_id::uuid in (
    select facility_id from provider_accounts
    where provider_accounts.id = auth.uid()
      and provider_accounts.status = 'approved'
      and provider_accounts.facility_id is not null
  )
);

NOTIFY pgrst, 'reload schema';
