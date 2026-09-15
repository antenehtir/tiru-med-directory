-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- CONTEXT: flagged during the 2026-09-15 live-sync audit (see
-- 056_resync_prime_pediatric_services.sql) and confirmed with the user —
-- Dr. Kale-Ab Tesfaye's record in facility_claims.proposed_doctors somehow
-- got its specialty cleared to "Other" with an empty subspecialty, while the
-- live facilities.doctors row still correctly holds
-- specialty="Pediatrics"/subspecialty="General Pediatrics" (never synced,
-- same missing-RLS-policy bug as the services drift — this one just never
-- reached the public page, so nothing broke there). User confirmed the
-- correct value is Pediatrics / General Pediatrics, matching what's live.
--
-- This corrects the stuck claim to match the live (already-correct) row, so
-- a future autosave doesn't push the wrong "Other"/"" value out now that the
-- RLS policy (028) lets that sync actually go through.
--
-- Verified via direct read against the live claim row before writing this
-- file: facility_claims (id 90549a2e...) proposed_doctors[0] has
-- id="d3560509-e094-4358-b502-3c99c0d1937c", specialty="Other",
-- subspecialty="". Only that one doctor entry exists in the array.

UPDATE facility_claims
SET proposed_doctors = jsonb_set(
  jsonb_set(
    proposed_doctors,
    '{0,specialty}',
    '"Pediatrics"'
  ),
  '{0,subspecialty}',
  '"General Pediatrics"'
),
updated_at = now()
WHERE id = '90549a2e-c583-4836-a7fa-45dd75dd852e'
  AND proposed_doctors->0->>'id' = 'd3560509-e094-4358-b502-3c99c0d1937c';

NOTIFY pgrst, 'reload schema';
