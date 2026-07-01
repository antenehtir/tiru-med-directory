import { createProviderSupabaseClient } from "@/lib/supabase/provider-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createProviderSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/provider/login", request.url));
}
