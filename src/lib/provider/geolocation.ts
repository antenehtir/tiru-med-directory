// What "use my current location" is actually worth, and how to tell.
//
// The browser's geolocation API does not promise GPS. It returns the best fix
// the device can produce and reports, in `coords.accuracy`, the radius in
// metres it is 95% confident the true position falls within. That number is
// the difference between a coordinate worth storing and one that is worse than
// the neighbourhood guess it would replace:
//
//   phone outdoors, real GNSS      5–20 m
//   phone indoors                 20–80 m
//   laptop on Wi-Fi              100 m – 3 km
//   anything falling back to IP     1–30 km
//
// Nothing read this before. The only check was a bounding box around Addis,
// about 65 km by 55 km, so a laptop's Wi-Fi fix at a desk passed and was
// stored at full float precision — looking more trustworthy than the
// three-decimal seed value it replaced while being less accurate than it.

// Good enough that the pin lands on the right building.
export const GPS_PRECISE_M = 50;
// Beyond this the fix is not a fix. 200 m across Addis spans several
// compounds and more than one turning, so it cannot identify an entrance,
// which is the entire purpose of the coordinate.
export const GPS_MAX_M = 200;

// Addis Ababa and its immediate surrounds. Coarse on purpose: it is a sanity
// check against a device reporting a position in another country, not a
// precision test — GPS_MAX_M does that job.
export function isValidAddisCoords(lat: number, lng: number): boolean {
  return lat >= 8.7 && lat <= 9.3 && lng >= 38.5 && lng <= 39.0;
}

export type GpsVerdict =
  | { ok: true; precise: true; accuracy: number }
  | { ok: true; precise: false; accuracy: number; note: string }
  | { ok: false; message: string };

export function judgeGpsFix(lat: number, lng: number, accuracy: number): GpsVerdict {
  if (!isValidAddisCoords(lat, lng)) {
    return {
      ok: false,
      message:
        "Your location appears to be outside Addis Ababa. Please paste a Google Maps link instead.",
    };
  }

  // Some platforms report accuracy as 0 or a non-finite value when they have
  // no real estimate. Treated as unknown rather than perfect — a 0 here has
  // never meant the fix is exact.
  if (!Number.isFinite(accuracy) || accuracy <= 0) {
    return {
      ok: false,
      message:
        "This device did not report how accurate its location is, so it cannot be trusted for a pin. Please paste a Google Maps link instead.",
    };
  }

  if (accuracy > GPS_MAX_M) {
    return {
      ok: false,
      message: `This device reported its position to within ±${Math.round(accuracy)} m — that is network positioning, not GPS. Use a phone while standing at the entrance, or paste a Google Maps link.`,
    };
  }

  if (accuracy > GPS_PRECISE_M) {
    return {
      ok: true,
      precise: false,
      accuracy,
      note: `Accurate to about ±${Math.round(accuracy)} m — the right block, but perhaps not the right doorway. A Google Maps link may place the pin better.`,
    };
  }

  return { ok: true, precise: true, accuracy };
}

// Metres between two points, for comparing a fresh capture against whatever is
// already stored. Equirectangular rather than haversine: over the few
// kilometres this is ever asked about, the error is centimetres.
export function metresBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x = toRad(lng2 - lng1) * Math.cos(toRad((lat1 + lat2) / 2));
  const y = toRad(lat2 - lat1);
  return Math.sqrt(x * x + y * y) * R;
}

// Far enough from the stored pin that it is worth asking whether the right
// facility is open. Deliberately generous: many stored pins are still the
// imprecise seed value, so a genuine on-site capture can legitimately sit a
// kilometre or two away.
export const FAR_FROM_STORED_M = 2_000;
