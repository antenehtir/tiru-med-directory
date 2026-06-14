"use client";

import { useEffect, useSyncExternalStore } from "react";

type ThemeName = "light" | "dark";

const STORAGE_KEY = "tiru-theme";
const THEME_CHANGE_EVENT = "tiru-theme-change";

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
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

  const nextThemeLabel = theme === "dark" ? "Light" : "Dark";

  return (
    <button
      type="button"
      className="flex h-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted sm:px-3"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextThemeLabel.toLowerCase()} mode`}
      suppressHydrationWarning
    >
      {nextThemeLabel}
    </button>
  );
}
