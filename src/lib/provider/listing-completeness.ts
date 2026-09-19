// How complete a live listing is, measured on the public facilities row.
//
// calculateCompletion() scores the onboarding draft (facility_claims), which
// stops changing once a listing is approved — so a verified provider had no
// percentage at all. This scores what patients actually see, and says which
// editor section fills each missing piece.

type Facility = Record<string, unknown>;

export type CompletenessItem = {
  key: string;
  label: string;
  weight: number;
  done: boolean;
  // ?section= on /provider/listing that edits this item.
  section: string;
};

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}

function hasItems(value: unknown): boolean {
  return Array.isArray(value) && value.some((v) => v !== null && v !== "");
}

export function listingCompletenessItems(facility: Facility): CompletenessItem[] {
  const items: CompletenessItem[] = [
    {
      key: "phone",
      label: "Phone number",
      weight: 12,
      done: hasText(facility.phone) || hasItems(facility.phones),
      section: "contact",
    },
    {
      key: "area",
      label: "Area or landmark patients recognise",
      weight: 10,
      done: hasText(facility.sub_city) && hasText(facility.area),
      section: "location",
    },
    {
      key: "map",
      label: "Map pin",
      weight: 10,
      done:
        (typeof facility.latitude === "number" && typeof facility.longitude === "number") ||
        hasText(facility.maps_link),
      section: "location",
    },
    {
      key: "services",
      label: "Services offered",
      weight: 14,
      done: hasItems(facility.services),
      section: "services",
    },
    {
      key: "hours",
      label: "Working hours",
      weight: 10,
      done:
        facility.category === "Ambulance Service" ||
        hasText(facility.working_hours) ||
        (facility.schedule !== null && facility.schedule !== undefined),
      section: "services",
    },
    {
      key: "payment",
      label: "Payment methods",
      weight: 5,
      done: hasItems(facility.payment_methods),
      section: "services",
    },
    {
      key: "photos",
      label: "At least one photo",
      weight: 14,
      done: hasItems(facility.photo_urls) || hasText(facility.photo_url),
      section: "photos",
    },
    {
      key: "description",
      label: "Short description",
      weight: 8,
      done: hasText(facility.description),
      section: "about",
    },
    {
      key: "languages",
      label: "Languages spoken",
      weight: 4,
      done: hasItems(facility.languages),
      section: "about",
    },
    {
      key: "patients",
      label: "Patients served",
      weight: 4,
      done: hasItems(facility.patient_groups),
      section: "about",
    },
  ];

  // Pharmacies have no Doctors section, so it is never asked of them.
  if (facility.category !== "Pharmacy") {
    items.push({
      key: "doctors",
      label: "At least one doctor",
      weight: 9,
      done:
        Array.isArray(facility.doctors) &&
        (facility.doctors as Array<Record<string, unknown>>).some((d) => hasText(d?.full_name)),
      section: "doctors",
    });
  }

  return items;
}

export function listingCompletenessPct(facility: Facility): number {
  const items = listingCompletenessItems(facility);
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const earned = items.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  return total === 0 ? 0 : Math.round((earned / total) * 100);
}
