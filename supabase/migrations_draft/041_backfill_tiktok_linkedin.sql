-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — NOT YET APPLIED.
--
-- Backfills facilities.tiktok (14 rows) and facilities.linkedin (9 rows)
-- across 16 facilities, from data that has been in the repo, correctly
-- extracted, since June.
--
-- Provenance: docs/data-intake/simple-facility-profiles/
-- tiru-med-directory-facility-profiles.simple.json, extracted from
-- docs/data-intake/source/Tiru_MedDirectory_Facility_Profiles.docx. Verified
-- against that .docx with text runs re-joined: no tiktok or linkedin URL
-- present in the source is missing from the JSON, so nothing was lost at
-- extraction. src/data/real-facility-profiles.ts already imports the JSON and
-- carries both fields through.
--
-- Why they are not already live: scripts/seed-facilities.ts, which performed
-- the 2026-06-23 import (commit 314ba50), builds its upsert row from a
-- hand-written field list naming email, website, instagram, facebook and
-- telegram — but never tiktok or linkedin. The import worked perfectly for
-- every field it listed (facebook 17/17, instagram 16/16, telegram 74/74,
-- email 84/84, website 75/75) and wrote nothing for the two it omitted (0/16,
-- 0/9). The columns most likely did not exist yet: the social-media field work
-- landed 2026-06-29 (fcf64bb), six days after the seed ran, and the script was
-- never re-run. That omission is fixed in the script alongside this migration,
-- so a future re-run cannot repeat it.
--
-- Two source values are deliberately NOT included:
--   RANK Specialized Dermatology Clinic
--     https://www.tiktok.com/discover/rank-dermatology-clinic-in-ethiopia
--   HuluCare Dermatology, Aesthetics & Hair Transplant Center
--     https://www.tiktok.com/discover/hulu-care-dermatology
-- Both are /discover/ keyword pages, not accounts. Writing them would render a
-- link labelled as the facility's TikTok that resolves to a search page it does
-- not own. Those two need a real handle found by hand; NULL is the honest state
-- until then.
--
-- Three URLs carried share-tracking query strings and are stored trimmed to the
-- canonical profile URL, matching how Hayat Hospital's TikTok was cleaned:
--   Pedi Care  @pedicare54?_r=1&_t=ZS-91o7i3uKv8q       -> @pedicare54
--   Grace MCH  @grace_mch_center?is_from_webapp=1&...   -> @grace_mch_center
--   Glow       @glowhairtransplant?is_from_webapp=1&... -> @glowhairtransplant
--
-- Every slug below was confirmed against the live table by name (23/23 matched),
-- and every target column currently reads NULL.

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — inspect (read-only). Run this first and read the output.
-- ═══════════════════════════════════════════════════════════════════════════

-- Current state of every affected row. Expect tiktok/linkedin NULL throughout.
SELECT slug, name, tiktok, linkedin
FROM   facilities
WHERE  slug IN (
         'american-medical-and-mch-center',
         'samaritan-surgical-center',
         'axon-stroke-and-spine-center',
         'habari-medical-plaza',
         'wastina',
         'fikreselam-general-hospital',
         'betsegah-maternal-and-children-hospital',
         'nucleus-general-hospital',
         'doctors-alliance-general-hospital',
         'paragon-physiotherapy-and-sports-medicine-clinic',
         'british-pediatrics-center',
         'pedi-care-pediatrics-and-pediatrics-surgical-center',
         'rapha-physiotherapy-center',
         'grace-mch-center',
         'glow-ethio-turkiye-skincare-and-aesthetic-center',
         'mth-mch-and-surgical-center'
       )
ORDER  BY name;

-- Must return 16. Fewer means a slug changed since this file was written —
-- stop and re-derive from the intake JSON before applying.
SELECT count(*) AS slugs_found
FROM   facilities
WHERE  slug IN (
         'american-medical-and-mch-center',
         'samaritan-surgical-center',
         'axon-stroke-and-spine-center',
         'habari-medical-plaza',
         'wastina',
         'fikreselam-general-hospital',
         'betsegah-maternal-and-children-hospital',
         'nucleus-general-hospital',
         'doctors-alliance-general-hospital',
         'paragon-physiotherapy-and-sports-medicine-clinic',
         'british-pediatrics-center',
         'pedi-care-pediatrics-and-pediatrics-surgical-center',
         'rapha-physiotherapy-center',
         'grace-mch-center',
         'glow-ethio-turkiye-skincare-and-aesthetic-center',
         'mth-mch-and-surgical-center'
       );

-- Both must return 0. Anything else means a value was set after this file was
-- written; STEP 2's guard will skip that row rather than overwrite it.
SELECT count(*) AS tiktok_already_set FROM facilities
WHERE  slug IN ('american-medical-and-mch-center', 'samaritan-surgical-center', 'axon-stroke-and-spine-center', 'habari-medical-plaza', 'wastina', 'fikreselam-general-hospital', 'nucleus-general-hospital', 'doctors-alliance-general-hospital', 'british-pediatrics-center', 'pedi-care-pediatrics-and-pediatrics-surgical-center', 'rapha-physiotherapy-center', 'grace-mch-center', 'glow-ethio-turkiye-skincare-and-aesthetic-center', 'mth-mch-and-surgical-center')
  AND  tiktok IS NOT NULL;

SELECT count(*) AS linkedin_already_set FROM facilities
WHERE  slug IN ('american-medical-and-mch-center', 'samaritan-surgical-center', 'axon-stroke-and-spine-center', 'habari-medical-plaza', 'wastina', 'betsegah-maternal-and-children-hospital', 'paragon-physiotherapy-and-sports-medicine-clinic', 'rapha-physiotherapy-center', 'grace-mch-center')
  AND  linkedin IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — apply. Guarded on IS NULL, so this is idempotent and never
-- overwrites a value set by hand in the meantime.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE facilities AS f
SET    tiktok = v.url,
       updated_at = now()
FROM (VALUES
    ('american-medical-and-mch-center', 'https://www.tiktok.com/@american_medicalcenter'),
    ('samaritan-surgical-center', 'https://www.tiktok.com/@samaritan_surgical_cent'),
    ('axon-stroke-and-spine-center', 'https://www.tiktok.com/@axon.stroke.spine'),
    ('habari-medical-plaza', 'https://www.tiktok.com/@habarimedicalplaza'),
    ('wastina', 'https://www.tiktok.com/@mywastina'),
    ('fikreselam-general-hospital', 'https://www.tiktok.com/@fikreselam_g_hospital'),
    ('nucleus-general-hospital', 'https://www.tiktok.com/@nucleus_general_hospital'),
    ('doctors-alliance-general-hospital', 'https://www.tiktok.com/@doctorsalliance_g_h'),
    ('british-pediatrics-center', 'https://www.tiktok.com/@britishpediatricc'),
    ('pedi-care-pediatrics-and-pediatrics-surgical-center', 'https://www.tiktok.com/@pedicare54'),
    ('rapha-physiotherapy-center', 'https://www.tiktok.com/@rapha_physio'),
    ('grace-mch-center', 'https://www.tiktok.com/@grace_mch_center'),
    ('glow-ethio-turkiye-skincare-and-aesthetic-center', 'https://www.tiktok.com/@glowhairtransplant'),
    ('mth-mch-and-surgical-center', 'https://www.tiktok.com/@mth_mch_center')
) AS v(slug, url)
WHERE  f.slug = v.slug
  AND  f.tiktok IS NULL;

UPDATE facilities AS f
SET    linkedin = v.url,
       updated_at = now()
FROM (VALUES
    ('american-medical-and-mch-center', 'https://www.linkedin.com/company/american-medical-center-et'),
    ('samaritan-surgical-center', 'https://www.linkedin.com/company/samaritansurgical'),
    ('axon-stroke-and-spine-center', 'https://www.linkedin.com/company/axon-stroke-spine-center-official'),
    ('habari-medical-plaza', 'https://www.linkedin.com/company/habaridoc'),
    ('wastina', 'https://www.linkedin.com/company/mywastina'),
    ('betsegah-maternal-and-children-hospital', 'https://www.linkedin.com/company/betsegah-mothers-and-children-hospital'),
    ('paragon-physiotherapy-and-sports-medicine-clinic', 'https://www.linkedin.com/company/paragon-physiotherapy-and-sports-medicine-specialized-clinic'),
    ('rapha-physiotherapy-center', 'https://www.linkedin.com/company/rapha-physiotherapy-center'),
    ('grace-mch-center', 'https://www.linkedin.com/company/grace-plus-maternal-and-child-health-center')
) AS v(slug, url)
WHERE  f.slug = v.slug
  AND  f.linkedin IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — verify. Expect tiktok_populated = 14, linkedin_populated = 9.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT slug, name, tiktok, linkedin
FROM   facilities
WHERE  slug IN (
         'american-medical-and-mch-center',
         'samaritan-surgical-center',
         'axon-stroke-and-spine-center',
         'habari-medical-plaza',
         'wastina',
         'fikreselam-general-hospital',
         'betsegah-maternal-and-children-hospital',
         'nucleus-general-hospital',
         'doctors-alliance-general-hospital',
         'paragon-physiotherapy-and-sports-medicine-clinic',
         'british-pediatrics-center',
         'pedi-care-pediatrics-and-pediatrics-surgical-center',
         'rapha-physiotherapy-center',
         'grace-mch-center',
         'glow-ethio-turkiye-skincare-and-aesthetic-center',
         'mth-mch-and-surgical-center'
       )
ORDER  BY name;

SELECT count(*) FILTER (WHERE tiktok   IS NOT NULL) AS tiktok_populated,
       count(*) FILTER (WHERE linkedin IS NOT NULL) AS linkedin_populated
FROM   facilities
WHERE  slug IN (
         'american-medical-and-mch-center',
         'samaritan-surgical-center',
         'axon-stroke-and-spine-center',
         'habari-medical-plaza',
         'wastina',
         'fikreselam-general-hospital',
         'betsegah-maternal-and-children-hospital',
         'nucleus-general-hospital',
         'doctors-alliance-general-hospital',
         'paragon-physiotherapy-and-sports-medicine-clinic',
         'british-pediatrics-center',
         'pedi-care-pediatrics-and-pediatrics-surgical-center',
         'rapha-physiotherapy-center',
         'grace-mch-center',
         'glow-ethio-turkiye-skincare-and-aesthetic-center',
         'mth-mch-and-surgical-center'
       );
