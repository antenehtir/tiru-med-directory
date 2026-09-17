-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- WHY: a signed-in provider can currently approve themselves.
--
-- Migration 028 grants a provider UPDATE on a facilities row when their own
-- provider_accounts row says status = 'approved' and facility_id = that row.
-- But the provider_accounts policy from 011 ("Providers can update their own
-- account") checks only id = auth.uid() — every column on that row is
-- writable by its owner, status and facility_id included. So any account
-- could, from its own browser session:
--
--   update provider_accounts set status = 'approved', facility_id = <any>
--   where id = auth.uid();
--
-- and then edit that live facility. Nothing in the app does this; nothing in
-- the database stops it.
--
-- Two smaller gaps of the same shape are closed here too:
--   * facility_claims: a provider could flip their own claim to 'approved',
--     which removes it from the admin queue without anyone reviewing it.
--   * facilities: 028 lets an approved provider write EVERY column on their
--     facility, including name, category, slug and verification_status. The
--     app routes name/type changes through admin review, but only the app
--     enforces that — a direct request would bypass it.
--
-- HOW: BEFORE triggers rather than column GRANTs, because admins use the
-- same `authenticated` role as providers (createAdminSupabaseClient signs in
-- with the anon key), so revoking column privileges from that role would
-- lock admins out too. The triggers tell the two apart by admin_users
-- membership — the same test every admin RLS policy in this project uses —
-- and are SECURITY DEFINER so that test works for a provider session, which
-- cannot read admin_users itself.
--
-- The checks apply to every request made with the public anon key, signed
-- in ('authenticated') or not ('anon'). The signed-out case matters: the live
-- policy "provider_accounts: insert on signup" lets anon insert a row with
-- any values (with_check = true), and sign-up runs before the new user has a
-- session — so without this, a sign-up request could create its own account
-- already status = 'approved' and pointed at any facility. Requests with no
-- end-user role at all (the SQL editor, the service role, migrations) are let
-- through unchanged.
--
-- The triggers only REFUSE; they never rewrite a value. The live
-- provider_accounts.status column does not match 011's draft (live rows say
-- 'incomplete', which 011's check constraint does not allow), so this file
-- makes no assumption about which statuses exist beyond 'approved'.
--
-- BEFORE RUNNING — read-only, safe, shows what is live today so the result
-- can be compared afterwards:
--
--   select tablename, policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where tablename in ('provider_accounts', 'facility_claims', 'facilities')
--   order by tablename, policyname;

create or replace function public.tiru_is_admin_session()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

create or replace function public.tiru_is_end_user_request()
returns boolean
language sql
stable
as $$
  select coalesce(auth.role(), '') in ('anon', 'authenticated');
$$;

-- ---------------------------------------------------------------------------
-- provider_accounts
-- ---------------------------------------------------------------------------
create or replace function public.guard_provider_accounts_privileged()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.tiru_is_end_user_request() or public.tiru_is_admin_session() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'approved'
       or new.verification_status_internal = 'verified'
       or new.reviewed_by is not null
       or new.reviewed_at is not null
       or new.admin_note is not null
       or new.verification_call_notes is not null then
      raise exception 'Only an admin can set review fields on a provider account.';
    end if;
    return new;
  end if;

  -- UPDATE
  if new.status is distinct from old.status
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.admin_note is distinct from old.admin_note
     or new.verification_call_notes is distinct from old.verification_call_notes then
    raise exception 'Only an admin can change review fields on a provider account.';
  end if;

  -- A provider reports their own progress ('unverified' → 'call_pending');
  -- only an admin marks them verified or rejected.
  if new.verification_status_internal is distinct from old.verification_status_internal
     and new.verification_status_internal not in ('unverified', 'call_pending') then
    raise exception 'Only an admin can mark a provider verified or rejected.';
  end if;

  -- Choosing which facility to claim is the provider's call — until they
  -- are approved for it. After that, repointing facility_id would carry the
  -- approval over to a facility nobody verified them for.
  if new.facility_id is distinct from old.facility_id and old.status = 'approved' then
    raise exception 'An approved provider cannot move their account to a different facility.';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_provider_accounts_privileged on public.provider_accounts;
create trigger guard_provider_accounts_privileged
before insert or update on public.provider_accounts
for each row execute function public.guard_provider_accounts_privileged();

-- ---------------------------------------------------------------------------
-- facility_claims
-- ---------------------------------------------------------------------------
create or replace function public.guard_facility_claims_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.tiru_is_end_user_request() or public.tiru_is_admin_session() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('pending', 'pending_review') then
      raise exception 'A new claim can only be a draft or submitted for review.';
    end if;
    return new;
  end if;

  -- An approved claim is settled; the provider edits the live listing from
  -- then on, not the claim.
  if old.status = 'approved'
     and (new.status is distinct from old.status or new.facility_id is distinct from old.facility_id) then
    raise exception 'An approved claim can only be changed by an admin.';
  end if;

  -- Providers move their own claim between draft and submitted, and reopen
  -- a rejected one (ensureClaimId does this). Approving and rejecting are
  -- the admin's.
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    raise exception 'Only an admin can approve or reject a claim.';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_facility_claims_status on public.facility_claims;
create trigger guard_facility_claims_status
before insert or update on public.facility_claims
for each row execute function public.guard_facility_claims_status();

-- ---------------------------------------------------------------------------
-- facilities
-- ---------------------------------------------------------------------------
-- 028 stays as it is (an approved provider may update their own row); this
-- narrows WHICH columns that update may touch. Everything a provider edits in
-- the listing editor is still writable. Name and category go through
-- requestFacilityNameChange / requestFacilityTypeChange (admin review), and
-- the rest are the directory's own bookkeeping.
create or replace function public.guard_facilities_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.tiru_is_end_user_request() or public.tiru_is_admin_session() then
    return new;
  end if;

  if new.name is distinct from old.name
     or new.slug is distinct from old.slug
     or new.category is distinct from old.category
     or new.subcategory is distinct from old.subcategory
     or new.verification_status is distinct from old.verification_status
     or new.is_active is distinct from old.is_active
     or new.record_number is distinct from old.record_number
     or new.claimed_by is distinct from old.claimed_by
     or new.deactivation_reason is distinct from old.deactivation_reason
     or new.deactivation_category is distinct from old.deactivation_category
     or new.deactivated_at is distinct from old.deactivated_at
     or new.deactivated_by is distinct from old.deactivated_by
     or new.reactivated_at is distinct from old.reactivated_at then
    raise exception 'That field can only be changed by a Tiru admin. Name and type changes can be requested from your listing.';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_facilities_admin_columns on public.facilities;
create trigger guard_facilities_admin_columns
before update on public.facilities
for each row execute function public.guard_facilities_admin_columns();

NOTIFY pgrst, 'reload schema';
