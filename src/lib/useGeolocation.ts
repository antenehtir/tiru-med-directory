"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinates } from "@/lib/nearby-distance";

export type LocationState =
  | "idle"
  | "loading"
  | "timeout"
  | "ready"
  | "denied"
  | "unsupported";

const LOCATION_TIMEOUT_MS = 8000;

// Extracted from NearbyPage.tsx unchanged (same watchPosition/permission/
// timeout logic, same 8s timeout, same 50m accuracy threshold to stop
// refining, same 20s hard watch cleanup) — was ~90 lines living only inside
// NearbyPage, which meant the homepage's "Near you" strip would otherwise
// have had to duplicate or subtly reinvent it. One geolocation
// implementation now, shared by both.
export function useGeolocation() {
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const hasRequestedLocationRef = useRef(false);
  const locationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationWatchRef = useRef<number | null>(null);

  const clearLocationTimeout = useCallback(() => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = null;
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationState("unsupported");
      return;
    }

    clearLocationTimeout();
    setLocationState("loading");
    locationTimeoutRef.current = setTimeout(() => {
      setLocationState((current) => (current === "loading" ? "timeout" : current));
    }, LOCATION_TIMEOUT_MS);

    let bestAccuracy = Infinity;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        clearLocationTimeout();

        // Only update if this reading is more accurate than the last
        if (position.coords.accuracy < bestAccuracy) {
          bestAccuracy = position.coords.accuracy;
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
        setLocationState("ready");

        // Once we have a good fix (under 50m), stop refining
        if (position.coords.accuracy <= 50) {
          navigator.geolocation.clearWatch(watchId);
        }
      },
      () => {
        clearLocationTimeout();
        setLocationState("denied");
        setUserLocation(null);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );

    locationWatchRef.current = watchId;
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, 20000);
  }, [clearLocationTimeout]);

  useEffect(() => {
    if (hasRequestedLocationRef.current) {
      return;
    }

    hasRequestedLocationRef.current = true;

    async function requestInitialLocation() {
      if (!("geolocation" in navigator)) {
        setLocationState("unsupported");
        return;
      }

      try {
        const permission = await navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        });

        if (permission?.state === "denied") {
          setLocationState("denied");
          return;
        }
      } catch {
        // Some browsers do not expose geolocation permission state before prompt.
      }

      requestLocation();
    }

    void requestInitialLocation();

    return () => {
      clearLocationTimeout();

      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, [clearLocationTimeout, requestLocation]);

  return { locationState, userLocation, requestLocation };
}
