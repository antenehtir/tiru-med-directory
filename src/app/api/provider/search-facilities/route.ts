import { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicClient } from "@/lib/supabase/public-client";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ facilities: [] });
  }

  const supabase = getSupabasePublicClient();

  if (!supabase) {
    return NextResponse.json({ facilities: [], error: "no client" });
  }

  const { data, error } = await supabase
    .from("facilities")
    .select("id, slug, name, category, location, verification_status")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(10);

  if (error) {
    return NextResponse.json({ facilities: [], error: error.message });
  }

  return NextResponse.json({ facilities: data ?? [] });
}
