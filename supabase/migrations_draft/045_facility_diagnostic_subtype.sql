-- 045 — give facilities a diagnostic_subtype, and backfill the seven
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Not run.
--
-- A Diagnostic Center is asked at signup whether it is laboratory only,
-- imaging only, or both, and Step3ServicesForm already uses that answer to
-- decide which service lists it sees — an imaging-only facility is not shown
-- eighteen panels of blood tests. The answer is stored on provider_accounts
-- and carried on facility_claims.
--
-- It stops there. `facilities` has no column for it, so the moment a claim is
-- approved the answer is discarded, and the admin editor — which reads the
-- facility row, not the claim — has no way to know. Every one of the seven
-- live Diagnostic Centers is therefore shown both lists in admin, including
-- the two that only do imaging.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHY EACH VALUE, AND HOW IT WAS DECIDED
--
-- Six of the seven carry almost no catalogue services — their `services` array
-- mostly repeats their own `subcategory` sentence — so the subtype cannot be
-- inferred from what they have ticked. It can be read confidently from the
-- subcategory text and from the specific procedures they free-typed:
--
--   manna-diagnostic-center     imaging  "Imaging and diagnostic Services",
--                                        and lists HSG, CUG, IVP, Barium
--                                        studies — all radiology procedures.
--   pioneer-diagnostic-center   imaging  "Imaging and diagnostic Services",
--                                        and lists Thyroid scintigraphy and
--                                        SPECT CT — nuclear medicine imaging.
--   wudassie-diagnostic-center  both     "Comprehensive Laboratory, Diagnostic
--                                        and Imaging Center".
--   international-clinical-laboratories-icl
--                               lab      71 catalogue lab tests, no imaging.
--   american-medical-laboratories
--                               lab      Clinical Chemistry, Hematology,
--                                        Microbiology, Serology, Molecular
--                                        Diagnostics, Pathology.
--   swiss-diagnostics-ethiopia  lab      "Comprehensive Advanced Laboratory
--                                        and Diagnostic tests".
--   onco-pathology-diagnostic-center
--                               lab      a pathology centre; "Laboratory and
--                                        comprehensive diagnostic tests".
--
-- NULL is a valid state and means "not stated". The forms treat it as "both",
-- which is the only safe default: showing a facility a list it does not need
-- wastes its time, and hiding one it does need loses data.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — add the column. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS diagnostic_subtype text;

-- Only three values are meaningful, and only for Diagnostic Centers. The
-- constraint permits NULL so every other category is unaffected.
ALTER TABLE facilities
  DROP CONSTRAINT IF EXISTS facilities_diagnostic_subtype_check;

ALTER TABLE facilities
  ADD CONSTRAINT facilities_diagnostic_subtype_check
  CHECK (diagnostic_subtype IS NULL OR diagnostic_subtype IN ('lab', 'imaging', 'both'));

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — inspect before writing. Expect 7 rows, all diagnostic_subtype NULL.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT slug, name, diagnostic_subtype, subcategory
FROM   facilities
WHERE  category = 'Diagnostic Center'
ORDER  BY name;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — backfill. Guarded on NULL so a value set by hand is never replaced.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE facilities AS f
SET    diagnostic_subtype = v.subtype,
       updated_at = now()
FROM (VALUES
    ('manna-diagnostic-center',                 'imaging'),
    ('pioneer-diagnostic-center',               'imaging'),
    ('wudassie-diagnostic-center',              'both'),
    ('international-clinical-laboratories-icl', 'lab'),
    ('american-medical-laboratories',           'lab'),
    ('swiss-diagnostics-ethiopia',              'lab'),
    ('onco-pathology-diagnostic-center',        'lab')
) AS v(slug, subtype)
WHERE  f.slug = v.slug
  AND  f.diagnostic_subtype IS NULL;

-- Expect "UPDATE 7".

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4 — verify.
-- ═══════════════════════════════════════════════════════════════════════════

-- Expect 7 rows, every diagnostic_subtype populated: 4 lab, 2 imaging, 1 both.
SELECT slug, name, diagnostic_subtype
FROM   facilities
WHERE  category = 'Diagnostic Center'
ORDER  BY diagnostic_subtype, name;

-- Must return 0. A subtype outside the three values, or one set on a facility
-- that is not a Diagnostic Center, is a mistake in either case.
SELECT count(*) AS rows_with_a_bad_subtype
FROM   facilities
WHERE  diagnostic_subtype IS NOT NULL
  AND  (diagnostic_subtype NOT IN ('lab', 'imaging', 'both')
        OR category <> 'Diagnostic Center');
