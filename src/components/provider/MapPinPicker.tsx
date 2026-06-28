"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const ADDIS_ABABA_CENTER = { lat: 9.0192, lng: 38.7525 };

export function MapPinPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);

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

  function useMyLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange(latitude, longitude);

        const map = mapInstanceRef.current;
        const marker = markerRef.current;
        if (map && marker) {
          marker.setLatLng([latitude, longitude]);
          map.setView([latitude, longitude], 16);
        }
      },
      () => {
        // Geolocation denied or unavailable — leave the pin where it is.
      },
    );
  }

  return (
    <div className="space-y-2">
      <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-xl border border-border" />
      <button
        className="text-sm font-medium text-primary hover:underline"
        onClick={useMyLocation}
        type="button"
      >
        📍 Use my current location
      </button>
    </div>
  );
}
