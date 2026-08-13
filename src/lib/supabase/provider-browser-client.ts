import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

// Singleton authenticated browser client for provider-console writes
// (photo/logo/license uploads, doctor photos, checkup package PDFs).
//
// @supabase/ssr's createBrowserClient manages auth token refresh against
// the shared browser cookie jar. Several call sites used to each create
// their own fresh instance per upload — during a multi-file step (e.g.
// pharmacy's Step 5: up to 4 photos + logo + 2 licenses in one sitting),
// that meant several independently-refreshing clients racing on the same
// cookies, which can leave the cookie jar holding a token pair the server
// already superseded. The next request (including the Server Action that
// submits the listing) then sees an invalid session and getProviderAccount()
// returns null, which every onboarding action responds to with
// redirect("/provider/login") — this was the root cause of pharmacy
// submissions silently logging the provider out and losing unsaved uploads.
// Always reuse this one instance instead of calling createBrowserClient
// directly.
export function getProviderBrowserClient() {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return client;
}
