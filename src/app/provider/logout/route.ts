import { createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createProviderSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(
    new URL(
      "/provider/login",
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
  );
}
