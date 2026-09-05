-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — NOT YET APPLIED.
--
-- Corrects the coordinates of 14 facilities whose true position was recovered
-- without any paid or keyed API.
--
-- Provenance, and why these 14 and not the rest:
--
-- 13 of them had a Google plus code (Open Location Code) embedded in the
-- /place/ URL their stored maps_link redirects to — Google puts the plus code
-- in the place's own display title, e.g.
--   "XRW7+5H8 Kadisco General Hospital | Gerji | ካዲስኮ አጠቃላይ ሆስፒታል | ገርጂ"
-- Plus codes are a published, self-contained geocode: they decode offline with
-- no network call and no API key. The decoder was validated by round-tripping
-- three coordinates already known independently (Yehuleshet, iCMC, Lancet):
-- 1.4 m, 1.4 m and 1.7 m error, well inside a plus code's own ~3 m resolution.
--
-- The 14th, Heal Venture, needed no decoding at all: its link redirects to
-- maps.google.com/maps?q=9.0128943,38.7945076 — the coordinates are literally
-- in the URL. It was missed on the first pass because that scan checked the
-- !3d!4d, @lat,lng, plus-code and feature-id forms but not ?q=.
--
-- Every value below was cross-checked against the facility's own stated
-- sub-city and area before being accepted. The directions agree throughout:
-- Ethio TEBIB resolves west into Kolfe, Hope Oncology west to Torhayloch,
-- Heal-Liv south-east toward Bole airport road, Trust north-west into Gulele.
-- None of the 14 contradicts its stated locality.
--
-- Errors run from 1.18 km to 8.74 km. For comparison, iCMC — the complaint
-- that started this whole audit — was 3.04 km out, and Yehuleshet 6.87 km.
-- Several of these are worse than either.
--
-- NOT in this migration, deliberately:
--   - 49 facilities whose links carry only a feature id (0x..:0x..), a cid, a
--     Knowledge-Graph mid, or no link at all. Google's Place Details (New)
--     accepts only ChIJ.. place ids — not cids, not feature ids — so there is
--     no exact ID-lookup path for them. Text Search would only be a name-based
--     guess needing per-result verification, so they are being corrected by
--     hand through the admin Location editor instead.
--   - HabariDOC and Wastina, which share 9.018/38.762. Both are sub_city
--     "online" (Telemedicine, Healthcare Financing); mapDBRowToFacility sets
--     onlineOnly for those, so resolveFacilityCoordinates returns undefined and
--     they never enter /nearby ranking. Their coordinates are inert.
--
-- The facilities, worst error first:
--
--    8.741 km  Dream Orthopaedics, Trauma, and Spine Center
--            9.038, 38.81  ->  9.0045125, 38.7379844   [PLUSCODE 2P3Q+R55]
--            stated: sarbet, kirkos
--    8.533 km  Asheten Psychiatry & Rehabilitation Specialized Center
--            9.021, 38.76  ->  9.0108625, 38.8370156   [PLUSCODE 2R6P+8RR]
--            stated: figa, bole
--    8.077 km  Ethio TEBIB General Hospital
--            9.0085, 38.787  ->  9.0374625, 38.7195469   [PLUSCODE 2PP9+XRM]
--            stated: sefere selam, kolfe
--    5.122 km  Tazma Medical and Surgical Specialized Center
--            9.0095, 38.798  ->  8.9853875, 38.7582656   [PLUSCODE XQP5+582]
--            stated: gotera condominium, kirkos
--    4.938 km  ACL ENT and Medical Center
--            9.048, 38.818  ->  9.0365625, 38.7745469   [PLUSCODE 2QPF+JRF]
--            stated: kebena, yeka
--    4.898 km  Hope Oncology Center
--            9.0185, 38.762  ->  9.0073125, 38.7188594   [PLUSCODE 2P49+WGH]
--            stated: torhayloch, kolfe
--    4.897 km  Trust Internal Medicine and Gastroenterology Speciality Clinic
--            9.021, 38.762  ->  9.0475125, 38.7263906   [PLUSCODE 2PXG+2H2]
--            stated: gulele, gulele
--    4.828 km  Heal-Liv Hair Transplant and Dermatology Specialty Clinic
--            9.032, 38.798  ->  8.9898125, 38.7876094   [PLUSCODE XQQQ+W2H]
--            stated: bole airport road, bole
--    2.736 km  ElOuzeir Cardiac Center
--            9.015, 38.785  ->  8.9951125, 38.7703281   [PLUSCODE XQWC+24W]
--            stated: bole printing, bole
--    2.658 km  Kadisco General Hospital
--            9.0156, 38.801  ->  8.9954125, 38.8139531   [PLUSCODE XRW7+5H8]
--            stated: gerji, bole
--    2.441 km  Loza Nutritional Consulting and Therapy
--            9.022, 38.775  ->  9.0210625, 38.7972031   [PLUSCODE 2QCW+CVG]
--            stated: megenagna, yeka
--    2.373 km  OASIS E.N.T Head and Neck Speciality Center
--            9.034, 38.798  ->  9.0341625, 38.7763906   [PLUSCODE 2QMG+MH6]
--            stated: kebena, gulele
--    1.681 km  Heal Venture Medical and Surgical Center
--            9.028, 38.795  ->  9.0128943, 38.7945076   [?q= link]
--            stated: lem hotel, bole
--    1.178 km  Gize Psychiatric and Rehabilitation Center
--            9.038, 38.81  ->  9.0334125, 38.8196719   [PLUSCODE 2RM9+9V7]
--            stated: yeka, yeka

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — inspect (read-only). Run this first and read the output.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT slug, name, latitude, longitude, sub_city, area, updated_at
FROM   facilities
WHERE  slug IN (
         'dream-orthopaedics-trauma-and-spine-center',
         'asheten-psychiatry-and-rehabilitation-specialized-center',
         'ethio-tebib-general-hospital',
         'tazma-medical-and-surgical-specialized-center',
         'acl-ent-and-medical-center',
         'hope-oncology-center',
         'trust-internal-medicine-and-gastroenterology-speciality-clinic',
         'heal-liv-hair-transplant-and-dermatology-specialty-clinic',
         'elouzeir-cardiac-center',
         'kadisco-general-hospital',
         'loza-nutritional-consulting-and-therapy',
         'oasis-e-n-t-head-and-neck-speciality-center',
         'heal-venture-medical-and-surgical-center',
         'gize-psychiatric-and-rehabilitation-center'
       )
ORDER  BY name;

-- Must return 14. Fewer means a slug changed since this file was written.
SELECT count(*) AS slugs_found
FROM   facilities
WHERE  slug IN (
         'dream-orthopaedics-trauma-and-spine-center',
         'asheten-psychiatry-and-rehabilitation-specialized-center',
         'ethio-tebib-general-hospital',
         'tazma-medical-and-surgical-specialized-center',
         'acl-ent-and-medical-center',
         'hope-oncology-center',
         'trust-internal-medicine-and-gastroenterology-speciality-clinic',
         'heal-liv-hair-transplant-and-dermatology-specialty-clinic',
         'elouzeir-cardiac-center',
         'kadisco-general-hospital',
         'loza-nutritional-consulting-and-therapy',
         'oasis-e-n-t-head-and-neck-speciality-center',
         'heal-venture-medical-and-surgical-center',
         'gize-psychiatric-and-rehabilitation-center'
       );

-- Must also return 14: every row still holds the exact coordinates this
-- migration expects to replace. A lower number means someone has already
-- corrected one by hand — STEP 2's guard will skip it rather than overwrite.
SELECT count(*) AS rows_still_at_the_old_value
FROM   facilities
WHERE           (slug = 'dream-orthopaedics-trauma-and-spine-center' AND latitude = 9.038 AND longitude = 38.81)
      OR (slug = 'asheten-psychiatry-and-rehabilitation-specialized-center' AND latitude = 9.021 AND longitude = 38.76)
      OR (slug = 'ethio-tebib-general-hospital' AND latitude = 9.0085 AND longitude = 38.787)
      OR (slug = 'tazma-medical-and-surgical-specialized-center' AND latitude = 9.0095 AND longitude = 38.798)
      OR (slug = 'acl-ent-and-medical-center' AND latitude = 9.048 AND longitude = 38.818)
      OR (slug = 'hope-oncology-center' AND latitude = 9.0185 AND longitude = 38.762)
      OR (slug = 'trust-internal-medicine-and-gastroenterology-speciality-clinic' AND latitude = 9.021 AND longitude = 38.762)
      OR (slug = 'heal-liv-hair-transplant-and-dermatology-specialty-clinic' AND latitude = 9.032 AND longitude = 38.798)
      OR (slug = 'elouzeir-cardiac-center' AND latitude = 9.015 AND longitude = 38.785)
      OR (slug = 'kadisco-general-hospital' AND latitude = 9.0156 AND longitude = 38.801)
      OR (slug = 'loza-nutritional-consulting-and-therapy' AND latitude = 9.022 AND longitude = 38.775)
      OR (slug = 'oasis-e-n-t-head-and-neck-speciality-center' AND latitude = 9.034 AND longitude = 38.798)
      OR (slug = 'heal-venture-medical-and-surgical-center' AND latitude = 9.028 AND longitude = 38.795)
      OR (slug = 'gize-psychiatric-and-rehabilitation-center' AND latitude = 9.038 AND longitude = 38.81);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — apply. Guarded on the exact old coordinate pair, so this is
-- idempotent and cannot overwrite a position someone has since fixed.
-- maps_link is deliberately left alone: the existing link still points at the
-- right place, it simply does not expose coordinates in its URL.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE facilities AS f
SET    latitude   = v.lat,
       longitude  = v.lng,
       updated_at = now()
FROM (VALUES
    ('dream-orthopaedics-trauma-and-spine-center', 9.0045125, 38.7379844),
    ('asheten-psychiatry-and-rehabilitation-specialized-center', 9.0108625, 38.8370156),
    ('ethio-tebib-general-hospital', 9.0374625, 38.7195469),
    ('tazma-medical-and-surgical-specialized-center', 8.9853875, 38.7582656),
    ('acl-ent-and-medical-center', 9.0365625, 38.7745469),
    ('hope-oncology-center', 9.0073125, 38.7188594),
    ('trust-internal-medicine-and-gastroenterology-speciality-clinic', 9.0475125, 38.7263906),
    ('heal-liv-hair-transplant-and-dermatology-specialty-clinic', 8.9898125, 38.7876094),
    ('elouzeir-cardiac-center', 8.9951125, 38.7703281),
    ('kadisco-general-hospital', 8.9954125, 38.8139531),
    ('loza-nutritional-consulting-and-therapy', 9.0210625, 38.7972031),
    ('oasis-e-n-t-head-and-neck-speciality-center', 9.0341625, 38.7763906),
    ('heal-venture-medical-and-surgical-center', 9.0128943, 38.7945076),
    ('gize-psychiatric-and-rehabilitation-center', 9.0334125, 38.8196719)
) AS v(slug, lat, lng)
WHERE  f.slug = v.slug
  AND  (
         (f.slug = 'dream-orthopaedics-trauma-and-spine-center' AND f.latitude = 9.038 AND f.longitude = 38.81)
      OR (f.slug = 'asheten-psychiatry-and-rehabilitation-specialized-center' AND f.latitude = 9.021 AND f.longitude = 38.76)
      OR (f.slug = 'ethio-tebib-general-hospital' AND f.latitude = 9.0085 AND f.longitude = 38.787)
      OR (f.slug = 'tazma-medical-and-surgical-specialized-center' AND f.latitude = 9.0095 AND f.longitude = 38.798)
      OR (f.slug = 'acl-ent-and-medical-center' AND f.latitude = 9.048 AND f.longitude = 38.818)
      OR (f.slug = 'hope-oncology-center' AND f.latitude = 9.0185 AND f.longitude = 38.762)
      OR (f.slug = 'trust-internal-medicine-and-gastroenterology-speciality-clinic' AND f.latitude = 9.021 AND f.longitude = 38.762)
      OR (f.slug = 'heal-liv-hair-transplant-and-dermatology-specialty-clinic' AND f.latitude = 9.032 AND f.longitude = 38.798)
      OR (f.slug = 'elouzeir-cardiac-center' AND f.latitude = 9.015 AND f.longitude = 38.785)
      OR (f.slug = 'kadisco-general-hospital' AND f.latitude = 9.0156 AND f.longitude = 38.801)
      OR (f.slug = 'loza-nutritional-consulting-and-therapy' AND f.latitude = 9.022 AND f.longitude = 38.775)
      OR (f.slug = 'oasis-e-n-t-head-and-neck-speciality-center' AND f.latitude = 9.034 AND f.longitude = 38.798)
      OR (f.slug = 'heal-venture-medical-and-surgical-center' AND f.latitude = 9.028 AND f.longitude = 38.795)
      OR (f.slug = 'gize-psychiatric-and-rehabilitation-center' AND f.latitude = 9.038 AND f.longitude = 38.81)
       );

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — verify. Every row should now show its new pair, and the
-- old-value count should be 0.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT slug, name, latitude, longitude, updated_at
FROM   facilities
WHERE  slug IN (
         'dream-orthopaedics-trauma-and-spine-center',
         'asheten-psychiatry-and-rehabilitation-specialized-center',
         'ethio-tebib-general-hospital',
         'tazma-medical-and-surgical-specialized-center',
         'acl-ent-and-medical-center',
         'hope-oncology-center',
         'trust-internal-medicine-and-gastroenterology-speciality-clinic',
         'heal-liv-hair-transplant-and-dermatology-specialty-clinic',
         'elouzeir-cardiac-center',
         'kadisco-general-hospital',
         'loza-nutritional-consulting-and-therapy',
         'oasis-e-n-t-head-and-neck-speciality-center',
         'heal-venture-medical-and-surgical-center',
         'gize-psychiatric-and-rehabilitation-center'
       )
ORDER  BY name;

SELECT count(*) AS rows_still_at_the_old_value_should_be_zero
FROM   facilities
WHERE           (slug = 'dream-orthopaedics-trauma-and-spine-center' AND latitude = 9.038 AND longitude = 38.81)
      OR (slug = 'asheten-psychiatry-and-rehabilitation-specialized-center' AND latitude = 9.021 AND longitude = 38.76)
      OR (slug = 'ethio-tebib-general-hospital' AND latitude = 9.0085 AND longitude = 38.787)
      OR (slug = 'tazma-medical-and-surgical-specialized-center' AND latitude = 9.0095 AND longitude = 38.798)
      OR (slug = 'acl-ent-and-medical-center' AND latitude = 9.048 AND longitude = 38.818)
      OR (slug = 'hope-oncology-center' AND latitude = 9.0185 AND longitude = 38.762)
      OR (slug = 'trust-internal-medicine-and-gastroenterology-speciality-clinic' AND latitude = 9.021 AND longitude = 38.762)
      OR (slug = 'heal-liv-hair-transplant-and-dermatology-specialty-clinic' AND latitude = 9.032 AND longitude = 38.798)
      OR (slug = 'elouzeir-cardiac-center' AND latitude = 9.015 AND longitude = 38.785)
      OR (slug = 'kadisco-general-hospital' AND latitude = 9.0156 AND longitude = 38.801)
      OR (slug = 'loza-nutritional-consulting-and-therapy' AND latitude = 9.022 AND longitude = 38.775)
      OR (slug = 'oasis-e-n-t-head-and-neck-speciality-center' AND latitude = 9.034 AND longitude = 38.798)
      OR (slug = 'heal-venture-medical-and-surgical-center' AND latitude = 9.028 AND longitude = 38.795)
      OR (slug = 'gize-psychiatric-and-rehabilitation-center' AND latitude = 9.038 AND longitude = 38.81);

-- Coordinate pairs still shared by more than one active facility. Expect this
-- to shrink: several of the 14 were sitting in clusters.
SELECT latitude, longitude, count(*) AS facilities, string_agg(name, ' | ' ORDER BY name) AS sharing
FROM   facilities
WHERE  is_active
GROUP  BY latitude, longitude
HAVING count(*) > 1
ORDER  BY count(*) DESC;
