-- DigitalDirectory-v2 facilities RLS policy migration draft.
-- DRAFT ONLY. DO NOT RUN UNTIL REVIEWED AND APPROVED.
-- This file is a planning artifact for the future Supabase test project.
-- It has not been executed against Supabase.
--
-- Scope:
-- - Enables row level security on public.facilities.
-- - Adds one public anon SELECT policy only.
-- - Allows anon reads only for public active facility rows.
--
-- Out of scope for this draft:
-- - No INSERT policy.
-- - No UPDATE policy.
-- - No DELETE policy.
-- - No authenticated/provider/admin/super-admin policies.
-- - No service role logic.
-- - No test inserts.
-- - No private/sensitive fields.
--
-- Important review note:
-- This draft follows Task 68 and uses listing_status = 'active'.
-- Review against 001_create_facilities_table.sql before running, because the
-- current facilities table draft must also allow the chosen public status value.

alter table public.facilities enable row level security;

drop policy if exists "Allow anon read active public facilities" on public.facilities;

create policy "Allow anon read active public facilities"
on public.facilities
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
-- Review status values, table constraints, and negative RLS tests before running.
