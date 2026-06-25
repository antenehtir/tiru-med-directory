import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createProviderSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
}

export async function getProviderAccount() {
  const supabase = await createProviderSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: provider, error } = await supabase
    .from("provider_accounts")
    .select(`
      *,
      facilities (
        id, slug, name, category, sub_city, area,
        verification_status, record_number
      )
    `)
    .eq("id", user.id)
    .single();

  if (error || !provider) return null;

  return provider;
}
