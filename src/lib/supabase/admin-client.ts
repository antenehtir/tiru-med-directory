import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for admin routes.
 * Uses the anon key — RLS + admin_users table controls access.
 */
export async function createAdminSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // Supabase writes here when it refreshes an expiring access token.
        // Next.js only permits cookie writes from a Server Action or Route
        // Handler, so the same call that succeeds inside an action throws
        // during a Server Component render — and an uncaught throw here 500s
        // the whole page. That is what took down /admin/audit-log with
        // "Cookies can only be modified in a Server Action or Route Handler";
        // every admin page renders through getAdminUser(), so any of them
        // could fail the moment a refresh happened to land mid-render.
        //
        // Swallowing the failure is safe for the render, but note what it
        // costs: this project has no middleware, so a refreshed token is only
        // persisted when the refresh happens during an action. Reads keep
        // working on the existing token and the session still ends when that
        // token finally expires. Adding middleware to refresh sessions on
        // every request is the proper fix; this stops the crash.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component, where cookies are read-only.
          }
        },
      },
    },
  );
}

/**
 * Returns the authenticated admin user, or null if not logged in / not an admin.
 * Use this in every admin server component and route handler.
 */
export async function getAdminUser() {
  const supabase = await createAdminSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email, role, display_name")
    .eq("id", user.id)
    .single();

  if (adminError || !adminUser) {
    return null;
  }

  return adminUser;
}
