"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// A failed sign-in comes back to the form as a result instead of reloading
// the page, so what was typed stays in the boxes to correct.
export type AdminSignInResult = { error: "invalid" | "unauthorized" } | undefined;

export async function adminSignIn(_prev: AdminSignInResult, formData: FormData): Promise<AdminSignInResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: "invalid" };
  }

  // Verify the user is in admin_users table
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!adminUser) {
    await supabase.auth.signOut();
    return { error: "unauthorized" };
  }

  redirect("/admin");
}

export async function requestPasswordReset(
  email: string,
): Promise<{ error?: string; success?: boolean }> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/admin/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}
