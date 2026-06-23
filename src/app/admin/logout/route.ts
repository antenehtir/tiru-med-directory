import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createAdminSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(
    new URL(
      "/admin/login",
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
  );
}
