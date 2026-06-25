import { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicClient } from "@/lib/supabase/public-client";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ facilities: [] });
  }

  const supabase = getSupabasePublicClient();

  if (!supabase) {
    return NextResponse.json({ facilities: [] });
  }

  const { data, error } = await supabase
    .from("facilities")
    .select("id, slug, name, category, location, verification_status")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(10);

  if (error) {
    return NextResponse.json({ facilities: [] });
  }

  return NextResponse.json({ facilities: data });
}
