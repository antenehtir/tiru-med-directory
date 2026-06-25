"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function providerSignUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;
  const phone = formData.get("phone") as string;
  const termsAccepted = formData.get("terms") === "on";

  if (!termsAccepted) {
    redirect("/provider/signup?error=terms");
  }

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

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/provider/signup?error=${encodeURIComponent(error?.message ?? "signup_failed")}`);
  }

  // Create provider_account record
  const { error: insertError } = await supabase
    .from("provider_accounts")
    .insert({
      id: data.user.id,
      email,
      display_name: displayName,
      phone,
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      onboarding_phase: 0,
      completion_pct: 10,
      last_active_at: new Date().toISOString(),
    });

  if (insertError) {
    redirect(`/provider/signup?error=account_creation_failed`);
  }

  redirect("/provider/onboarding/claim");
}
