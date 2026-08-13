-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- ROOT-CAUSE CONTEXT for "Upload failed — please try again" on re-upload
-- (facility image, facility logo, specialist photo):
--
-- All three upload sites previously wrote to a fixed, deterministic storage
-- path per claim (e.g. `${claimId}/entrance.${ext}`) and relied on
-- `{ upsert: true }` to overwrite it on replace. Supabase storage upsert
-- performs an UPDATE against storage.objects when the path already exists —
-- and per the setup note already in the doctors-photo upload code
-- (src/components/provider/steps/Step4DoctorsForm.tsx, "MANUAL SETUP
-- REQUIRED"), only INSERT (and SELECT) were ever granted:
--   GRANT SELECT ON storage.objects TO anon;
--   GRANT INSERT ON storage.objects TO authenticated;
-- With no UPDATE grant/policy, the first upload to a path succeeds (INSERT)
-- but every subsequent upload to that same path (an upsert-triggered UPDATE)
-- is denied — reproducing the reported bug exactly.
--
-- The app-side fix (see src/lib/storage/upload-image.ts) sidesteps this by
-- giving every upload a brand-new uuid-keyed path instead of overwriting a
-- fixed path, so replacing an image only ever needs INSERT (already
-- granted) — this migration is not required for uploads/re-uploads to work.
--
-- It only adds the DELETE grant/policy needed for the best-effort cleanup
-- of the file being replaced (src/lib/storage/upload-image.ts calls
-- `.remove()` after a successful re-upload). Without it, cleanup silently
-- fails (already handled as non-fatal in app code) and old objects are
-- never removed from these buckets — safe to skip if you'd rather not grant
-- delete yet, but recommended to avoid unbounded storage growth.

grant delete on storage.objects to authenticated;

drop policy if exists "Authenticated can delete facility-photos objects" on storage.objects;
create policy "Authenticated can delete facility-photos objects"
on storage.objects
for delete
to authenticated
using (bucket_id = 'facility-photos');

drop policy if exists "Authenticated can delete doctor-photos objects" on storage.objects;
create policy "Authenticated can delete doctor-photos objects"
on storage.objects
for delete
to authenticated
using (bucket_id = 'doctor-photos');

NOTIFY pgrst, 'reload schema';
