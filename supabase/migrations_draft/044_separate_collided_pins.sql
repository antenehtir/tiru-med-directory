-- 044 — separate the three coordinate collisions that are real
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Do not run without reading the confidence notes below.
--
-- Seven pairs of facilities share an identical coordinate. Auditing what each
-- pair actually is, only three of those seven are wrong:
--
--   REAL COLLISIONS — two facilities in different parts of the city on one pin
--     9.035, 38.768   Amina Speech and Language Therapy   (bisrate gabriel)
--                     Mestawot MCH Center                 (jemo)
--     9.032, 38.75    Danu Orthopaedic Center             (general wingate street)
--                     DROGA Physiotherapy Specialty Clinic (arat kilo)
--     9.02,  38.77    Ethio Scandic Internal Medicine     (wossen)
--                     Nahom Specialty Dental Clinic       (multiple branches)
--
--   NOT COLLISIONS — both facilities really are in the same place, and at the
--   precision these pins carry, one point is the honest answer for both
--     9.0095, 38.848  Axon Stroke and Spine Center + Samaritan Surgical Center
--                     — both "sunshine real estate meri lokie", one complex
--     9.034, 38.798   Biruh Vision Eye Clinic + OTORINO ENT Surgical Center
--                     — both Gurd Shola
--     9.019, 38.769   Swiss Diagnostics Ethiopia + WGGA Eye Center
--                     — both Wello Sefer
--     These need building-level pins to separate, which no geocoder will give
--     for a clinic on an unnamed floor. Left alone deliberately.
--
--   NOT A LOCATION PROBLEM
--     9.018, 38.762   HabariDOC + Wastina — both sub_city "online".
--                     get-facilities.ts already sets onlineOnly for these and
--                     resolveFacilityCoordinates returns undefined, so they are
--                     ALREADY excluded from distance sorting. The stored pin is
--                     inert. Left alone.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHAT THIS WRITES, AND HOW GOOD IT IS
--
-- Moving ONE facility out of each real collision separates the pair. So this
-- moves the three whose neighbourhood could be resolved with confidence, and
-- leaves their partners exactly where they are for manual pinning.
--
-- Source: OpenStreetMap via Nominatim, queried once each at their documented
-- rate. Every result was inspected rather than taken on trust — the class and
-- type matter. "Wossen" returned a guest house named Wossen in Arat Kilo, five
-- kilometres from the Wossen area in Lemi Kura, and was rejected. "Bisrate
-- Gabriel" returned nothing at all.
--
-- These are NEIGHBOURHOOD centroids, not entrances. They are right to about
-- the district and wrong by several hundred metres within it. That is a large
-- improvement on a shared pin belonging to neither facility, and it is still
-- not what a patient needs to find a door. Every row here should be replaced
-- by a real pin through the admin Location editor when someone can stand at
-- the entrance or read the facility's own maps link.
--
--   Mestawot MCH Center      place/suburb "ጀሞ"        8.95996, 38.71148  HIGH
--     current 9.035, 38.768 is roughly 9 km from the Jemo it says it is in.
--   DROGA Physiotherapy      place/suburb "አራት ኪሎ"    9.03295, 38.76338  HIGH
--     current 9.032, 38.75 is about 1.4 km west of Arat Kilo.
--   Nahom Specialty Dental   highway/bus_stop cluster  8.98871, 38.78986  MEDIUM
--     main listing is the Bole Bridge branch; four separate OSM features agree
--     within 400 m. Current 9.02, 38.77 is about 4 km north of it.
--
-- STILL NEEDS A HUMAN — no confident source, left untouched by this migration:
--   Amina Speech and Language Therapy  "Bisrate Gabriel"  — no OSM result
--   Danu Orthopaedic Center            "General Wingate Street" — a street,
--     not a point; OSM returns three segments spanning 700 m
--   Ethio Scandic Internal Medicine    "Wossen" — only false matches
--
-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — inspect (read-only). Expect the three collisions listed above.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT   latitude, longitude, count(*) AS facilities,
         string_agg(name, ' | ' ORDER BY name) AS sharing_this_pin
FROM     facilities
WHERE    latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY latitude, longitude
HAVING   count(*) > 1
ORDER BY count(*) DESC, latitude;

-- The three rows about to move, with what they currently hold.
SELECT slug, name, latitude, longitude, area, sub_city
FROM   facilities
WHERE  slug IN (
         'mestawot-mch-center',
         'droga-physiotherapy-specialty-clinic',
         'nahom-specialty-dental-clinic'
       )
ORDER  BY name;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — apply. Guarded on the exact pin each row is expected to hold, so
-- a facility already corrected by hand is skipped rather than overwritten.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE facilities AS f
SET    latitude   = v.latitude,
       longitude  = v.longitude,
       maps_link  = 'https://www.google.com/maps?q=' || v.latitude || ',' || v.longitude,
       updated_at = now()
FROM (VALUES
    ('mestawot-mch-center',                  8.95996::numeric, 38.71148::numeric, 9.035::numeric, 38.768::numeric),
    ('droga-physiotherapy-specialty-clinic', 9.03295::numeric, 38.76338::numeric, 9.032::numeric, 38.750::numeric),
    ('nahom-specialty-dental-clinic',        8.98871::numeric, 38.78986::numeric, 9.020::numeric, 38.770::numeric)
) AS v(slug, latitude, longitude, expect_lat, expect_lng)
WHERE  f.slug = v.slug
  AND  f.latitude  = v.expect_lat
  AND  f.longitude = v.expect_lng;

-- Expect "UPDATE 3". Fewer means someone has already corrected one by hand —
-- check which before re-running, because the guard will keep skipping it.

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — verify.
-- ═══════════════════════════════════════════════════════════════════════════

-- The three moved rows.
SELECT slug, name, latitude, longitude
FROM   facilities
WHERE  slug IN (
         'mestawot-mch-center',
         'droga-physiotherapy-specialty-clinic',
         'nahom-specialty-dental-clinic'
       )
ORDER  BY name;

-- Remaining shared pins. Expect exactly four rows — the three same-place pairs
-- and the online pair — and none of the three separated above.
SELECT   latitude, longitude, count(*) AS facilities,
         string_agg(name, ' | ' ORDER BY name) AS sharing_this_pin
FROM     facilities
WHERE    latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY latitude, longitude
HAVING   count(*) > 1
ORDER BY latitude;
