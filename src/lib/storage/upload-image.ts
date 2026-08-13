import { getProviderBrowserClient as getClient } from "@/lib/supabase/provider-browser-client";

// Every upload gets a brand-new, uuid-keyed path rather than overwriting a
// fixed path with `upsert: true`. Replacing an image this way only ever
// needs storage INSERT (already granted for these buckets) instead of
// UPDATE — sidesteps the RLS-grant gap that was causing "Upload failed —
// please try again" on re-uploads — and a fresh path means the browser/CDN
// never serves a stale cached copy of the old image at the same URL.
export async function uploadImageToBucket(
  bucket: string,
  folder: string,
  file: File | Blob,
  extHint: string,
  previousUrl?: string | null,
): Promise<string> {
  const supabase = getClient();
  const ext = (extHint || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  const previousPath = pathFromPublicUrl(bucket, previousUrl);
  if (previousPath) {
    // Best-effort cleanup of the file being replaced. The new file is
    // already live at this point, so a failure here (e.g. missing DELETE
    // grant) must never fail the upload — it just leaves an orphan object.
    void supabase.storage
      .from(bucket)
      .remove([previousPath])
      .catch((err: unknown) => console.warn(`Failed to remove old ${bucket} object:`, previousPath, err));
  }

  return data.publicUrl;
}

export async function deleteImageFromBucket(bucket: string, url: string | null | undefined) {
  const path = pathFromPublicUrl(bucket, url);
  if (!path) return;
  const supabase = getClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.warn(`Failed to remove ${bucket} object:`, path, error);
}

export function pathFromPublicUrl(bucket: string, url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export function extensionFromFile(file: File): string {
  return file.name.split(".").pop() ?? "jpg";
}
