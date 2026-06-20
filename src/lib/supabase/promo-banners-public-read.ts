import {
  getSupabasePublicClient,
  getSupabasePublicClientStatus,
} from "./public-client";

export type PromoBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
};

type SupabasePromoBannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
};

export async function getActivePromoBanner(): Promise<PromoBanner | null> {
  const clientStatus = getSupabasePublicClientStatus();

  if (!clientStatus.isAvailable) {
    return null;
  }

  const client = getSupabasePublicClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("promo_banners")
    .select("id, title, subtitle, image_url, link_url")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  console.log(
    "[promo-banners] raw query result — data:",
    JSON.stringify(data),
    "error:",
    JSON.stringify(error),
  );

  if (error) {
    console.error("[promo-banners] Supabase query failed:", error);
    return null;
  }

  if (!data) {
    console.log("[promo-banners] Query succeeded but returned no row (no active banner).");
    return null;
  }

  const row = data as unknown as SupabasePromoBannerRow;

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
  };
}
