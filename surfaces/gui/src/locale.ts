// Locale (UI language): English / Chinese. Persistence mirrors theme.ts exactly —
// localStorage + a window CustomEvent for cross-component sync. The very first run
// auto-detects from navigator.language; VITE_DEFAULT_LOCALE overrides that (used by
// the e2e suite to force English regardless of host/browser locale).
import { useEffect, useState } from "react";

export type Lang = "en" | "zh";

const KEY = "openwork-locale";
const PREF_EVENT = "openwork:locale-pref";

function detectLang(): Lang {
  // Cast: VITE_DEFAULT_LOCALE is a build-time override (e2e sets it to "en"); it isn't
  // part of vite's built-in ImportMetaEnv type, so cast rather than augment the global.
  const env = import.meta.env as unknown as { VITE_DEFAULT_LOCALE?: string };
  if (env.VITE_DEFAULT_LOCALE === "en" || env.VITE_DEFAULT_LOCALE === "zh") {
    return env.VITE_DEFAULT_LOCALE;
  }
  try {
    return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
  } catch {
    return "en";
  }
}

/** The stored preference, or null when none has been set (first run → auto-detect). */
export function getLocalePref(): Lang | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "en" || v === "zh" ? v : null;
  } catch {
    return null;
  }
}

/** The language actually in effect: stored pref, else env override, else detected. */
export function getEffectiveLang(): Lang {
  return getLocalePref() ?? detectLang();
}

function apply(lang: Lang) {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
}

export function setLocalePref(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* private mode etc. — still applies for this session */
  }
  apply(lang);
  window.dispatchEvent(new CustomEvent(PREF_EVENT));
}

/** Call once at startup: applies the effective lang (stored, env-overridden, or detected). */
export function initLocale() {
  apply(getEffectiveLang());
}

/** The settings control's hook — stays in sync if the pref changes elsewhere. */
export function useLocalePref(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(getEffectiveLang);
  useEffect(() => {
    const sync = () => setLang(getEffectiveLang());
    window.addEventListener(PREF_EVENT, sync);
    return () => window.removeEventListener(PREF_EVENT, sync);
  }, []);
  return [lang, setLocalePref];
}
