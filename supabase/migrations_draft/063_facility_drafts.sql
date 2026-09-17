-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- WHY: an admin adding a facility by hand published it the moment the first
-- form was submitted — before it had a phone number, a map pin or a single
-- service — and there was no way to back out. This adds a draft state:
--
--   * "Create" now saves the row as a draft: is_draft = true, is_active =
--     false. Every public query already shows only is_active = true, so a
--     draft is invisible to patients from the first moment.
--   * The admin fills it in with the normal editor, then presses Publish,
--     which the app allows only once the required fields are complete (the
--     same list a provider's new listing needs).
--   * Until then the admin can Discard it, which deletes the row. Only a
--     draft can be discarded this way — the app deletes with
--     "where is_draft = true", so a published facility is never removed.
--
-- The check constraint makes "a draft is never live" a database rule, not
-- only an app rule: nothing — not a reactivate button, not a direct request —
-- can set is_active = true on a row that is still a draft.
--
-- Also extends 062's guard so only an admin can change is_draft. Everything
-- else in that function is unchanged.
--
-- Changes no existing data: every current facility gets is_draft = false.

alter table public.facilities
  add column if not exists is_draft boolean not null default false;

alter table public.facilities
  drop constraint if exists facilities_draft_is_not_live;
alter table public.facilities
  add constraint facilities_draft_is_not_live check (not (is_draft and is_active));

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
     or new.is_draft is distinct from old.is_draft
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

NOTIFY pgrst, 'reload schema';

-- AFTER RUNNING — read-only check. Expect one row: is_draft, boolean, NO,
-- default false; and total = not_drafts (no facility became a draft).
--
--   select column_name, data_type, is_nullable, column_default
--   from information_schema.columns
--   where table_name = 'facilities' and column_name = 'is_draft';
--
--   select count(*) as total, count(*) filter (where not is_draft) as not_drafts
--   from public.facilities;
