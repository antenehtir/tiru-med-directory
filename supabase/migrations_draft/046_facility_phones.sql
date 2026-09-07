-- 046 — let a facility hold as many phone numbers as it has
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Not run.
--
-- The table has held exactly two numbers, `phone` and `phone_2`, and 94 of the
-- 106 live rows already use both. That is what a ceiling looks like from
-- underneath: not "two is enough" but "two is all we ever asked for".
-- Reception, emergency and a branch line is three, and that is an ordinary
-- clinic — the third number currently has nowhere to go except the free-text
-- fields, where nothing can dial it.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHY A COLUMN AND NOT A TABLE
--
-- A phone number has no attributes worth a row of its own: no schedule, no
-- ownership, no history anyone will query. It is an ordered list of strings
-- belonging to one facility, which is what jsonb is for. `branches` is already
-- stored this way for the same reason, so this matches how the table already
-- thinks rather than introducing a second idea of what "belongs to a facility"
-- means.
--
-- ORDER IS MEANINGFUL. The first entry is the number a patient should try
-- first. Nothing sorts this array.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHY phone AND phone_2 STAY
--
-- They are not deprecated by this and must not be dropped. Every reader in the
-- app still uses them — the facility cards, the detail panel, the contact
-- channels that build the Call button, the admin list, the seed script. A
-- number living only in the new array would be invisible in all of them.
--
-- So the first two entries of `phones` and the two old columns are kept in
-- step, by this migration and by the code that writes them. `phones` is the
-- full list; `phone`/`phone_2` are the first two, mirrored for readers that
-- have not been taught about the array. Dropping them is a later change that
-- has to move every reader first, and is deliberately not attempted here.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — add the column. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS phones jsonb;

-- An array or nothing. A bare string or an object here would break every
-- reader that expects to iterate it, and would do so quietly.
ALTER TABLE facilities
  DROP CONSTRAINT IF EXISTS facilities_phones_is_array;

ALTER TABLE facilities
  ADD CONSTRAINT facilities_phones_is_array
  CHECK (phones IS NULL OR jsonb_typeof(phones) = 'array');

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — inspect before writing.
-- ═══════════════════════════════════════════════════════════════════════════

-- Expect phones NULL everywhere, and roughly 94 rows with a second number.
SELECT count(*)                                             AS facilities,
       count(*) FILTER (WHERE phone   IS NOT NULL)          AS with_phone,
       count(*) FILTER (WHERE phone_2 IS NOT NULL)          AS with_phone_2,
       count(*) FILTER (WHERE phones  IS NOT NULL)          AS already_migrated
FROM   facilities;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — backfill from the two existing columns, in order.
-- Guarded on NULL, so a list edited by hand is never rebuilt from the pair.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE facilities
SET    phones = (
         SELECT coalesce(jsonb_agg(p ORDER BY ord), '[]'::jsonb)
         FROM   (
                  SELECT 1 AS ord, nullif(btrim(phone), '')   AS p
                  UNION ALL
                  SELECT 2 AS ord, nullif(btrim(phone_2), '') AS p
                ) AS pair
         WHERE  p IS NOT NULL
       ),
       updated_at = now()
WHERE  phones IS NULL
  AND  (nullif(btrim(phone), '') IS NOT NULL OR nullif(btrim(phone_2), '') IS NOT NULL);

-- Expect roughly "UPDATE 100" — every row that has at least one number.

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4 — verify.
-- ═══════════════════════════════════════════════════════════════════════════

-- Must return 0. The first entry has to equal `phone`, or the two
-- representations already disagree and readers would show different numbers
-- depending on which one they happen to use.
SELECT count(*) AS rows_where_first_phone_disagrees
FROM   facilities
WHERE  phones IS NOT NULL
  AND  jsonb_array_length(phones) > 0
  AND  phones->>0 IS DISTINCT FROM btrim(phone);

-- Must return 0. Same check for the second slot, ignoring rows that only ever
-- had one number.
SELECT count(*) AS rows_where_second_phone_disagrees
FROM   facilities
WHERE  phones IS NOT NULL
  AND  jsonb_array_length(phones) > 1
  AND  phones->>1 IS DISTINCT FROM btrim(phone_2);

-- Must return 0. Nothing should hold an empty string as a number.
SELECT count(*) AS rows_with_a_blank_number
FROM   facilities, jsonb_array_elements_text(coalesce(phones, '[]'::jsonb)) AS n
WHERE  btrim(n) = '';

-- Eyeball a few, including any that already have more than two.
SELECT slug, name, phone, phone_2, phones
FROM   facilities
WHERE  phones IS NOT NULL
ORDER  BY jsonb_array_length(phones) DESC, name
LIMIT  10;
