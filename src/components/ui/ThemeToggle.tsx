"use client";

import { useEffect, useSyncExternalStore } from "react";

type ThemeName = "light" | "dark";

const STORAGE_KEY = "tiru-theme";
const THEME_CHANGE_EVENT = "tiru-theme-change";

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
}

function readStoredTheme(): ThemeName {
  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    return storedTheme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function storeTheme(theme: ThemeName) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  } catch {
    // Theme persistence is a convenience; the toggle still works without it.
  }
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getThemeSnapshot() {
  return readStoredTheme();
}

function getServerThemeSnapshot(): ThemeName {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  }

  const Icon = theme === "dark" ? SunIcon : MoonIcon;

  return (
    <button
      type="button"
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 min-[380px]:size-10"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Icon />
    </button>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20.2 14.8A7.5 7.5 0 0 1 9.2 3.8 8.5 8.5 0 1 0 20.2 14.8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 4V2m0 20v-2m8-8h2M2 12h2m14.4-6.4 1.4-1.4M4.2 19.8l1.4-1.4m12.8 0 1.4 1.4M4.2 4.2l1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
