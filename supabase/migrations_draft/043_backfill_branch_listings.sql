-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — NOT YET APPLIED.
--
-- Backfills branch listings for 17 facilities from the intake source, where
-- they have been sitting unread since June.
--
-- Where the data was: there is no branch field in the intake schema. The
-- branch listings are prose inside the `address` field, which has no column on
-- `facilities` at all and which scripts/seed-facilities.ts used only as a
-- fallback for the `location` display string — a fallback that never fired,
-- because area and sub_city are always populated. So unlike the tiktok/linkedin
-- case, this was never a mapping that forgot two column names: there was no
-- structured branch value to map, and the text was read and discarded.
--
-- The source is not one format. Four were found and are handled explicitly
-- rather than trusting a single splitter — two facilities use no pipes at all,
-- and a naive pipe-split would silently reduce each of them to one branch:
--   NUMBERED_PIPE  (12)  "Branch 1: A | Branch 2: B"
--   BRANCHES_PIPE   (3)  "Branches: A | B | C"
--   COUNT_COMMA     (1)  "6 branches: A, B, C, ..."   (Nahom)
--   PERIOD_DASH     (1)  "Branch 1 - A. Branch 2 - B" (Grace)
-- Every parse was checked against its source text, and against the count stated
-- in the `area` field where one exists: 0 mismatches, 0 unstripped prefixes.
--
-- Semantics, confirmed against live data rather than assumed: `branches` holds
-- the ADDITIONAL sites only and `branch_count` is the total including the main
-- listing, so branch_count = branches.length + 1. The one row that already has
-- branch_count set reads 1 with an empty branches array, and the onboarding
-- form renders branchCount - 1 blocks. The first site in each source list is
-- therefore treated as the main listing and is NOT repeated in the array.
--
-- What is deliberately NOT populated: latitude, longitude, maps_link and phone.
-- The source carries a location description per branch and nothing else, so
-- there is no coordinate to write and none is guessed. maps_link and phone are
-- empty strings rather than null because FacilityBranch types them as string;
-- latitude and longitude are null, which the type allows. `name` is also left
-- empty: the source gives each branch a location, not a name, and inventing one
-- would be fabricating data. The description goes in `area`, which is what it
-- actually is, and which hasBranchContent() treats as a real branch.
--
-- This does NOT fix the coordinate clusters. Branch-aware distance needs
-- coordinates, and these rows have none. What it does is give each branch a
-- record to attach a coordinate to, through the admin editor's Location
-- section, instead of every branch being invisible to the app.
--
-- The facilities and their parsed branches:
--
--   Washington Medical Centre  (NUMBERED_PIPE)
--     source: Branch 1: Bole opposite Rwandan Embassy | Branch 2: Bole bulbula
--     branch_count 2, branches[] 1:
--       2. area="Bole bulbula"
--
--   Yehuleshet Specialty Clinic  (NUMBERED_PIPE)
--     source: Branch 1: Lideta behind balcha hospital | Branch 2: Around tewodros square, Arada
--     branch_count 2, branches[] 1:
--       2. area="Around tewodros square, Arada"
--
--   Optimum Physiotherapy Specialty Clinic  (NUMBERED_PIPE)
--     source: Branch 1: Lebu, OSAC Business Tower | Branch 2: Bethel, New Road, Next to Water Tanker
--     branch_count 2, branches[] 1:
--       2. area="Bethel, New Road, Next to Water Tanker"
--
--   DROGA Physiotherapy Specialty Clinic  (NUMBERED_PIPE)
--     source: Branch 1: Arat kilo in front of Tourist Hotel | Branch 2: Bole Next to Japan Embassy
--     branch_count 2, branches[] 1:
--       2. area="Bole Next to Japan Embassy"
--
--   Abed Dermatology and Venerology Speciality Clinic  (NUMBERED_PIPE)
--     source: Branch 1: Betel, near NIB bank, Kolfe | Branch 2: Bisrate Gabriel, Shimekit building 11th floor
--     branch_count 2, branches[] 1:
--       2. area="Bisrate Gabriel, Shimekit building 11th floor"
--
--   Axon Stroke and Spine Center  (NUMBERED_PIPE)
--     source: Branch 1: CMC, Sunshine Real-Estate (Meri-Luki) | Branch 2: Wossen, 500m up from Wossen Grocery to Kara
--     branch_count 2, branches[] 1:
--       2. area="Wossen, 500m up from Wossen Grocery to Kara"
--
--   Amina Speech and Language Therapy  (NUMBERED_PIPE)
--     source: Branch 1: Bisrate Gabriel, Behind South Africa Embassy | Branch 2: Bethel inside Dr. Kalid and Family Pediatric Center
--     branch_count 2, branches[] 1:
--       2. area="Bethel inside Dr. Kalid and Family Pediatric Center"
--
--   Nahom Specialty Dental Clinic  (COUNT_COMMA)
--     source: 6 branches: Bole Bridge, CMC, Bisrate Gabriel, Gurd Sholla, Sarbet, Jemo
--     branch_count 6, branches[] 5:
--       2. area="CMC"
--       3. area="Bisrate Gabriel"
--       4. area="Gurd Sholla"
--       5. area="Sarbet"
--       6. area="Jemo"
--
--   Babi Specialty Dental Clinic  (NUMBERED_PIPE)
--     source: Branch 1: CMC Square, Ejigayehu Dibaba tower | Branch 2: Jemo, Delina Mall | Branch 3: Bole Michael
--     branch_count 3, branches[] 2:
--       2. area="Jemo, Delina Mall"
--       3. area="Bole Michael"
--
--   Lewi Specialty Dental Clinic  (NUMBERED_PIPE)
--     source: Branch 1: Bole Shewa Dabo, Getu Commercial Center 3rd floor | Branch 2: Urael, in front of Urael Church
--     branch_count 2, branches[] 1:
--       2. area="Urael, in front of Urael Church"
--
--   International Clinical Laboratories (ICL)  (BRANCHES_PIPE)
--     source: Branches: Kera Bulgaria Mazoria (Kirkos) | Gulele Enkulal Fabrica | CMC Yeka | Tikur Ambessa area (Lideta) | Minilik Hospital area (Yeka) | Torhayloch (Kolfe) | Jemo 3 (Nifas Silk-Lafto)
--     branch_count 7, branches[] 6:
--       2. area="Gulele Enkulal Fabrica"
--       3. area="CMC Yeka"
--       4. area="Tikur Ambessa area (Lideta)"
--       5. area="Minilik Hospital area (Yeka)"
--       6. area="Torhayloch (Kolfe)"
--       7. area="Jemo 3 (Nifas Silk-Lafto)"
--
--   ONCO Pathology Diagnostic Center  (NUMBERED_PIPE)
--     source: Branch 1: Enkulal Fabrica Near Pasture, Arada | Branch 2: Near Alert hospital, Kolfe
--     branch_count 2, branches[] 1:
--       2. area="Near Alert hospital, Kolfe"
--
--   Wudassie Diagnostic Center  (BRANCHES_PIPE)
--     source: Branches: Churchill Road (Arada) | Arogew Kera (Arada) | Bole Airport Enterprise | Enkulal Fabrica (Gullele) | Megenagna (Yeka) | Minilik Hospital area (Yeka)
--     branch_count 6, branches[] 5:
--       2. area="Arogew Kera (Arada)"
--       3. area="Bole Airport Enterprise"
--       4. area="Enkulal Fabrica (Gullele)"
--       5. area="Megenagna (Yeka)"
--       6. area="Minilik Hospital area (Yeka)"
--
--   Pioneer Diagnostic Center  (BRANCHES_PIPE)
--     source: Branches: Bole Alem cinema | Gotera (Kirkos) | Around Black lion Hospital (Lideta) | Arat kilo (Arada) | Afarencis Lancet branch (Bole)
--     branch_count 5, branches[] 4:
--       2. area="Gotera (Kirkos)"
--       3. area="Around Black lion Hospital (Lideta)"
--       4. area="Arat kilo (Arada)"
--       5. area="Afarencis Lancet branch (Bole)"
--
--   Paragon Physiotherapy and Sports Medicine Clinic  (NUMBERED_PIPE)
--     source: Branch 1: Ten Sisters NGO Bldg., Gurd Shola, next to Ethiopian Athletics Federation Bldg., Yeka Sub-City | Branch 2: Mekanisa, in front of Vatican Embassy, Nifas Silk-Lafto Sub-City
--     branch_count 2, branches[] 1:
--       2. area="Mekanisa, in front of Vatican Embassy, Nifas Silk-Lafto Sub-City"
--
--   RANK Specialized Dermatology Clinic  (NUMBERED_PIPE)
--     source: Branch 1: Wollosefer TK Building, 3rd floor, Lideta Sub-City | Branch 2: Gazebo Lebenz Tower, 1st floor, Kirkos Sub-City
--     branch_count 2, branches[] 1:
--       2. area="Gazebo Lebenz Tower, 1st floor, Kirkos Sub-City"
--
--   Grace MCH center  (PERIOD_DASH)
--     source: Branch 1 - Bole Ring Road, Infront of Moenco. Branch 2 - Around the British Embassy, close to the School of Tomorrow
--     branch_count 2, branches[] 1:
--       2. area="Around the British Embassy, close to the School of Tomorrow"

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — inspect (read-only). Run this first and read the output.
-- ═══════════════════════════════════════════════════════════════════════════

-- Expect branches NULL and branch_count NULL for all 17.
SELECT slug, name, branch_count,
       CASE WHEN branches IS NULL THEN 'null'
            ELSE jsonb_array_length(branches)::text END AS branches_len
FROM   facilities
WHERE  slug IN (
         'washington-medical-centre',
         'yehuleshet-specialty-clinic',
         'optimum-physiotherapy-specialty-clinic',
         'droga-physiotherapy-specialty-clinic',
         'abed-dermatology-and-venerology-speciality-clinic',
         'axon-stroke-and-spine-center',
         'amina-speech-and-language-therapy',
         'nahom-specialty-dental-clinic',
         'babi-specialty-dental-clinic',
         'lewi-specialty-dental-clinic',
         'international-clinical-laboratories-icl',
         'onco-pathology-diagnostic-center',
         'wudassie-diagnostic-center',
         'pioneer-diagnostic-center',
         'paragon-physiotherapy-and-sports-medicine-clinic',
         'rank-specialized-dermatology-clinic',
         'grace-mch-center'
       )
ORDER  BY name;

-- Must return 17.
SELECT count(*) AS slugs_found
FROM   facilities
WHERE  slug IN (
         'washington-medical-centre',
         'yehuleshet-specialty-clinic',
         'optimum-physiotherapy-specialty-clinic',
         'droga-physiotherapy-specialty-clinic',
         'abed-dermatology-and-venerology-speciality-clinic',
         'axon-stroke-and-spine-center',
         'amina-speech-and-language-therapy',
         'nahom-specialty-dental-clinic',
         'babi-specialty-dental-clinic',
         'lewi-specialty-dental-clinic',
         'international-clinical-laboratories-icl',
         'onco-pathology-diagnostic-center',
         'wudassie-diagnostic-center',
         'pioneer-diagnostic-center',
         'paragon-physiotherapy-and-sports-medicine-clinic',
         'rank-specialized-dermatology-clinic',
         'grace-mch-center'
       );

-- Must return 0: nothing here already carries branch data that this would
-- overwrite. STEP 2's guard skips any row that does.
SELECT count(*) AS rows_that_already_have_branches
FROM   facilities
WHERE  slug IN (
         'washington-medical-centre',
         'yehuleshet-specialty-clinic',
         'optimum-physiotherapy-specialty-clinic',
         'droga-physiotherapy-specialty-clinic',
         'abed-dermatology-and-venerology-speciality-clinic',
         'axon-stroke-and-spine-center',
         'amina-speech-and-language-therapy',
         'nahom-specialty-dental-clinic',
         'babi-specialty-dental-clinic',
         'lewi-specialty-dental-clinic',
         'international-clinical-laboratories-icl',
         'onco-pathology-diagnostic-center',
         'wudassie-diagnostic-center',
         'pioneer-diagnostic-center',
         'paragon-physiotherapy-and-sports-medicine-clinic',
         'rank-specialized-dermatology-clinic',
         'grace-mch-center'
       )
  AND  branches IS NOT NULL
  AND  jsonb_array_length(branches) > 0;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — apply. Guarded so a facility whose branches someone has already
-- filled in by hand is left alone; re-running is a no-op.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE facilities AS f
SET    branches     = v.branches,
       branch_count = v.branch_count,
       updated_at   = now()
FROM (VALUES
    ('washington-medical-centre', '[{"name":"","area":"Bole bulbula","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('yehuleshet-specialty-clinic', '[{"name":"","area":"Around tewodros square, Arada","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('optimum-physiotherapy-specialty-clinic', '[{"name":"","area":"Bethel, New Road, Next to Water Tanker","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('droga-physiotherapy-specialty-clinic', '[{"name":"","area":"Bole Next to Japan Embassy","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('abed-dermatology-and-venerology-speciality-clinic', '[{"name":"","area":"Bisrate Gabriel, Shimekit building 11th floor","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('axon-stroke-and-spine-center', '[{"name":"","area":"Wossen, 500m up from Wossen Grocery to Kara","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('amina-speech-and-language-therapy', '[{"name":"","area":"Bethel inside Dr. Kalid and Family Pediatric Center","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('nahom-specialty-dental-clinic', '[{"name":"","area":"CMC","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Bisrate Gabriel","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Gurd Sholla","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Sarbet","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Jemo","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 6),
    ('babi-specialty-dental-clinic', '[{"name":"","area":"Jemo, Delina Mall","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Bole Michael","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 3),
    ('lewi-specialty-dental-clinic', '[{"name":"","area":"Urael, in front of Urael Church","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('international-clinical-laboratories-icl', '[{"name":"","area":"Gulele Enkulal Fabrica","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"CMC Yeka","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Tikur Ambessa area (Lideta)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Minilik Hospital area (Yeka)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Torhayloch (Kolfe)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Jemo 3 (Nifas Silk-Lafto)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 7),
    ('onco-pathology-diagnostic-center', '[{"name":"","area":"Near Alert hospital, Kolfe","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('wudassie-diagnostic-center', '[{"name":"","area":"Arogew Kera (Arada)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Bole Airport Enterprise","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Enkulal Fabrica (Gullele)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Megenagna (Yeka)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Minilik Hospital area (Yeka)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 6),
    ('pioneer-diagnostic-center', '[{"name":"","area":"Gotera (Kirkos)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Around Black lion Hospital (Lideta)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Arat kilo (Arada)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""},{"name":"","area":"Afarencis Lancet branch (Bole)","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 5),
    ('paragon-physiotherapy-and-sports-medicine-clinic', '[{"name":"","area":"Mekanisa, in front of Vatican Embassy, Nifas Silk-Lafto Sub-City","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('rank-specialized-dermatology-clinic', '[{"name":"","area":"Gazebo Lebenz Tower, 1st floor, Kirkos Sub-City","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2),
    ('grace-mch-center', '[{"name":"","area":"Around the British Embassy, close to the School of Tomorrow","landmark":"","latitude":null,"longitude":null,"maps_link":"","phone":""}]'::jsonb, 2)
) AS v(slug, branches, branch_count)
WHERE  f.slug = v.slug
  AND  (f.branches IS NULL OR jsonb_array_length(f.branches) = 0);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — verify. branch_count must equal branches length + 1 on every row.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT slug, name, branch_count, jsonb_array_length(branches) AS branches_len,
       branch_count = jsonb_array_length(branches) + 1 AS count_agrees
FROM   facilities
WHERE  slug IN (
         'washington-medical-centre',
         'yehuleshet-specialty-clinic',
         'optimum-physiotherapy-specialty-clinic',
         'droga-physiotherapy-specialty-clinic',
         'abed-dermatology-and-venerology-speciality-clinic',
         'axon-stroke-and-spine-center',
         'amina-speech-and-language-therapy',
         'nahom-specialty-dental-clinic',
         'babi-specialty-dental-clinic',
         'lewi-specialty-dental-clinic',
         'international-clinical-laboratories-icl',
         'onco-pathology-diagnostic-center',
         'wudassie-diagnostic-center',
         'pioneer-diagnostic-center',
         'paragon-physiotherapy-and-sports-medicine-clinic',
         'rank-specialized-dermatology-clinic',
         'grace-mch-center'
       )
ORDER  BY name;

-- Must return 0. Any row here means branch_count and the array disagree.
SELECT count(*) AS rows_where_count_disagrees
FROM   facilities
WHERE  branches IS NOT NULL
  AND  branch_count IS NOT NULL
  AND  branch_count <> jsonb_array_length(branches) + 1;
