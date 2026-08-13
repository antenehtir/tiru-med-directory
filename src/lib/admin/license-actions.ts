"use server";

import { createClient } from "@supabase/supabase-js";
import { getAdminUser } from "@/lib/supabase/admin-client";
import { pathFromPublicUrl } from "@/lib/storage/upload-image";

const LICENSE_BUCKET = "provider-documents";
// Short-lived per Fix 7a — long enough for an admin to open and review a
// document, short enough that a copy-pasted link goes stale quickly.
const SIGNED_URL_TTL_SECONDS = 5 * 60;

// License documents are private (provider-documents bucket) — the stored
// `license_url`/`business_license_url` values are getPublicUrl() results,
// which are NOT usable directly against a private bucket. This generates a
// short-lived signed URL instead, using the service role key (server-only,
// never exposed to the client) so it works regardless of what storage RLS
// policies exist, gated by an explicit admin check.
export async function getLicenseSignedUrl(
  licenseUrl: string | null | undefined,
): Promise<{ url: string } | { error: string }> {
  if (!licenseUrl) return { error: "No document on file." };

  const admin = await getAdminUser();
  if (!admin) return { error: "Unauthorized." };

  const path = pathFromPublicUrl(LICENSE_BUCKET, licenseUrl);
  if (!path) return { error: "Could not resolve document path." };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("getLicenseSignedUrl: SUPABASE_SERVICE_ROLE_KEY not configured");
    return { error: "Server misconfigured — contact an administrator." };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.storage
    .from(LICENSE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    console.error("getLicenseSignedUrl failed:", error?.message);
    return { error: "Could not open document — please try again." };
  }

  return { url: data.signedUrl };
}
