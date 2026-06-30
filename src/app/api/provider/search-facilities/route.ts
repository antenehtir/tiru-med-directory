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

  // Try with is_active filter (requires migration 023); fall back without it
  // if the column doesn't exist yet.
  let data: Record<string, unknown>[] | null = null;
  let error: { message: string } | null = null;

  ({ data, error } = await supabase
    .from("facilities")
    .select("id, slug, name, category, area, sub_city, verification_status")
    .eq("is_active", true)
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(10) as { data: Record<string, unknown>[] | null; error: { message: string } | null });

  if (error?.message?.includes("is_active")) {
    // Column not yet added — retry without the filter.
    ({ data, error } = await supabase
      .from("facilities")
      .select("id, slug, name, category, area, sub_city, verification_status")
      .ilike("name", `%${q}%`)
      .order("name")
      .limit(10) as { data: Record<string, unknown>[] | null; error: { message: string } | null });
  }

  if (error) {
    return NextResponse.json({ facilities: [], error: error.message });
  }

  return NextResponse.json({ facilities: data ?? [] });
}
