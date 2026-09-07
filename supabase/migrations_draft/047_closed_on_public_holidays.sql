-- 047 — record whether a facility closes on public holidays
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Not run.
--
-- The schedule builder can already mark a weekday closed, because a weekday is
-- a row in the schedule. A public holiday is not a weekday and has no row, so
-- there has been nowhere to say it — and "Mon–Sat 8AM–6PM" reads as a promise
-- that the doors are open on Meskel or Eid, which for most facilities is not
-- true. Someone travelling across Addis on a holiday to a clinic that is shut
-- is the failure this prevents.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHY A COLUMN AND NOT A SCHEDULE ROW
--
-- Encoding it as a row inside the existing `schedule` array was the tempting
-- option, since that needs no migration. It was rejected: every reader of that
-- array treats a row as "these weekdays, these hours", and a row whose days
-- are not weekdays would have to be special-cased in the builder, the summary
-- text, the open/closed calculation and anything written later. A boolean that
-- means one thing is cheaper than a row that means something different from
-- its neighbours.
--
-- Three-state on purpose. NULL is "not stated" and is not the same as false:
-- most of the 107 live rows were imported and nobody has been asked this
-- question yet, so defaulting them all to "open on holidays" would invent an
-- answer and display it as fact. Only the UI can distinguish "we are open" from
-- "nobody has said", and it needs the null to do it.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — add to facilities, and to claims so onboarding can carry it.
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS closed_on_public_holidays boolean;

-- The provider answers this during onboarding, on the same step as the
-- schedule. Without the claim column the answer would be collected and then
-- dropped at approval, which is how diagnostic_subtype was lost before 045.
ALTER TABLE facility_claims
  ADD COLUMN IF NOT EXISTS proposed_closed_on_public_holidays boolean;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — inspect. Expect both counts to be 0: nothing has answered yet.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT count(*)                                                     AS facilities,
       count(*) FILTER (WHERE closed_on_public_holidays IS NOT NULL) AS answered
FROM   facilities;

SELECT count(*)                                                              AS claims,
       count(*) FILTER (WHERE proposed_closed_on_public_holidays IS NOT NULL) AS answered
FROM   facility_claims;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — no backfill.
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Deliberately nothing here. There is no honest value to write: the intake
-- data never asked about holidays, so every row is genuinely unknown. Guessing
-- true would close facilities that open; guessing false would promise doors
-- that are shut. The column fills in as facilities are edited and as providers
-- complete onboarding, and until then the UI says nothing rather than
-- something wrong.

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4 — verify the columns exist and are still unanswered.
-- ═══════════════════════════════════════════════════════════════════════════

SELECT table_name, column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  (table_name = 'facilities'     AND column_name = 'closed_on_public_holidays')
   OR  (table_name = 'facility_claims' AND column_name = 'proposed_closed_on_public_holidays')
ORDER  BY table_name;

-- Expect two rows, both boolean and both nullable.
