"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useTransition } from "react";
import { updateFacilityLocation } from "@/app/admin/(protected)/facilities/[id]/edit/actions";
import { ADDIS_SUB_CITIES } from "@/lib/provider/onboarding-config";
import { BranchRepeater, hasBranchContent } from "@/components/provider/branch-repeater";
import type { FacilityBranch } from "@/types/facility";

// Leaflet touches window on import, so the picker cannot render on the
// server. Same dynamic/ssr:false treatment Step2LocationForm gives it.
const MapPinPicker = dynamic(
  () => import("@/components/provider/MapPinPicker").then((m) => m.MapPinPicker),
  { ssr: false },
);

type Facility = Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function num(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export function AdminFacilityLocationEditor({ facility }: { facility: Facility }) {
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [lat, setLat] = useState<number | null>(num(facility.latitude));
  const [lng, setLng] = useState<number | null>(num(facility.longitude));
  const [mapsLink, setMapsLink] = useState(str(facility.maps_link));
  const [subCity, setSubCity] = useState(str(facility.sub_city));
  const [area, setArea] = useState(str(facility.area));
  const [branches, setBranches] = useState<FacilityBranch[]>(
    Array.isArray(facility.branches) ? (facility.branches as FacilityBranch[]) : [],
  );

  // State rather than a ref: this baseline is rendered ("Stored now") and
  // drives the unsaved-changes indicator, so it is render-relevant data.
  // Holding it in a ref meant reading ref.current during render, which is
  // exactly what react-hooks/refs forbids — the value is not tracked, so a
  // render triggered by anything else could show a stale baseline. The other
  // two sections keep a ref legitimately: they only read it inside handleSave.
  const [baseline, setBaseline] = useState({
    latitude: num(facility.latitude),
    longitude: num(facility.longitude),
    maps_link: str(facility.maps_link) || null,
    sub_city: str(facility.sub_city) || null,
    area: str(facility.area) || null,
    branches: Array.isArray(facility.branches) ? (facility.branches as FacilityBranch[]) : [],
  });

  // Only 1 of 106 live sub_city values is an exact member of
  // ADDIS_SUB_CITIES: 86 differ by case alone ("bole" vs "Bole") and 19 are
  // absent outright — "kolfe", "online", "sheger city", and compound values
  // like "lideta / arada" for facilities whose branches span two sub-cities.
  // A select over the canonical list alone would therefore render empty for
  // almost every facility and quietly flatten those compounds on save. The
  // stored value is kept verbatim as its own option instead, so the control
  // shows what is actually live and only changes when an admin picks
  // something else.
  const storedSubCity = str(facility.sub_city);
  const isCanonical = (ADDIS_SUB_CITIES as readonly string[]).includes(storedSubCity);
  const options = isCanonical || !storedSubCity
    ? [...ADDIS_SUB_CITIES]
    : [storedSubCity, ...ADDIS_SUB_CITIES];

  const handleMapChange = useCallback((newLat: number, newLng: number, linkFromPicker?: string) => {
    setLat(newLat);
    setLng(newLng);
    setMapsLink(linkFromPicker ?? `https://www.google.com/maps?q=${newLat},${newLng}`);
  }, []);

  function handleSave() {
    setError(null);
    const before = baseline;
    const fields: Record<string, unknown> = {};

    // Sent as a pair or not at all — the action rejects a half-move, and a
    // row with one coordinate cannot be placed on a map anyway.
    if (lat !== before.latitude || lng !== before.longitude) {
      if (lat === null || lng === null) {
        setError("Set a location on the map before saving.");
        return;
      }
      fields.latitude = lat;
      fields.longitude = lng;
      if ((mapsLink || null) !== before.maps_link) fields.maps_link = mapsLink || null;
    }
    if ((subCity || null) !== before.sub_city) fields.sub_city = subCity || null;
    if ((area || null) !== before.area) fields.area = area || null;
    // Only branches with something in them are written; blank blocks stay on
    // screen to type into but never reach the database. branch_count is not
    // sent — the action derives it from this array's length.
    const keptBranches = branches.filter(hasBranchContent);
    if (JSON.stringify(keptBranches) !== JSON.stringify(before.branches)) {
      fields.branches = keptBranches;
    }

    if (Object.keys(fields).length === 0) {
      setError("Nothing to save — no changes were made in this section.");
      return;
    }

    startTransition(async () => {
      try {
        await updateFacilityLocation(facility.id as string, fields);
        setBaseline({
          latitude: lat,
          longitude: lng,
          maps_link: mapsLink || null,
          sub_city: subCity || null,
          area: area || null,
          branches: branches.filter(hasBranchContent),
        });
        setSavedAt(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save.");
      }
    });
  }

  const moved = lat !== baseline.latitude || lng !== baseline.longitude;
  const subCityChanged = (subCity || null) !== baseline.sub_city;
  const areaChanged = (area || null) !== baseline.area;
  const branchesChanged =
    JSON.stringify(branches.filter(hasBranchContent)) !== JSON.stringify(baseline.branches);
  // Staged-but-unsaved is easy to miss here in a way it is not in the other
  // two sections: the picker has its own "Location confirmed" state, which
  // reads as done even though nothing has been written yet.
  const isDirty = moved || subCityChanged || areaChanged || branchesChanged;

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold text-foreground">Map location</h2>
            <p className="text-sm text-muted-foreground">
              Paste the facility&apos;s Google Maps link to place its pin. Short
              maps.app.goo.gl links are resolved automatically.
            </p>
          </div>
          {savedAt && !isPending && (
            <span className="text-xs text-muted-foreground">
              Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>


        <div className="mb-4 grid gap-2 rounded-lg border border-border bg-background p-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Stored now</span>
            <p className="font-medium text-foreground">
              {baseline.latitude === null || baseline.longitude === null
                ? "No coordinates"
                : `${baseline.latitude}, ${baseline.longitude}`}
            </p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">After this edit</span>
            <p className={`font-medium ${moved ? "text-primary" : "text-muted-foreground"}`}>
              {lat === null || lng === null ? "No coordinates" : `${lat}, ${lng}`}
              {moved ? " (unsaved)" : ""}
            </p>
          </div>
        </div>

        {/* No GPS option in admin. "I am at the facility right now" reads the
            browser's own location, so from this desk it pins the facility to
            this desk. A warning next to the button used to stand here; not
            rendering the button is the stronger version of that warning. */}
        <MapPinPicker
          initialLat={lat}
          initialLng={lng}
          initialMapsLink={mapsLink}
          onChange={handleMapChange}
          showGeolocation={false}
          showHeading={false}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">Sub-city & area</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          How this facility is described in listings and filters.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="admin_sub_city">
              Sub-city
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="admin_sub_city"
              onChange={(e) => setSubCity(e.target.value)}
              value={subCity}
            >
              <option value="">Select…</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                  {option === storedSubCity && !isCanonical ? "  (current value)" : ""}
                </option>
              ))}
            </select>
            {!isCanonical && storedSubCity ? (
              <p className="text-xs text-muted-foreground">
                &ldquo;{storedSubCity}&rdquo; is not one of the standard sub-cities. It is kept as
                an option so saving does not overwrite it; pick a standard value only if
                that is genuinely more accurate.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="admin_area">
              Area / neighborhood
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="admin_area"
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Bole Medhanialem"
              type="text"
              value={area}
            />
            <p className="text-xs text-muted-foreground">
              The neighborhood patients would recognize.
            </p>
          </div>
        </div>
      </div>

      <BranchRepeater
        description={
          branches.length === 0
            ? "This facility is listed at one location. Add a branch if it operates from more than one site."
            : `${branches.length + 1} sites in total — this listing plus ${branches.length} ${branches.length === 1 ? "branch" : "branches"}.`
        }
        heading="Branches"
        onChange={setBranches}
        renderCoordinateEditor={(branch, index, setCoordinates) => (
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Branch location {branch.latitude != null ? "" : "— not pinned yet"}
            </p>
            <MapPinPicker
              initialLat={branch.latitude}
              initialLng={branch.longitude}
              initialMapsLink={branch.maps_link}
              key={`branch-map-${index}`}
              onChange={setCoordinates}
              showGeolocation={false}
              showHeading={false}
            />
          </div>
        )}
        value={branches}
      />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      {isDirty && !isPending ? (
        <p
          className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
          role="status"
        >
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-amber-500" />
          Unsaved changes:{" "}
          {[
            moved ? "map location" : null,
            subCityChanged ? "sub-city" : null,
            areaChanged ? "area" : null,
            branchesChanged ? "branches" : null,
          ]
            .filter(Boolean)
            .join(", ")}
          . Press Save Location to write them.
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        {isDirty && !isPending ? (
          <span className="text-sm text-muted-foreground">Not saved yet</span>
        ) : null}
        <button
          className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            isDirty
              ? "bg-primary text-primary-foreground ring-2 ring-amber-400 ring-offset-2 ring-offset-background hover:bg-primary-hover"
              : "bg-primary/40 text-primary-foreground"
          }`}
          disabled={isPending || !isDirty}
          onClick={handleSave}
          type="button"
        >
          {isPending ? "Saving…" : isDirty ? "Save Location •" : "Saved — no changes"}
        </button>
      </div>
    </div>
  );
}
