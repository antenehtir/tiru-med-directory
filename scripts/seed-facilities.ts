import { createClient } from "@supabase/supabase-js";
import { realFacilityProfiles, realFacilities } from "../src/data/real-facility-profiles";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Node 20 has no native WebSocket; polyfill so the Supabase realtime init
// doesn't crash. The seed script never actually uses realtime.
if (!globalThis.WebSocket) {
  // @ts-ignore
  globalThis.WebSocket = class {
    constructor() {}
    send() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  };
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

function splitPhones(phone: string): [string | null, string | null] {
  const parts = phone.split(/[\/|,;]/).map((p) => p.trim()).filter(Boolean);
  return [parts[0] ?? null, parts[1] ?? null];
}

function splitList(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

async function seed() {
  console.log(`Seeding ${realFacilityProfiles.length} facilities...`);

  // realFacilityProfiles and realFacilities share the same index order
  const rows = realFacilityProfiles.map((profile, i) => {
    const facility = realFacilities[i]!;
    const [phone, phone2] = splitPhones(profile.phone);
    const services = [
      ...splitList(profile.specialty_or_services),
      ...splitList(profile.special_services),
    ];
    const uniqueServices = Array.from(new Set(services));
    const location = [profile.area, profile.sub_city].filter(Boolean).join(", ")
      || profile.address
      || null;

    return {
      slug:                profile.slug,
      name:                profile.name,
      category:            profile.category,
      subcategory:         profile.specialty_or_services || null,
      sub_city:            profile.sub_city || null,
      area:                profile.area || null,
      location,
      phone:               phone,
      phone_2:             phone2,
      email:               profile.email || null,
      website:             profile.website || null,
      maps_link:           profile.google_maps || null,
      working_hours:       profile.hours || null,
      emergency_service:   false,
      services:            uniqueServices.length > 0 ? uniqueServices : [profile.category],
      special_services:    splitList(profile.special_services),
      logo_url:            null,
      photo_url:           null,
      booking_link:        profile.booking || null,
      instagram:           profile.instagram || null,
      facebook:            profile.facebook || null,
      telegram:            profile.telegram || null,
      latitude:            facility.latitude ?? null,
      longitude:           facility.longitude ?? null,
      verification_status: "community-submitted",
      record_number:       profile.record_number,
    };
  });

  const { error } = await supabase
    .from("facilities")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`✓ Seeded ${rows.length} facilities successfully.`);
}

seed();
