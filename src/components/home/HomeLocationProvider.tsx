"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Coordinates } from "@/lib/nearby-distance";
import { useGeolocation, type LocationState } from "@/lib/useGeolocation";

type HomeLocationValue = {
  locationState: LocationState;
  userLocation: Coordinates | null;
  requestLocation: () => void;
};

const HomeLocationContext = createContext<HomeLocationValue | null>(null);

// ONE geolocation subscription for the whole homepage.
//
// The homepage previously had two separate location affordances — "Find care
// near me" in the hero and one in the nearby section — which
// meant granting permission in one place left the other still prompting. A
// context rather than prop-drilling because the two consumers sit in
// different branches of the tree (hero vs. the nearby section further down),
// with server components in between.
//
// autoStart is false, preserving the opt-in behaviour introduced upstream:
// location is never requested on page load, only on an explicit user action.
export function HomeLocationProvider({ children }: { children: ReactNode }) {
  const value = useGeolocation(false);

  return (
    <HomeLocationContext.Provider value={value}>
      {children}
    </HomeLocationContext.Provider>
  );
}

export function useHomeLocation(): HomeLocationValue {
  const context = useContext(HomeLocationContext);
  if (!context) {
    throw new Error("useHomeLocation must be used inside HomeLocationProvider");
  }
  return context;
}
