"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

const ADDIS_ABABA_CENTER = { lat: 9.0192, lng: 38.7525 };

export function MapPinPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, fromCurrentLocation?: boolean) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const start = lat != null && lng != null ? { lat, lng } : ADDIS_ABABA_CENTER;

      map = L.map(mapRef.current).setView([start.lat, start.lng], 15);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([start.lat, start.lng], { icon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });
    });

    return () => {
      map?.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUseMyLocation() {
    if (!("geolocation" in navigator)) return;

    const confirmed = window.confirm(
      "Only use this if you are physically standing at your facility's entrance right now. Continue?",
    );
    if (!confirmed) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange(latitude, longitude, true);

        const map = mapInstanceRef.current;
        const marker = markerRef.current;
        if (map && marker) {
          marker.setLatLng([latitude, longitude]);
          map.setView([latitude, longitude], 16);
        }
        setLocating(false);
      },
      () => {
        // Geolocation denied or unavailable — leave the pin where it is.
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <strong>How to pin your location:</strong> Drag the blue marker to your
          facility&apos;s main entrance, or tap anywhere on the map to place it.
          Patients use this exact point for directions — accuracy matters.
        </p>
      </div>
      <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-xl border border-border" />
      <button
        className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
        disabled={locating}
        onClick={handleUseMyLocation}
        type="button"
      >
        📍 {locating ? "Locating…" : "Use my current location"}
      </button>
    </div>
  );
}
