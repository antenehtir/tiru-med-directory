-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — NOT YET APPLIED.
--
-- Corrects the stored position of iCMC General Hospital (International
-- Cardiovascular and Medical Center), which sits 3.038 km from where the
-- hospital actually is.
--
--   stored : 9.048,      38.842        (3 decimals)
--   real   : 9.0234851,  38.8542159    (7 decimals)
--
-- The real value is Google's own resolution of the feature id already stored
-- in this row's maps_link (0x164b9079dcb5cbf3:0x4dc398c29784e511), so this is
-- not a new opinion about where the hospital is — it is the position that
-- link has always pointed at.
--
-- Why it was wrong: the maps_link is a NAME-SEARCH url
-- (maps.google.com/maps?q=<name>&ftid=...), not a pinned /place/ url, so it
-- carries no lat/lng of its own. Nothing derived the coordinates from it;
-- 9.048/38.842 is a hand-estimated value, which its 3-decimal precision
-- reflects. Resolving the ftid is what recovered the true position.
--
-- User-visible effect of the bug: standing at the hospital's door, /nearby
-- computed 3.038 km and ranked it #12 of 106, below eleven facilities that
-- looked closer (the nearest, Yerer General Hospital, showing at 0.492 km).
-- It rendered inside the 20-card cap, but eleven rows down and labelled
-- "3.0 km away" — indistinguishable from missing. After this fix the same
-- test ranks it #1 at 0.000 km.
--
-- Scope is deliberately this one row. A wider audit of the 67 facilities
-- stored at <=3-decimal precision is running separately; whatever it finds
-- belongs in its own migration, guarded per row the same way.

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — inspect (read-only). Run this first and read the output.
-- ═══════════════════════════════════════════════════════════════════════════

-- The row as it stands. Confirm latitude/longitude still read 9.048 / 38.842
-- before running STEP 2 — if they do not, something has changed this row
-- since the file was written and STEP 2 will (correctly) do nothing.
SELECT id, slug, name, latitude, longitude, maps_link, updated_at
FROM   facilities
WHERE  slug = 'icmc-general-hospital-international-cardiovascular-and-medical-center';

-- Must return exactly 1. If it returns 0, the coordinates already differ from
-- the wrong value this migration guards on — stop and re-audit before writing.
SELECT count(*) AS rows_matching_the_known_wrong_value
FROM   facilities
WHERE  slug = 'icmc-general-hospital-international-cardiovascular-and-medical-center'
  AND  latitude  = 9.048
  AND  longitude = 38.842;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — apply. Guarded on the known-wrong value, so re-running is a no-op
-- and a row someone else has already corrected is left alone.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE facilities
SET    latitude   = 9.0234851,
       longitude  = 38.8542159,
       updated_at = now()
WHERE  slug = 'icmc-general-hospital-international-cardiovascular-and-medical-center'
  AND  latitude  = 9.048
  AND  longitude = 38.842;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — verify. Expect 9.0234851 / 38.8542159.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT slug, latitude, longitude, updated_at
FROM   facilities
WHERE  slug = 'icmc-general-hospital-international-cardiovascular-and-medical-center';
