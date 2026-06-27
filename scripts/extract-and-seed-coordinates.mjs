import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load env
const envFile = readFileSync(".env.local", "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter(line => line.includes("=") && !line.startsWith("#"))
    .map(line => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

// All google_maps links from the source data
const facilities = [
  { record_number: 1, name: "Lancet General Hospital", google_maps: "https://maps.app.goo.gl/QWcejGM3CbdGbsqeA" },
  { record_number: 2, name: "Silkroad General Hospital", google_maps: "https://maps.app.goo.gl/r6afZySpnqYWVkis9" },
  { record_number: 3, name: "Hallelujah General Hospital", google_maps: "https://maps.app.goo.gl/twJuDtsdGckY2iNq7" },
  { record_number: 4, name: "Ethio-Istanbul General Hospital", google_maps: "https://maps.app.goo.gl/8zTUJzBzKfxo3ZrT6" },
  { record_number: 5, name: "Amin General Hospital", google_maps: "https://maps.app.goo.gl/crsjxhMsju1cdc9V8" },
  { record_number: 6, name: "GIRUM HOSPITAL", google_maps: "https://maps.app.goo.gl/FYBy4S7YoshRMP197" },
  { record_number: 7, name: "Meqrez General Hospital", google_maps: "https://maps.app.goo.gl/WzYWr7NJ5rxF8N5c8" },
  { record_number: 8, name: "St. Gabriel General Hospital", google_maps: "https://maps.app.goo.gl/WvNFZdSYTUpsSVUS8" },
  { record_number: 9, name: "Addis Hiwot General Hospital", google_maps: "http://maps.app.goo.gl/n12MA3SgsV8bv2MHA" },
  { record_number: 10, name: "MCM Comprehensive Specialized Hospital", google_maps: "https://maps.app.goo.gl/PBjAeM7JbdHq36BRA" },
  { record_number: 11, name: "Hayat Hospital", google_maps: "https://maps.app.goo.gl/N1WatNf41TFoTycK6" },
  { record_number: 12, name: "Bethzatha General Hospital", google_maps: "https://maps.app.goo.gl/1dEEm94BYWuUUhMu9" },
  { record_number: 13, name: "Careland General Hospital", google_maps: "https://maps.app.goo.gl/Nies9PnjrvkSnFw68" },
  { record_number: 14, name: "Legehar General Hospital", google_maps: "https://maps.app.goo.gl/T2aMc1yv67ryku1bA" },
  { record_number: 15, name: "Teklehaimanot General Hospital", google_maps: "https://maps.app.goo.gl/Fz2URwKEksw9m5jx8" },
  { record_number: 16, name: "Kadisco General Hospital", google_maps: "https://maps.app.goo.gl/rspP2atqDHv9ZQiz6" },
  { record_number: 17, name: "iCMC General Hospital", google_maps: "https://maps.app.goo.gl/jJ89axuwcpPHfWTg9" },
  { record_number: 18, name: "Landmark General Hospital", google_maps: "https://maps.app.goo.gl/XR8A8MhoUZ3qqX1r6" },
  { record_number: 19, name: "Afran General Hospital", google_maps: "https://maps.app.goo.gl/18v7ETaus2dt9Gqe9" },
  { record_number: 20, name: "Yerer General Hospital", google_maps: "https://maps.app.goo.gl/QDrq75vv1DTi77JJA" },
  { record_number: 21, name: "Yanet General Hospital", google_maps: "https://maps.app.goo.gl/72NeYqZYrVG6iFfA7" },
  { record_number: 22, name: "Ethio TEBIB General Hospital", google_maps: "https://maps.app.goo.gl/bXwVH7gR172cZTzr9" },
  { record_number: 23, name: "American Medical & MCH Center", google_maps: "https://www.google.com/maps/place/American+Medical+Center/@9.031014,38.8490357,17z" },
  { record_number: 24, name: "Hemen MCH Center", google_maps: "https://maps.app.goo.gl/ndjDmqb4czDJTmmJ8" },
  { record_number: 25, name: "Samaritan Surgical Center", google_maps: "https://maps.app.goo.gl/Wg8TV3dvruZxRFZj8" },
  { record_number: 26, name: "Happy Children's Speciality Clinic", google_maps: "https://maps.app.goo.gl/HNbYXySaa6CCzc9m7" },
  { record_number: 27, name: "Apex Indian Surgical and Internal Medicine Speciality Center", google_maps: "https://maps.app.goo.gl/3GJSrgik3WxrDkTx9" },
  { record_number: 28, name: "Care MCH Center", google_maps: "https://g.co/kgs/H8HhxVX" },
  { record_number: 29, name: "Redat Healthcare", google_maps: "https://maps.app.goo.gl/p6CrJRihbLWPg7Jk7" },
  { record_number: 30, name: "Medstar Speciality Clinic", google_maps: "https://maps.app.goo.gl/WVK9WefQdeY7bSh89" },
  { record_number: 31, name: "Bloom Children's Speciality Clinic", google_maps: "https://maps.app.goo.gl/NZEUNyN5DECNgydY8" },
  { record_number: 32, name: "Dr. Shemse MCH Center", google_maps: "https://maps.app.goo.gl/p3VrEDR42NBrdGCA6" },
  { record_number: 33, name: "Trust Internal Medicine and Gastroenterology", google_maps: "https://maps.app.goo.gl/tTbn8Acuf2TdwSEe9" },
  { record_number: 34, name: "ACL ENT and Medical Center", google_maps: "https://maps.app.goo.gl/1r6MJNhYJogaURRYA" },
  { record_number: 35, name: "Mestawot MCH Center", google_maps: "https://maps.app.goo.gl/MgraKtyAHKQNoarj9" },
  { record_number: 36, name: "Birhaneselam Internal Medicine", google_maps: "https://maps.app.goo.gl/9YzJ575q7sdYHLdT8" },
  { record_number: 37, name: "Tazma Medical and Surgical Specialized Center", google_maps: "https://maps.app.goo.gl/J9WqwKkh1A8HWpuH6" },
  { record_number: 38, name: "Gesund Cardiac and Medical Center", google_maps: "https://maps.app.goo.gl/9U45Uwb3nTR1cQHt6" },
  { record_number: 39, name: "Hope Oncology Center", google_maps: "https://maps.app.goo.gl/waSqZnnuyZQyq2pb9" },
  { record_number: 40, name: "Nordic Medical Centre", google_maps: "https://maps.app.goo.gl/vDUetww6uhkAc1sq6" },
  { record_number: 41, name: "Adera Medical and Surgical Center", google_maps: "https://maps.app.goo.gl/V91yiE6Sgko7Gckj8" },
  { record_number: 42, name: "Danu Orthopaedic Center", google_maps: "https://g.co/kgs/xJvV4eRv" },
  { record_number: 43, name: "Washington Medical Centre", google_maps: "https://maps.app.goo.gl/hNh24BYMTbz6mNpF9" },
  { record_number: 44, name: "Lancet Beherawi Specialized Medical", google_maps: "https://g.co/kgs/mt6nRbe" },
  { record_number: 45, name: "Dream Orthopaedics, Trauma, and Spine Center", google_maps: "https://maps.app.goo.gl/m5FUtBxBUPSrFfev7" },
  { record_number: 46, name: "Yehuleshet Specialty Clinic", google_maps: "https://maps.app.goo.gl/Pjz8yVtJ9b9sKoQE9" },
  { record_number: 47, name: "Lancet Women and Children Hospital", google_maps: "https://maps.google.com/?cid=17345188147198467565" },
  { record_number: 48, name: "Heal Venture Medical and Surgical Center", google_maps: "https://maps.app.goo.gl/1j52DhHCnxQ2bwgm6" },
  { record_number: 49, name: "SUISSE CLINIC", google_maps: "https://maps.google.com/?cid=13073661226497916180" },
  { record_number: 50, name: "Lebeza Psychiatry Clinic", google_maps: "https://maps.app.goo.gl/uNAGwkLuAYycFVns8" },
  { record_number: 51, name: "Sitota Center for Mental Health Care", google_maps: "https://maps.app.goo.gl/oFVRaZFvWNugLYfv8" },
  { record_number: 52, name: "LA VISTA Specialty Eye Clinic", google_maps: "https://maps.app.goo.gl/c3hudALcfZgZf9U67" },
  { record_number: 53, name: "WGGA Eye Center", google_maps: "https://maps.app.goo.gl/Vx1Prrgc4qz3b87Y7" },
  { record_number: 54, name: "Biruh Vision Eye Specialty Clinic", google_maps: "https://maps.app.goo.gl/J4pZ8bLQcqLB1M5b7" },
  { record_number: 55, name: "Zion Physiotherapy Specialty Clinic", google_maps: "https://maps.app.goo.gl/acyarFWYbYhBJxfa8" },
  { record_number: 56, name: "Optimum Physiotherapy Specialty Clinic", google_maps: "https://maps.app.goo.gl/GU95wE3dtbsQs6BH8" },
  { record_number: 57, name: "DROGA Physiotherapy Specialty Clinic", google_maps: "https://g.co/kgs/mLBjiM1" },
  { record_number: 58, name: "Addis Cardiac Hospital", google_maps: "https://g.co/kgs/mPwSRf5" },
  { record_number: 59, name: "ElOuzeir Cardiac Center", google_maps: "https://maps.app.goo.gl/HinCsbXFNCYTWM646" },
  { record_number: 60, name: "Abed Dermatology and Venerology Speciality Center", google_maps: "https://maps.app.goo.gl/93iKB21dyxrJBVg19" },
  { record_number: 61, name: "Heal-Liv Hair Transplant and Dermatology", google_maps: "https://maps.app.goo.gl/DhAZeKim2tPXdVaN8" },
  { record_number: 62, name: "Dr. Mihretu Dermatology Clinic", google_maps: "https://g.co/kgs/wDxvEY" },
  { record_number: 63, name: "Axon Stroke and Spine Center", google_maps: "https://maps.app.goo.gl/GXhC9bKjdnsH4jD38" },
  { record_number: 64, name: "St. Paul's Hospital Center for Fertility", google_maps: "https://maps.app.goo.gl/UBEWPV71wMPBa3h89" },
  { record_number: 65, name: "Amina Speech and Language Therapy", google_maps: "https://maps.app.goo.gl/b7MnFj6mvbzcYt9t8" },
  { record_number: 66, name: "Loza Nutritional Consulting and Therapy", google_maps: "https://maps.app.goo.gl/yzv6LHJaxEZfvbfr9" },
  { record_number: 67, name: "OTORINO ENT Surgical Center", google_maps: "https://maps.google.com/?cid=11256823995965605362" },
  { record_number: 68, name: "OASIS E.N.T Head and Neck Speciality Center", google_maps: "https://maps.app.goo.gl/tqVyJntu3houJRFXA" },
  { record_number: 69, name: "Nahom Specialty Dental Clinic", google_maps: "https://g.co/kgs/V82XKu1" },
  { record_number: 70, name: "Babi Specialty Dental Clinic", google_maps: "https://maps.app.goo.gl/3NwXFUGmxeh8o9zv7" },
  { record_number: 71, name: "Lewi Specialty Dental Clinic", google_maps: "https://g.co/kgs/FqZW3pS" },
  { record_number: 72, name: "Lifeline Addis", google_maps: "https://maps.google.com/?cid=16650644885561946023" },
  { record_number: 73, name: "Chrocare Homecare", google_maps: "https://maps.google.com/?cid=17927944359878596625" },
  { record_number: 74, name: "International Clinical Laboratories (ICL)", google_maps: "https://maps.app.goo.gl/TsCsJutCDDwYVB8i8" },
  { record_number: 75, name: "ONCO Pathology Diagnostic Center", google_maps: "https://maps.app.goo.gl/TL4bYwRfbcsz1dfA9" },
  { record_number: 76, name: "Wudassie Diagnostic Center", google_maps: "https://maps.app.goo.gl/gNRynudbBfKpxank8" },
  { record_number: 77, name: "Swiss Diagnostics Ethiopia", google_maps: "https://maps.google.com/?cid=6924148755353648869" },
  { record_number: 78, name: "Pioneer Diagnostic Center", google_maps: "https://maps.app.goo.gl/wDTnTqnFjav8bp3g9" },
  { record_number: 79, name: "Manna Diagnostic Center", google_maps: "https://maps.app.goo.gl/ZLMAHALeWmYf9smq5" },
  { record_number: 80, name: "Tebita Ambulance", google_maps: "https://maps.google.com/?cid=1016156997315661479" },
  { record_number: 81, name: "Gize Psychiatric and Rehabilitation Center", google_maps: "https://maps.app.goo.gl/VVrm67h96qTA9hVd6" },
  { record_number: 82, name: "Asheten Psychiatry & Rehabilitation", google_maps: "https://maps.app.goo.gl/NCtfLmbYmtYNNSqn9" },
  { record_number: 83, name: "Renascent Mental Health", google_maps: "https://maps.app.goo.gl/5mvWX7mRvNLuVcHaA" },
  { record_number: 84, name: "Abrhot Specialized Psychotherapy Center", google_maps: "https://maps.app.goo.gl/g9W19h1SLgBa5u176" },
  { record_number: 85, name: "Habari Medical Plaza", google_maps: "https://maps.app.goo.gl/Zwk7DqL4GqZTrxbv6" },
  { record_number: 86, name: "American Medical Laboratories", google_maps: "https://maps.app.goo.gl/VwRVsbi8fvfE1rXP8" },
  { record_number: 90, name: "Fikreselam General Hospital", google_maps: "https://maps.app.goo.gl/GYqVuGNctWjzTh8V6" },
  { record_number: 91, name: "Betsegah Maternal and Children Hospital", google_maps: "https://maps.app.goo.gl/UCGTXcLL5aJyxFjc9" },
  { record_number: 92, name: "Nucleus General Hospital", google_maps: "https://maps.app.goo.gl/M9NUjvu5TyDs8wZX8" },
  { record_number: 93, name: "Doctors Alliance General Hospital", google_maps: "https://maps.app.goo.gl/jmfFH63ZJ5vr9ukc8" },
  { record_number: 94, name: "Paragon Physiotherapy and Sports Medicine", google_maps: "https://maps.app.goo.gl/sBXfbDeLh6EJmtyG8" },
  { record_number: 95, name: "British Pediatrics Center", google_maps: "https://maps.app.goo.gl/4t2kc2iGcxhUMLSX8" },
  { record_number: 96, name: "Manisay Obstetrics & Gynecology Specialty Clinic", google_maps: "https://maps.app.goo.gl/fi1Atfzg6p4nvZSdA" },
  { record_number: 97, name: "Sante Medical Center", google_maps: "https://maps.app.goo.gl/p8o8UURtMNEQfiV38" },
  { record_number: 99, name: "RANK Specialized Dermatology Clinic", google_maps: "https://maps.app.goo.gl/gRjRT4vGVcKxNnMr7" },
  { record_number: 100, name: "Pedi Care Pediatrics", google_maps: "https://maps.app.goo.gl/uSoSTqTTbdK9k8yE9" },
  { record_number: 101, name: "RAPHA Physiotherapy center", google_maps: "https://maps.app.goo.gl/YKaPG9MsKCC8MXWn9" },
  { record_number: 102, name: "Grace MCH center", google_maps: "https://maps.app.goo.gl/uyxTUxEygdJfdERZ9" },
  { record_number: 103, name: "Glow Ethio-Turkiye Skincare", google_maps: "https://maps.app.goo.gl/6oahWLRehFkr84y47" },
  { record_number: 104, name: "HuluCare Dermatology, Aesthetics & Hair Transplant Center", google_maps: "https://maps.app.goo.gl/JtgRMFkM6r6XfCgZ7" },
];

function extractCoordsFromUrl(url) {
  // !3d{lat}!4d{lng} is Google's precise place-marker coordinate. @lat,lng is
  // just the map viewport center, which can be 200m-1km+ off the actual pin
  // (verified against several resolved facility URLs) — check it first, and
  // only fall back to @lat,lng when the precise marker isn't present.
  const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  return null;
}

function isValidAddisCoords(lat, lng) {
  return lat >= 8.7 && lat <= 9.3 && lng >= 38.5 && lng <= 39.0;
}

async function resolveUrl(url, maxRedirects = 5) {
  let current = url;
  for (let i = 0; i < maxRedirects; i++) {
    try {
      const res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });

      // Check if current URL has coords
      const coords = extractCoordsFromUrl(current);
      if (coords && isValidAddisCoords(coords.lat, coords.lng)) {
        return { url: current, coords };
      }

      // Follow redirect
      const location = res.headers.get("location");
      if (!location) {
        // Check final URL
        const finalCoords = extractCoordsFromUrl(current);
        return { url: current, coords: finalCoords };
      }

      current = location.startsWith("http") ? location : new URL(location, current).href;

      // Check redirect target for coords
      const redirectCoords = extractCoordsFromUrl(current);
      if (redirectCoords && isValidAddisCoords(redirectCoords.lat, redirectCoords.lng)) {
        return { url: current, coords: redirectCoords };
      }
    } catch (e) {
      return { url: current, coords: null, error: e.message };
    }
  }
  return { url: current, coords: null };
}

async function main() {
  console.log(`Resolving coordinates for ${facilities.length} facilities...\n`);

  const results = [];
  let resolved = 0;
  let failed = 0;

  for (const facility of facilities) {
    // Check if URL already has coords
    const directCoords = extractCoordsFromUrl(facility.google_maps);
    if (directCoords && isValidAddisCoords(directCoords.lat, directCoords.lng)) {
      results.push({ ...facility, latitude: directCoords.lat, longitude: directCoords.lng });
      console.log(`✓ #${facility.record_number} ${facility.name.slice(0,40)} → ${directCoords.lat}, ${directCoords.lng} (direct)`);
      resolved++;
      continue;
    }

    // Resolve short URL
    const result = await resolveUrl(facility.google_maps);
    if (result.coords && isValidAddisCoords(result.coords.lat, result.coords.lng)) {
      results.push({ ...facility, latitude: result.coords.lat, longitude: result.coords.lng });
      console.log(`✓ #${facility.record_number} ${facility.name.slice(0,40)} → ${result.coords.lat}, ${result.coords.lng}`);
      resolved++;
    } else {
      results.push({ ...facility, latitude: null, longitude: null });
      console.log(`✗ #${facility.record_number} ${facility.name.slice(0,40)} → FAILED (${result.error ?? "no coords in redirect chain"})`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n=== Results: ${resolved} resolved, ${failed} failed ===\n`);

  // Update Supabase for all resolved facilities
  const toUpdate = results.filter(r => r.latitude && r.longitude);
  console.log(`Updating ${toUpdate.length} facilities in Supabase...`);

  for (const facility of toUpdate) {
    const { error } = await supabase
      .from("facilities")
      .update({
        latitude: facility.latitude,
        longitude: facility.longitude,
        maps_link: facility.google_maps,
      })
      .eq("record_number", facility.record_number);

    if (error) {
      console.log(`  ✗ DB update failed for #${facility.record_number}: ${error.message}`);
    } else {
      console.log(`  ✓ Updated #${facility.record_number} ${facility.name.slice(0,40)}`);
    }
  }

  console.log("\nDone! Run the nearby page to verify improved distance accuracy.");
}

main().catch(console.error);
