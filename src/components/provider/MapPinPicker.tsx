"use client";

import { useEffect, useRef, useState } from "react";

type LocationOption = "none" | "gps" | "maps_link" | "confirmed";

type MapPinPickerProps = {
  initialLat?: number | null;
  initialLng?: number | null;
  initialMapsLink?: string;
  onChange: (lat: number, lng: number, mapsLink?: string) => void;
};

function ConfirmationMap({
  lat,
  lng,
  onConfirm,
  onRetry,
}: {
  lat: number;
  lng: number;
  onConfirm: () => void;
  onRetry: () => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!mounted || !mapContainerRef.current || mapRef.current) return;

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const map = L.map(mapContainerRef.current, {
        dragging: false,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      }).setView([lat, lng], 17);

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng], { icon }).addTo(map);
    }

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div className="space-y-3">
      <div
        className="h-52 w-full overflow-hidden rounded-xl border border-border"
        ref={mapContainerRef}
        style={{ zIndex: 0 }}
      />
      <p className="text-xs text-muted-foreground text-center">
        This is where patients will be directed. Does it look correct?
      </p>
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          onClick={onConfirm}
          type="button"
        >
          ✓ Yes, this is correct
        </button>
        <button
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function MapPinPicker({
  initialLat,
  initialLng,
  initialMapsLink,
  onChange,
}: MapPinPickerProps) {
  const hasInitial = !!(initialLat && initialLng);
  const [option, setOption] = useState<LocationOption>(
    hasInitial ? "confirmed" : "none",
  );
  const [pendingLat, setPendingLat] = useState<number | null>(null);
  const [pendingLng, setPendingLng] = useState<number | null>(null);
  const [confirmedLat, setConfirmedLat] = useState<number | null>(
    initialLat ?? null,
  );
  const [confirmedLng, setConfirmedLng] = useState<number | null>(
    initialLng ?? null,
  );
  const [mapsLinkInput, setMapsLinkInput] = useState(initialMapsLink ?? "");
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  function isValidAddisCoords(lat: number, lng: number) {
    return lat >= 8.7 && lat <= 9.3 && lng >= 38.5 && lng <= 39.0;
  }

  function handleGPS() {
    if (!("geolocation" in navigator)) {
      setGpsError("Your browser does not support location access.");
      return;
    }
    const confirmed = window.confirm(
      "Only use this if you are physically standing at your facility's main entrance right now. Continue?",
    );
    if (!confirmed) return;

    setLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!isValidAddisCoords(latitude, longitude)) {
          setGpsError(
            "Your location appears to be outside Addis Ababa. Please use a Google Maps link instead.",
          );
          setLocating(false);
          return;
        }
        setPendingLat(latitude);
        setPendingLng(longitude);
        setOption("gps");
        setLocating(false);
      },
      () => {
        setGpsError(
          "Could not access your location. Please check your browser permissions and try again.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }

  async function handleMapsLinkExtract() {
    setLinkError(null);
    if (!mapsLinkInput.trim()) return;

    setLocating(true);
    try {
      const res = await fetch("/api/provider/resolve-maps-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: mapsLinkInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setLinkError(
          data.error ??
            "Could not extract coordinates. Try copying the link directly from your facility's Google Maps page.",
        );
        return;
      }

      setPendingLat(data.lat);
      setPendingLng(data.lng);
      setOption("maps_link");
    } catch {
      setLinkError("Network error. Please check your connection and try again.");
    } finally {
      setLocating(false);
    }
  }

  function handleConfirm() {
    if (pendingLat && pendingLng) {
      setConfirmedLat(pendingLat);
      setConfirmedLng(pendingLng);
      setOption("confirmed");
      const mapsLink =
        option === "maps_link" && mapsLinkInput
          ? mapsLinkInput
          : `https://www.google.com/maps?q=${pendingLat},${pendingLng}`;
      onChange(pendingLat, pendingLng, mapsLink);
    }
  }

  function handleRetry() {
    setPendingLat(null);
    setPendingLng(null);
    setOption("none");
    setGpsError(null);
    setLinkError(null);
  }

  function handleChangeConfirmed() {
    setConfirmedLat(null);
    setConfirmedLng(null);
    setOption("none");
    setGpsError(null);
    setLinkError(null);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          Pin your facility location *
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Choose the method that works best for you
        </p>
      </div>

      {/* Already confirmed */}
      {option === "confirmed" && confirmedLat && confirmedLng && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950/30">
            <span className="text-teal-600">✓</span>
            <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
              Location confirmed
            </p>
            <button
              className="ml-auto text-xs text-teal-600 hover:underline"
              onClick={handleChangeConfirmed}
              type="button"
            >
              Change
            </button>
          </div>
          <ConfirmationMap
            lat={confirmedLat}
            lng={confirmedLng}
            onConfirm={() => {}}
            onRetry={handleChangeConfirmed}
          />
        </div>
      )}

      {/* Pending GPS confirmation */}
      {(option === "gps" || option === "maps_link") &&
        pendingLat &&
        pendingLng && (
          <ConfirmationMap
            lat={pendingLat}
            lng={pendingLng}
            onConfirm={handleConfirm}
            onRetry={handleRetry}
          />
        )}

      {/* Options — shown when no location yet */}
      {option === "none" && (
        <div className="space-y-3">
          {/* Option 1: GPS */}
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="mb-1 text-sm font-semibold text-foreground">
              Option 1 — I am at the facility right now
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Stand at the main entrance and tap the button below.
              We will capture your exact GPS location.
            </p>
            <button
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              disabled={locating}
              onClick={handleGPS}
              type="button"
            >
              {locating ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Getting your location...
                </>
              ) : (
                <>📍 Confirm I&apos;m at the entrance</>
              )}
            </button>
            {gpsError && (
              <p className="mt-2 text-xs text-red-500">{gpsError}</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Option 2: Google Maps link */}
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="mb-1 text-sm font-semibold text-foreground">
              Option 2 — Paste a Google Maps link
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Open Google Maps, search for your facility, tap Share →
              Copy link, then paste it here.
            </p>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setMapsLinkInput(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                type="url"
                value={mapsLinkInput}
              />
              <button
                className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                disabled={!mapsLinkInput.trim() || locating}
                onClick={handleMapsLinkExtract}
                type="button"
              >
                {locating ? (
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    Resolving...
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
            {linkError && (
              <p className="mt-2 text-xs text-red-500">{linkError}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              💡 Tip: In Google Maps, search your facility name,
              tap the share icon, then &quot;Copy link&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
