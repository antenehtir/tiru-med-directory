-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- One-time backfill: assigns record_number to any facility currently missing one,
-- in order of creation (oldest first), continuing from the current max record_number.
-- Safe to run more than once — the WHERE record_number IS NULL guard makes it idempotent.

DO $$
DECLARE
  next_num integer;
  rec RECORD;
BEGIN
  SELECT COALESCE(MAX(record_number), 0) + 1 INTO next_num FROM facilities;

  FOR rec IN
    SELECT id FROM facilities
    WHERE record_number IS NULL
    ORDER BY created_at ASC
  LOOP
    UPDATE facilities SET record_number = next_num WHERE id = rec.id;
    next_num := next_num + 1;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
