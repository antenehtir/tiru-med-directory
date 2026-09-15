-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- CONTEXT: same 2026-09-15 live-sync audit as 056/057 (missing RLS policy on
-- facilities, now fixed by 028) — checkup_offered was also found drifted.
-- Live facilities row says true; the provider's approved draft
-- (facility_claims.proposed_checkup_offered) says false. User confirmed
-- false is correct — the live page is currently wrong and should say no
-- checkups are offered.
--
-- Verified via direct read against the live claim/facility rows before
-- writing this file: facilities (id b42a5a89...) checkup_offered=true;
-- facility_claims (id 90549a2e...) proposed_checkup_offered=false.

UPDATE facilities
SET checkup_offered = false,
    updated_at = now()
WHERE id = 'b42a5a89-7394-4d1c-9ca4-985fbcbd0e13';

NOTIFY pgrst, 'reload schema';
