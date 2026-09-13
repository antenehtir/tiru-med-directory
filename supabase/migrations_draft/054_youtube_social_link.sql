-- 054 — add a YouTube link alongside the other social platforms
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Not run.
--
-- Every social platform already offered (Instagram, Facebook, TikTok,
-- LinkedIn, Telegram, WhatsApp) has its own column, its own onboarding field,
-- and its own row on the public "Also available on" strip. YouTube had none
-- of that — requested directly, for the same reason TikTok and LinkedIn were
-- added: providers already run channels there and had nowhere on the
-- listing to say so.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — add to facilities, and to claims so onboarding can carry it.
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS youtube text;

-- Without the claim column the value would be collected during onboarding
-- and dropped at approval — the same gap 045 fixed for diagnostic_subtype
-- and 047 fixed for closed_on_public_holidays.
ALTER TABLE facility_claims
  ADD COLUMN IF NOT EXISTS proposed_youtube text;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — inspect. Expect both counts to be 0: nothing has answered yet.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT count(*)                                    AS facilities,
       count(*) FILTER (WHERE youtube IS NOT NULL) AS answered
FROM   facilities;

SELECT count(*)                                             AS claims,
       count(*) FILTER (WHERE proposed_youtube IS NOT NULL) AS answered
FROM   facility_claims;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — no backfill. No facility's YouTube channel is in this repo's data
-- anywhere (unlike 041's tiktok/linkedin backfill, which had a verified
-- source document to draw from) — the column fills in as providers and
-- admins add their real channel link, nothing sooner.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4 — verify the columns exist and are still unanswered.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT table_name, column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  (table_name = 'facilities'      AND column_name = 'youtube')
   OR  (table_name = 'facility_claims' AND column_name = 'proposed_youtube')
ORDER  BY table_name;

-- Expect two rows, both text and both nullable.
