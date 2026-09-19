-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- WHY: the name, role and phone numbers on a provider account are what the
-- verification call checked. Until now a provider could change all of them
-- from Account settings at any time — including after Tiru had called the
-- facility and approved them — so the person on record could be swapped
-- without anyone noticing.
--
-- After this migration:
--   * Once a provider has SUBMITTED (a claim in pending_review) or been
--     APPROVED, those details are locked. The app shows them read-only.
--   * Changes go through a request: the provider fills in the new value and a
--     reason, and an admin approves or declines it on Provider Submissions →
--     Account changes. Approving writes the new value.
--   * Before submission (still filling in) and after a rejection (fixing
--     what was wrong) the provider edits them freely, as now.
--
-- The lock is a BEFORE UPDATE trigger, the same pattern as 062 — admins use
-- the same `authenticated` role, so a column GRANT would lock them out too.
-- Admin sessions and the SQL editor pass through unchanged.
--
-- BEFORE — read-only. Expect the table not to exist yet (0 rows) and the
-- trigger not to exist (0 rows):
--
--   select count(*) as table_exists from information_schema.tables
--   where table_schema = 'public' and table_name = 'account_change_requests';
--
--   select count(*) as trigger_exists from information_schema.triggers
--   where trigger_name = 'provider_accounts_identity_lock';

-- ---------------------------------------------------------------------------
-- The request queue
-- ---------------------------------------------------------------------------
create table if not exists public.account_change_requests (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_accounts(id) on delete cascade,
  field text not null check (field in ('display_name', 'claimant_role', 'phone', 'facility_phone')),
  current_value text,
  requested_value text not null check (length(trim(requested_value)) > 0),
  reason text not null check (length(trim(reason)) > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.admin_users(id),
  reviewed_at timestamptz,
  admin_note text
);

create index if not exists account_change_requests_pending_idx
  on public.account_change_requests (created_at desc) where status = 'pending';

alter table public.account_change_requests enable row level security;

grant select, insert, update on public.account_change_requests to authenticated;

-- A provider files requests for their own account only, always as pending.
drop policy if exists "account_change_requests: provider inserts own" on public.account_change_requests;
create policy "account_change_requests: provider inserts own"
  on public.account_change_requests for insert to authenticated
  with check (
    provider_id = auth.uid()
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
    and admin_note is null
  );

-- ...and sees their own, so Account settings can show what is pending.
drop policy if exists "account_change_requests: provider reads own" on public.account_change_requests;
create policy "account_change_requests: provider reads own"
  on public.account_change_requests for select to authenticated
  using (provider_id = auth.uid());

-- Admins read and decide every request.
drop policy if exists "account_change_requests: admin reads all" on public.account_change_requests;
create policy "account_change_requests: admin reads all"
  on public.account_change_requests for select to authenticated
  using (public.tiru_is_admin_session());

drop policy if exists "account_change_requests: admin decides" on public.account_change_requests;
create policy "account_change_requests: admin decides"
  on public.account_change_requests for update to authenticated
  using (public.tiru_is_admin_session())
  with check (public.tiru_is_admin_session());

-- ---------------------------------------------------------------------------
-- The lock on provider_accounts
-- ---------------------------------------------------------------------------
create or replace function public.guard_provider_accounts_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.tiru_is_end_user_request() or public.tiru_is_admin_session() then
    return new;
  end if;

  if (
       new.display_name        is distinct from old.display_name
    or new.claimant_role       is distinct from old.claimant_role
    or new.claimant_role_other is distinct from old.claimant_role_other
    or new.phone               is distinct from old.phone
    or new.facility_phone      is distinct from old.facility_phone
    or new.claimant_phone      is distinct from old.claimant_phone
  ) and (
       old.status = 'approved'
    or exists (
         select 1 from public.facility_claims c
         where c.provider_id = old.id and c.status = 'pending_review'
       )
  ) then
    raise exception 'Account details are locked after submission. Request a change from Account settings.';
  end if;

  return new;
end;
$$;

drop trigger if exists provider_accounts_identity_lock on public.provider_accounts;
create trigger provider_accounts_identity_lock
  before update on public.provider_accounts
  for each row execute function public.guard_provider_accounts_identity();

-- AFTER — read-only. Expect 1 and 1:
--
--   select count(*) as table_exists from information_schema.tables
--   where table_schema = 'public' and table_name = 'account_change_requests';
--
--   select count(*) as trigger_exists from information_schema.triggers
--   where trigger_name = 'provider_accounts_identity_lock';
