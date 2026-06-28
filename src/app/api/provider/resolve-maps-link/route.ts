import { NextRequest, NextResponse } from "next/server";

function extractCoords(url: string): { lat: number; lng: number } | null {
  // !3d!4d format — pin coordinates (most accurate)
  const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
  }
  // @lat,lng format — viewport center
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }
  // q=lat,lng format
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }
  return null;
}

function isValidAddis(lat: number, lng: number) {
  return lat >= 8.7 && lat <= 9.3 && lng >= 38.5 && lng <= 39.0;
}

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  // Try extracting directly first (full URLs already have coords)
  const direct = extractCoords(url);
  if (direct && isValidAddis(direct.lat, direct.lng)) {
    return NextResponse.json({ lat: direct.lat, lng: direct.lng, resolvedUrl: url });
  }

  // Follow redirects server-side (handles maps.app.goo.gl short URLs)
  let current = url;
  for (let i = 0; i < 6; i++) {
    try {
      const res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });

      const location = res.headers.get("location");
      if (!location) break;

      current = location.startsWith("http")
        ? location
        : new URL(location, current).href;

      const coords = extractCoords(current);
      if (coords && isValidAddis(coords.lat, coords.lng)) {
        return NextResponse.json({
          lat: coords.lat,
          lng: coords.lng,
          resolvedUrl: current,
        });
      }
    } catch {
      break;
    }
  }

  return NextResponse.json(
    { error: "Could not extract coordinates from this link. Try copying the link from Google Maps directly on your facility page." },
    { status: 422 },
  );
}
