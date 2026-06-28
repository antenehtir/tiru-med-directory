"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useTransition } from "react";
import { saveStep2, autoSaveStep2 } from "@/app/provider/onboarding/location/actions";
import { ADDIS_SUB_CITIES } from "@/lib/provider/onboarding-config";

const MapPinPicker = dynamic(
  () => import("@/components/provider/MapPinPicker").then((m) => m.MapPinPicker),
  { ssr: false },
);

type Claim = Record<string, unknown>;

type Branch = {
  name: string;
  area: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  maps_link: string;
};

export function Step2LocationForm({ claim }: { claim: Claim }) {
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [subCity, setSubCity] = useState((claim.proposed_sub_city as string) ?? "");
  const [area, setArea] = useState((claim.proposed_area as string) ?? "");
  const [landmark, setLandmark] = useState((claim.proposed_landmark as string) ?? "");
  const [buildingDesc, setBuildingDesc] = useState((claim.proposed_building_desc as string) ?? "");
  const [accessNotes, setAccessNotes] = useState((claim.proposed_access_notes as string) ?? "");
  const [mapsLink, setMapsLink] = useState((claim.proposed_maps_link as string) ?? "");
  const [lat, setLat] = useState<number | null>((claim.proposed_latitude as number) ?? null);
  const [lng, setLng] = useState<number | null>((claim.proposed_longitude as number) ?? null);

  const [phone, setPhone] = useState((claim.proposed_phone as string) ?? "");
  const [phone2, setPhone2] = useState((claim.proposed_phone_2 as string) ?? "");
  const [whatsapp, setWhatsapp] = useState((claim.proposed_whatsapp as string) ?? "");
  const [telegram, setTelegram] = useState((claim.proposed_telegram as string) ?? "");
  const [email, setEmail] = useState((claim.proposed_email as string) ?? "");
  const [website, setWebsite] = useState((claim.proposed_website as string) ?? "");
  const [bookingLink, setBookingLink] = useState((claim.proposed_booking_link as string) ?? "");

  const branchCount = (claim.proposed_branch_count as number) ?? 1;
  const [branches, setBranches] = useState<Branch[]>(
    (claim.proposed_branches as Branch[]) ?? [],
  );

  // Pre-populate empty branch blocks for fixed counts (2-6) so they appear
  // immediately, without waiting for the user to click "Add branch".
  // Unbounded counts (99) start empty since there's no fixed number to fill.
  useEffect(() => {
    if (branchCount > 1 && branchCount !== 99 && branches.length === 0) {
      const initial = Array.from({ length: branchCount - 1 }, () => ({
        name: "",
        area: "",
        landmark: "",
        latitude: null,
        longitude: null,
        maps_link: "",
      }));
      setBranches(initial);
      autoSave({ branches: initial });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function autoSave(partial: Parameters<typeof autoSaveStep2>[0]) {
    startTransition(async () => {
      await autoSaveStep2(partial);
      setLastSaved(new Date());
    });
  }

  const handleMapChange = useCallback(
    (newLat: number, newLng: number, fromCurrentLocation?: boolean) => {
      setLat(newLat);
      setLng(newLng);
      // Auto-generate a Google Maps link from the pin
      const generatedLink = `https://www.google.com/maps?q=${newLat},${newLng}`;
      setMapsLink(generatedLink);
      autoSave({ lat: newLat, lng: newLng, maps_link: generatedLink });
      if (fromCurrentLocation) {
        // soft note could be shown; data already saved
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function updateBranch(index: number, partial: Partial<Branch>) {
    const next = [...branches];
    next[index] = { ...next[index], ...partial };
    setBranches(next);
    autoSave({ branches: next });
  }

  function addBranch() {
    const next = [
      ...branches,
      { name: "", area: "", landmark: "", latitude: null, longitude: null, maps_link: "" },
    ];
    setBranches(next);
    autoSave({ branches: next });
  }

  function useBranchLocation(index: number) {
    if (!("geolocation" in navigator)) return;

    const confirmed = window.confirm(
      "Only use this if you are physically standing at this branch's entrance right now. Continue?",
    );
    if (!confirmed) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateBranch(index, {
          latitude,
          longitude,
          maps_link: `https://www.google.com/maps?q=${latitude},${longitude}`,
        });
      },
      () => {
        alert("Could not get location. Please paste a Google Maps link instead.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }

  function field(
    value: string,
    setValue: (v: string) => void,
    dbKey: Parameters<typeof autoSaveStep2>[0],
  ) {
    return {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
      onBlur: () => autoSave(dbKey),
    };
  }

  return (
    <form action={saveStep2} className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold text-foreground">Location & Contact</h2>
            <p className="text-sm text-muted-foreground">
              Help patients find you. Fields marked * are required.
            </p>
          </div>
          {lastSaved && (
            <p className="shrink-0 text-xs text-muted-foreground">
              Draft saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {/* Sub-city */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="sub_city">
              Sub-city *
            </label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="sub_city"
              name="sub_city"
              onChange={(e) => {
                setSubCity(e.target.value);
                autoSave({ sub_city: e.target.value });
              }}
              required
              value={subCity}
            >
              <option value="">Select…</option>
              {ADDIS_SUB_CITIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="area">
              Area / neighborhood *
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="area"
              name="area"
              required
              type="text"
              {...field(area, setArea, { area })}
            />
            <p className="text-xs text-muted-foreground">
              The neighborhood patients would recognize, e.g. &quot;Bole Medhanialem&quot;
            </p>
          </div>

          {/* Landmark */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="landmark">
              Nearby landmark *
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="landmark"
              name="landmark"
              placeholder="e.g. Next to Bole Medhanialem Church"
              required
              type="text"
              {...field(landmark, setLandmark, { landmark })}
            />
            <p className="text-xs text-muted-foreground">
              A well-known nearby place, e.g. &quot;next to Edna Mall&quot;
            </p>
          </div>

          {/* Building description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="building_desc">
              Building description
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="building_desc"
              name="building_desc"
              placeholder="e.g. 3rd floor, blue gate"
              type="text"
              {...field(buildingDesc, setBuildingDesc, { building_desc: buildingDesc })}
            />
            <p className="text-xs text-muted-foreground">
              Floor, building color/name, where reception is
            </p>
          </div>

          {/* Access notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="access_notes">
              Access notes
            </label>
            <textarea
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="access_notes"
              name="access_notes"
              onBlur={() => autoSave({ access_notes: accessNotes })}
              onChange={(e) => setAccessNotes(e.target.value)}
              placeholder="Parking, entrance, accessibility..."
              rows={2}
              value={accessNotes}
            />
            <p className="text-xs text-muted-foreground">
              Parking, wheelchair access, elevator, entrance directions
            </p>
          </div>

          {/* Map pin */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Pin your location *</label>
            <MapPinPicker lat={lat} lng={lng} onChange={handleMapChange} />
            <input name="lat" type="hidden" value={lat ?? ""} />
            <input name="lng" type="hidden" value={lng ?? ""} />
          </div>

          {/* Maps link */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="maps_link">
              Google Maps link
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="maps_link"
              name="maps_link"
              onBlur={(e) => autoSave({ maps_link: e.target.value })}
              onChange={(e) => setMapsLink(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              type="url"
              value={mapsLink}
            />
          </div>
        </div>
      </div>

      {branchCount > 1 && (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Branch Locations
              </h2>
              <p className="text-sm text-muted-foreground">
                {branchCount === 99
                  ? "Add each branch location below"
                  : `Add details for your ${branchCount - 1} additional ${branchCount - 1 === 1 ? "branch" : "branches"}`}
              </p>
            </div>
            {(branchCount === 99 || branches.length < branchCount - 1) && (
              <button
                className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
                onClick={addBranch}
                type="button"
              >
                + Add branch
              </button>
            )}
          </div>

          <div className="space-y-6">
            {branches.map((branch, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Branch {i + 2}
                    {branch.name ? ` — ${branch.name}` : ""}
                  </p>
                  <button
                    className="text-xs text-red-500 hover:text-red-600"
                    onClick={() => {
                      const next = branches.filter((_, idx) => idx !== i);
                      setBranches(next);
                      autoSave({ branches: next });
                    }}
                    type="button"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Branch name or identifier
                    </label>
                    <input
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onBlur={(e) => updateBranch(i, { name: e.target.value })}
                      onChange={(e) => {
                        const next = [...branches];
                        next[i] = { ...next[i], name: e.target.value };
                        setBranches(next);
                      }}
                      placeholder="e.g. Bole Branch, Main Branch"
                      type="text"
                      value={branch.name}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Area / neighborhood *
                    </label>
                    <input
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onBlur={(e) => updateBranch(i, { area: e.target.value })}
                      onChange={(e) => {
                        const next = [...branches];
                        next[i] = { ...next[i], area: e.target.value };
                        setBranches(next);
                      }}
                      placeholder="e.g. Bole Medhanialem"
                      type="text"
                      value={branch.area}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Nearby landmark *
                    </label>
                    <input
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onBlur={(e) => updateBranch(i, { landmark: e.target.value })}
                      onChange={(e) => {
                        const next = [...branches];
                        next[i] = { ...next[i], landmark: e.target.value };
                        setBranches(next);
                      }}
                      placeholder="e.g. next to Edna Mall"
                      type="text"
                      value={branch.landmark}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Google Maps link
                    </label>
                    <input
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      onBlur={(e) => updateBranch(i, { maps_link: e.target.value })}
                      onChange={(e) => {
                        const next = [...branches];
                        next[i] = { ...next[i], maps_link: e.target.value };
                        setBranches(next);
                      }}
                      placeholder="https://maps.app.goo.gl/..."
                      type="url"
                      value={branch.maps_link}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste the Google Maps link for this branch entrance
                    </p>
                  </div>

                  <button
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    onClick={() => useBranchLocation(i)}
                    type="button"
                  >
                    📍{" "}
                    {branch.latitude != null && branch.longitude != null
                      ? "Pin captured — update location"
                      : "Use my current location for this branch"}
                  </button>
                </div>
              </div>
            ))}

            {branchCount !== 99 && branches.length < branchCount - 1 && (
              <p className="text-center text-sm text-muted-foreground">
                {branchCount - 1 - branches.length} more{" "}
                {branchCount - 1 - branches.length === 1 ? "branch" : "branches"} to add
              </p>
            )}

            {branchCount === 99 && branches.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Click &quot;+ Add branch&quot; to add your first additional branch
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-foreground">Contact details</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          How should patients reach you?
        </p>

        <div className="space-y-4">
          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="phone">
              Primary phone *
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="phone"
              name="phone"
              placeholder="+251 ..."
              required
              type="tel"
              {...field(phone, setPhone, { phone })}
            />
          </div>

          {/* Phone 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="phone_2">
              Secondary phone
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="phone_2"
              name="phone_2"
              placeholder="+251 ..."
              type="tel"
              {...field(phone2, setPhone2, { phone_2: phone2 })}
            />
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="whatsapp">
              WhatsApp
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="whatsapp"
              name="whatsapp"
              placeholder="+251 ..."
              type="tel"
              {...field(whatsapp, setWhatsapp, { whatsapp })}
            />
          </div>

          {/* Telegram */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="telegram">
              Telegram
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="telegram"
              name="telegram"
              placeholder="@username"
              type="text"
              {...field(telegram, setTelegram, { telegram })}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Public email
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="email"
              name="email"
              placeholder="info@facility.com"
              type="email"
              {...field(email, setEmail, { email })}
            />
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="website">
              Website
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="website"
              name="website"
              placeholder="https://..."
              type="url"
              {...field(website, setWebsite, { website })}
            />
          </div>

          {/* Booking link */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="booking_link">
              Online booking link
            </label>
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id="booking_link"
              name="booking_link"
              placeholder="https://..."
              type="url"
              {...field(bookingLink, setBookingLink, { booking_link: bookingLink })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <a
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/provider/onboarding/identity"
        >
          ← Back
        </a>
        <div className="flex items-center gap-3">
          {isPending && (
            <span className="text-xs text-muted-foreground">Saving…</span>
          )}
          <button
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            type="submit"
          >
            Save & continue →
          </button>
        </div>
      </div>
    </form>
  );
}
