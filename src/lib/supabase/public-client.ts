import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseBrowserEnv } from "./env";

let supabasePublicClient: SupabaseClient | null = null;

export function getSupabasePublicClient(): SupabaseClient | null {
  const env = getSupabaseBrowserEnv();

  if (!env.isAvailable) {
    return null;
  }

  if (supabasePublicClient) {
    return supabasePublicClient;
  }

  supabasePublicClient = createClient(env.url, env.anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return supabasePublicClient;
}

export function getSupabasePublicClientStatus():
  | { isAvailable: true; missingKeys: [] }
  | { isAvailable: false; missingKeys: string[] } {
  const env = getSupabaseBrowserEnv();

  if (!env.isAvailable) {
    return {
      isAvailable: false,
      missingKeys: env.missingKeys,
    };
  }

  return {
    isAvailable: true,
    missingKeys: [],
  };
}
