"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

/*
 * The current look lives on <html data-theme>, set before paint by THEME_BOOT_SCRIPT.
 * Components read it from there rather than holding their own copy, so the Settings
 * card and the account menu's switch can never disagree.
 */
const CHANGE_EVENT = "r2dashboard:theme-change";

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "glass" ? "glass" : "classic";
}

function subscribe(onChange: () => void) {
  // Another tab changing the look follows here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    document.documentElement.setAttribute(
      "data-theme",
      event.newValue === "glass" ? "glass" : "classic",
    );
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private browsing or storage disabled: the look still changes for this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  // The server always renders classic; the client snapshot takes over after hydration.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "classic" as const);
  return [theme, setTheme];
}
