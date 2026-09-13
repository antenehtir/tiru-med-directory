-- 055 — let a logged-in provider submit into correction_requests too
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Not run.
--
-- A live facility's name and category are no longer editable directly by its
-- provider — a change to either now goes through the same admin review
-- correction_requests already gives every anonymous "Suggest a correction"
-- submission, so the super admin is the only one who actually moves either
-- value on a listing that is already public. See identity/actions.ts
-- (requestFacilityNameChange, requestFacilityTypeChange).
--
-- 029 granted INSERT to `anon` only, because the only writer at the time was
-- the public, logged-out correction form. createProviderSupabaseClient()
-- carries a real Supabase Auth session, so Postgres sees a provider's insert
-- as the `authenticated` role, not `anon` — without this grant it would hit
-- the exact 42501 permission-denied class 029 fixed for anon, just on the
-- other role.
-- ═══════════════════════════════════════════════════════════════════════════

grant insert on table public.correction_requests to authenticated;

drop policy if exists "Authenticated can submit correction requests" on public.correction_requests;

create policy "Authenticated can submit correction requests"
on public.correction_requests
for insert
to authenticated
with check (true);

NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY — confirm the grant and policy exist. Expect 1 row for each.
-- ═══════════════════════════════════════════════════════════════════════════

select grantee, privilege_type
from   information_schema.role_table_grants
where  table_name = 'correction_requests'
  and  grantee = 'authenticated'
  and  privilege_type = 'INSERT';

select policyname
from   pg_policies
where  tablename = 'correction_requests'
  and  policyname = 'Authenticated can submit correction requests';
