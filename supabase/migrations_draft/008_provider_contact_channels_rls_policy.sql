-- DigitalDirectory-v2 provider contact channels RLS policy migration draft.
-- DRAFT ONLY. DO NOT RUN UNTIL REVIEWED AND APPROVED.
-- This file is a planning artifact for the future Supabase test project.
-- It has not been executed against Supabase.
--
-- Scope:
-- - Enables row level security on public.provider_contact_channels.
-- - Grants anon usage on the public schema for public reads.
-- - Grants anon select on public.provider_contact_channels.
-- - Adds one public anon SELECT policy only.
-- - Allows anon reads only for active/public contact or action channel rows.
--
-- Out of scope for this draft:
-- - No INSERT policy.
-- - No UPDATE policy.
-- - No DELETE policy.
-- - No authenticated/provider/admin/super-admin policies.
-- - No service role logic.
-- - No test inserts.
-- - No private owner contacts.
-- - No private staff contacts.
-- - No patient data.
-- - No booking/payment data.
--
-- Public read boundary:
-- A provider contact/action channel row is publicly readable only when:
-- listing_status = 'active'
-- visibility_status = 'public'

alter table public.provider_contact_channels enable row level security;

grant usage on schema public to anon;
grant select on table public.provider_contact_channels to anon;

drop policy if exists "Allow anon read active public provider contact channels"
  on public.provider_contact_channels;

create policy "Allow anon read active public provider contact channels"
on public.provider_contact_channels
for select
to anon
using (
  listing_status = 'active'
  and visibility_status = 'public'
);

-- No INSERT policies are included in this draft.
-- No UPDATE policies are included in this draft.
-- No DELETE policies are included in this draft.
-- No authenticated, provider, admin, reviewer, or super-admin policies are included.
-- No service role logic is included.
-- No test data inserts are included.
-- Review status values, table constraints, anon grants, public contact safety, and negative RLS tests before running.
