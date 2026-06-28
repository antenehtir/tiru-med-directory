"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function providerSignIn(formData: FormData) {
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
    redirect("/provider/login?error=invalid");
  }

  // Check they have a provider_account
  const { data: provider } = await supabase
    .from("provider_accounts")
    .select("id, onboarding_phase")
    .eq("id", data.user.id)
    .single();

  if (!provider) {
    await supabase.auth.signOut();
    redirect("/provider/login?error=not_provider");
  }

  // Route based on onboarding phase
  const phaseToSlug: Record<number, string> = {
    0: "/provider/onboarding/claim",
    1: "/provider/onboarding/identity",
    2: "/provider/onboarding/location",
    3: "/provider/onboarding/services",
    4: "/provider/onboarding/doctors",
    5: "/provider/onboarding/media",
    6: "/provider/onboarding/review",
  };

  const destination =
    phaseToSlug[provider.onboarding_phase ?? 0] ?? "/provider/dashboard";
  redirect(destination);
}
