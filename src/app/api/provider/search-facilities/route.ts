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

  // PostgREST's .or() filter syntax splits on "," and groups on "()" — strip
  // those out of the raw query so free-typed input can't break the filter.
  const safeQ = q.replace(/[,()]/g, "");
  const orFilter = `name.ilike.%${safeQ}%,area.ilike.%${safeQ}%,sub_city.ilike.%${safeQ}%,category.ilike.%${safeQ}%`;

  // Try with is_active filter (requires migration 023); fall back without it
  // if the column doesn't exist yet.
  let data: Record<string, unknown>[] | null = null;
  let error: { message: string } | null = null;

  ({ data, error } = await supabase
    .from("facilities")
    .select("id, slug, name, category, area, sub_city, verification_status")
    .eq("is_active", true)
    .or(orFilter)
    .order("name")
    .limit(10) as { data: Record<string, unknown>[] | null; error: { message: string } | null });

  if (error?.message?.includes("is_active")) {
    // Column not yet added — retry without the filter.
    ({ data, error } = await supabase
      .from("facilities")
      .select("id, slug, name, category, area, sub_city, verification_status")
      .or(orFilter)
      .order("name")
      .limit(10) as { data: Record<string, unknown>[] | null; error: { message: string } | null });
  }

  if (error) {
    return NextResponse.json({ facilities: [], error: error.message });
  }

  return NextResponse.json({ facilities: data ?? [] });
}
