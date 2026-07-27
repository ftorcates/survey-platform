"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "survey-platform-theme";
const THEME_CHANGE_EVENT = "survey-platform-theme-change";

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "dark"
  );
  const isLight = theme === "light";

  const toggleTheme = () => {
    const nextTheme: Theme = isLight ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
      title={isLight ? "Tema oscuro" : "Tema claro"}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb">
          {isLight ? <Sun size={15} /> : <Moon size={15} />}
        </span>
      </span>
      <span className="theme-toggle__label">{isLight ? "Mapa claro" : "Mapa noche"}</span>
    </button>
  );
}
