-- DigitalDirectory-v2 facilities table migration draft.
-- DRAFT ONLY. DO NOT RUN UNTIL REVIEWED AND APPROVED.
-- This file is a planning artifact for the future Supabase test project.
-- It has not been executed against Supabase.
--
-- Scope:
-- - Creates a draft public.facilities table shape.
-- - Adds public-safe status constraints and lookup indexes.
-- - Adds a simple updated_at trigger helper.
--
-- Out of scope for this draft:
-- - No RLS policies.
-- - No test inserts.
-- - No private/sensitive fields.
-- - No provider owner fields.
-- - No admin/reviewer notes.
-- - No verification evidence.
-- - No patient, booking, payment, document, notification, chatbot, or community data.
--
-- Note:
-- Supabase projects commonly support gen_random_uuid().
-- Confirm extension availability before running this in a real project.

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  facility_type text not null,
  category text,
  description text,
  city text,
  area text,
  address_public text,
  landmark_public text,
  listing_status text not null default 'pending',
  visibility_status text not null default 'hidden',
  verification_status text not null default 'unverified',
  last_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint facilities_slug_not_blank
    check (length(trim(slug)) > 0),
  constraint facilities_display_name_not_blank
    check (length(trim(display_name)) > 0),
  constraint facilities_facility_type_not_blank
    check (length(trim(facility_type)) > 0),
  constraint facilities_listing_status_check
    check (
      listing_status in (
        'draft',
        'pending',
        'active',
        'rejected',
        'archived',
        'suspended'
      )
    ),
  constraint facilities_visibility_status_check
    check (
      visibility_status in (
        'public',
        'hidden',
        'internal'
      )
    ),
  constraint facilities_verification_status_check
    check (
      verification_status in (
        'unverified',
        'pending',
        'verified',
        'disputed',
        'expired'
      )
    )
);

comment on table public.facilities is
  'Draft public-safe facilities listing table for DigitalDirectory-v2. Do not run until reviewed.';

comment on column public.facilities.address_public is
  'Reviewed public address text only. Do not store private addresses or submitter contact details here.';

comment on column public.facilities.landmark_public is
  'Reviewed public landmark or directions hint only.';

comment on column public.facilities.last_confirmed_at is
  'Optional public freshness signal for when listing details were last reviewed or confirmed.';

create index if not exists facilities_slug_idx
  on public.facilities (slug);

create index if not exists facilities_listing_status_idx
  on public.facilities (listing_status);

create index if not exists facilities_visibility_status_idx
  on public.facilities (visibility_status);

create index if not exists facilities_verification_status_idx
  on public.facilities (verification_status);

create index if not exists facilities_city_idx
  on public.facilities (city);

create index if not exists facilities_area_idx
  on public.facilities (area);

create index if not exists facilities_facility_type_idx
  on public.facilities (facility_type);

create index if not exists facilities_category_idx
  on public.facilities (category);

create index if not exists facilities_listing_visibility_idx
  on public.facilities (listing_status, visibility_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists facilities_set_updated_at on public.facilities;

create trigger facilities_set_updated_at
before update on public.facilities
for each row
execute function public.set_updated_at();

-- No RLS policies are included in this draft.
-- No test data inserts are included in this draft.
-- Review schema, status values, indexes, trigger naming, and RLS plan before running.
