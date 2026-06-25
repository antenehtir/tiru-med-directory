-- DigitalDirectory-v2 provider_accounts table migration.
-- ACTION REQUIRED — unlike the other files in this folder, this one is not a
-- shelved planning draft. The new Provider Portal (src/app/provider/**) reads
-- and writes public.provider_accounts directly, so this must be run against
-- the live Supabase project (SQL Editor) before /provider/signup or
-- /provider/login will work. Nothing else in this folder was ever applied
-- (001-010 use a different, abandoned schema design), so this migration is
-- self-contained and does not depend on any of them having been run.
--
-- Scope:
-- - Creates public.provider_accounts, one row per provider auth user.
-- - id is the same UUID as the Supabase Auth user (auth.users.id).
-- - facility_id is an optional link to the live public.facilities table,
--   set once a provider claims an existing listing or completes a new one.
-- - RLS restricts every row to its own owner (id = auth.uid()); there is no
--   public/anon access. Admin tooling reads this table via the service-role
--   key, which bypasses RLS, so no separate admin policy is needed.

create table if not exists public.provider_accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  phone text,
  facility_id uuid references public.facilities (id) on delete set null,
  status text not null default 'draft',
  admin_note text,
  terms_accepted boolean not null default false,
  terms_accepted_at timestamptz,
  onboarding_phase integer not null default 0,
  completion_pct integer not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint provider_accounts_status_check
    check (status in ('draft', 'pending_review', 'approved', 'rejected')),
  constraint provider_accounts_onboarding_phase_non_negative
    check (onboarding_phase >= 0),
  constraint provider_accounts_completion_pct_range
    check (completion_pct >= 0 and completion_pct <= 100)
);

comment on table public.provider_accounts is
  'One row per Provider Portal auth user. id matches the auth.users id.';

create index if not exists provider_accounts_facility_id_idx
  on public.provider_accounts (facility_id);

create index if not exists provider_accounts_status_idx
  on public.provider_accounts (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists provider_accounts_set_updated_at on public.provider_accounts;

create trigger provider_accounts_set_updated_at
before update on public.provider_accounts
for each row
execute function public.set_updated_at();

alter table public.provider_accounts enable row level security;

drop policy if exists "Providers can view their own account" on public.provider_accounts;
drop policy if exists "Providers can insert their own account" on public.provider_accounts;
drop policy if exists "Providers can update their own account" on public.provider_accounts;

create policy "Providers can view their own account"
on public.provider_accounts
for select
to authenticated
using (id = auth.uid());

create policy "Providers can insert their own account"
on public.provider_accounts
for insert
to authenticated
with check (id = auth.uid());

create policy "Providers can update their own account"
on public.provider_accounts
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- No delete policy: providers cannot delete their own account row from the
-- client. No anon policy: this table has no public reads.
