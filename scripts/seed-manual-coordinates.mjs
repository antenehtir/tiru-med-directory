import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

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

const manualCoords = [
  { record_number: 1,   lat: 9.0054,  lng: 38.7900 },
  { record_number: 2,   lat: 8.9927,  lng: 38.7468 },
  { record_number: 3,   lat: 8.9956,  lng: 38.7598 },
  { record_number: 4,   lat: 9.0089,  lng: 38.7892 },
  { record_number: 5,   lat: 9.0142,  lng: 38.7401 },
  { record_number: 6,   lat: 9.0285,  lng: 38.7418 },
  { record_number: 7,   lat: 9.0198,  lng: 38.7634 },
  { record_number: 8,   lat: 9.0076,  lng: 38.7891 },
  { record_number: 9,   lat: 9.0081,  lng: 38.7887 },
  { record_number: 10,  lat: 9.0156,  lng: 38.8012 },
  { record_number: 11,  lat: 9.0102,  lng: 38.7978 },
  { record_number: 12,  lat: 9.0145,  lng: 38.7610 },
  { record_number: 13,  lat: 8.9750,  lng: 38.7200 },
  { record_number: 14,  lat: 9.0183,  lng: 38.7445 },
  { record_number: 15,  lat: 9.0260,  lng: 38.7520 },
  { record_number: 16,  lat: 9.0156,  lng: 38.8010 },
  { record_number: 17,  lat: 9.0480,  lng: 38.8420 },
  { record_number: 18,  lat: 9.0210,  lng: 38.7680 },
  { record_number: 19,  lat: 9.0320,  lng: 38.7050 },
  { record_number: 20,  lat: 9.0220,  lng: 38.8500 },
  { record_number: 21,  lat: 9.0150,  lng: 38.7430 },
  { record_number: 22,  lat: 9.0085,  lng: 38.7870 },
  { record_number: 24,  lat: 9.0235,  lng: 38.7475 },
  { record_number: 25,  lat: 9.0095,  lng: 38.8480 },
  { record_number: 26,  lat: 9.0481,  lng: 38.8175 },
  { record_number: 27,  lat: 9.0320,  lng: 38.8150 },
  { record_number: 28,  lat: 8.9850,  lng: 38.7600 },
  { record_number: 29,  lat: 9.0170,  lng: 38.7820 },
  { record_number: 30,  lat: 8.9980,  lng: 38.7550 },
  { record_number: 31,  lat: 9.0250,  lng: 38.7600 },
  { record_number: 32,  lat: 9.0050,  lng: 38.7480 },
  { record_number: 33,  lat: 9.0210,  lng: 38.7620 },
  { record_number: 34,  lat: 9.0480,  lng: 38.8180 },
  { record_number: 35,  lat: 9.0350,  lng: 38.7680 },
  { record_number: 36,  lat: 9.0180,  lng: 38.7640 },
  { record_number: 37,  lat: 9.0095,  lng: 38.7980 },
  { record_number: 38,  lat: 9.0210,  lng: 38.7780 },
  { record_number: 39,  lat: 9.0185,  lng: 38.7620 },
  { record_number: 40,  lat: 9.0390,  lng: 38.8200 },
  { record_number: 41,  lat: 9.0220,  lng: 38.7680 },
  { record_number: 42,  lat: 9.0320,  lng: 38.7500 },
  { record_number: 43,  lat: 9.0100,  lng: 38.7950 },
  { record_number: 44,  lat: 9.0200,  lng: 38.7380 },
  { record_number: 45,  lat: 9.0380,  lng: 38.8100 },
  { record_number: 46,  lat: 9.0320,  lng: 38.7980 },
  { record_number: 47,  lat: 9.0090,  lng: 38.7880 },
  { record_number: 48,  lat: 9.0280,  lng: 38.7950 },
  { record_number: 49,  lat: 9.0170,  lng: 38.7550 },
  { record_number: 50,  lat: 9.0185,  lng: 38.7550 },
  { record_number: 51,  lat: 9.0195,  lng: 38.7470 },
  { record_number: 52,  lat: 9.0340,  lng: 38.7970 },
  { record_number: 53,  lat: 9.0190,  lng: 38.7690 },
  { record_number: 54,  lat: 9.0340,  lng: 38.7980 },
  { record_number: 55,  lat: 9.0180,  lng: 38.7650 },
  { record_number: 56,  lat: 9.0170,  lng: 38.7800 },
  { record_number: 57,  lat: 9.0320,  lng: 38.7500 },
  { record_number: 58,  lat: 9.0080,  lng: 38.7920 },
  { record_number: 59,  lat: 9.0150,  lng: 38.7850 },
  { record_number: 60,  lat: 9.0300,  lng: 38.7870 },
  { record_number: 61,  lat: 9.0320,  lng: 38.7980 },
  { record_number: 62,  lat: 9.0380,  lng: 38.8100 },
  { record_number: 63,  lat: 9.0095,  lng: 38.8480 },
  { record_number: 64,  lat: 9.0280,  lng: 38.7470 },
  { record_number: 65,  lat: 9.0350,  lng: 38.7680 },
  { record_number: 66,  lat: 9.0220,  lng: 38.7750 },
  { record_number: 67,  lat: 9.0340,  lng: 38.7980 },
  { record_number: 68,  lat: 9.0340,  lng: 38.7980 },
  { record_number: 69,  lat: 9.0200,  lng: 38.7700 },
  { record_number: 70,  lat: 9.0320,  lng: 38.8050 },
  { record_number: 71,  lat: 9.0100,  lng: 38.7920 },
  { record_number: 72,  lat: 9.0065,  lng: 38.7880 },
  { record_number: 73,  lat: 9.0090,  lng: 38.7910 },
  { record_number: 74,  lat: 9.0150,  lng: 38.7610 },
  { record_number: 75,  lat: 9.0200,  lng: 38.7420 },
  { record_number: 76,  lat: 9.0150,  lng: 38.7780 },
  { record_number: 77,  lat: 9.0190,  lng: 38.7690 },
  { record_number: 78,  lat: 9.0250,  lng: 38.7660 },
  { record_number: 79,  lat: 9.0320,  lng: 38.7980 },
  { record_number: 80,  lat: 9.0350,  lng: 38.8100 },
  { record_number: 81,  lat: 9.0380,  lng: 38.8100 },
  { record_number: 82,  lat: 9.0210,  lng: 38.7600 },
  { record_number: 83,  lat: 9.0180,  lng: 38.7490 },
  { record_number: 84,  lat: 9.0085,  lng: 38.7940 },
  { record_number: 86,  lat: 9.0219,  lng: 38.8358 },
  { record_number: 87,  lat: 9.0180,  lng: 38.7620 },
  { record_number: 88,  lat: 9.0150,  lng: 38.7800 },
  { record_number: 89,  lat: 9.0180,  lng: 38.7620 },
  { record_number: 90,  lat: 9.0095,  lng: 38.7400 },
  { record_number: 91,  lat: 9.0095,  lng: 38.8480 },
  { record_number: 92,  lat: 9.0320,  lng: 38.7580 },
  { record_number: 93,  lat: 9.0210,  lng: 38.7680 },
  { record_number: 94,  lat: 9.0340,  lng: 38.7980 },
  { record_number: 95,  lat: 9.0090,  lng: 38.7880 },
  { record_number: 96,  lat: 9.0175,  lng: 38.8420 },
  { record_number: 97,  lat: 9.0220,  lng: 38.7950 },
  { record_number: 98,  lat: 9.0200,  lng: 38.7700 },
  { record_number: 99,  lat: 9.0290,  lng: 38.7940 },
  { record_number: 100, lat: 9.0480,  lng: 38.8180 },
  { record_number: 101, lat: 9.0340,  lng: 38.7980 },
  { record_number: 102, lat: 9.0095,  lng: 38.8480 },
  { record_number: 103, lat: 9.0280,  lng: 38.7940 },
  { record_number: 104, lat: 9.0340,  lng: 38.7960 },
  { record_number: 105, lat: 9.0350,  lng: 38.8100 },
];

// Record numbers genuinely resolved from real Google Maps share links by
// scripts/extract-and-seed-coordinates.mjs. Everything else in manualCoords
// below should overwrite unconditionally — comparing against the *previous*
// DB value to decide what's "precise" doesn't work, since the previous value
// for unresolved facilities was just an earlier rough estimate, not GPS data;
// two independent guesses will almost always differ by more than the
// distance threshold, so that check was silently preserving old guesses
// instead of writing the new, verified ones.
const PRECISE_GPS_RECORDS = new Set([
  1, 2, 5, 13, 15, 19, 23, 24, 29, 38, 50, 76, 85, 86,
  90, 91, 92, 93, 94, 95, 96, 97, 99, 100, 101, 102, 103, 104,
]);

async function main() {
  const preciseRecords = PRECISE_GPS_RECORDS;

  console.log(`Keeping ${preciseRecords.size} facilities with precise GPS from previous script.`);
  console.log(`Updating ${manualCoords.length - [...preciseRecords].filter(r => manualCoords.some(m => m.record_number === r)).length} with manual coords.\n`);

  let updated = 0;
  for (const coord of manualCoords) {
    if (preciseRecords.has(coord.record_number)) continue;
    const { error } = await supabase
      .from("facilities")
      .update({ latitude: coord.lat, longitude: coord.lng })
      .eq("record_number", coord.record_number);
    if (error) {
      console.log(`✗ #${coord.record_number}: ${error.message}`);
    } else {
      updated++;
    }
  }

  const { count } = await supabase
    .from("facilities")
    .select("*", { count: "exact", head: true })
    .not("latitude", "is", null);

  console.log(`\n✓ Updated ${updated} facilities.`);
  console.log(`Total with coordinates in DB: ${count}/105`);
}

main().catch(console.error);
