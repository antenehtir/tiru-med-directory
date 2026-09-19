"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// A failed sign-in comes back to the form as a result instead of reloading
// the page, so what was typed stays in the boxes to correct.
export type SignInResult = { error: "invalid" | "not_provider" } | undefined;

export async function providerSignIn(_prev: SignInResult, formData: FormData): Promise<SignInResult> {
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

  // Check they have a provider_account
  const { data: provider } = await supabase
    .from("provider_accounts")
    .select("id, onboarding_phase")
    .eq("id", data.user.id)
    .single();

  if (!provider) {
    await supabase.auth.signOut();
    return { error: "not_provider" };
  }

  // Always land on the Overview tab of the provider console — it already
  // shows the right status-specific messaging (start/continue onboarding,
  // ready to submit, under review, approved) and links onward from there.
  // The milestone page is reachable explicitly, not as a login destination.
  redirect("/provider/dashboard");
}
