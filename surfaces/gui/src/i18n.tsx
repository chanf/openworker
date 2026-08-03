// i18n: a tiny, dependency-free translation layer. Each domain owns a slice file under
// src/i18n/<domain>.ts (en + zh under a namespace); this module merges them and derives
// `Translations` from the merged English table, so a missing Chinese key fails tsc.
// Keys are dot-paths resolved at runtime (e.g. t("settings.language")); {{var}} interpolates.
// useI18n() degrades to an English `t` when used without a Provider, so component unit
// tests that render leaves directly keep working unchanged.
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalePref, type Lang } from "./locale";
import * as settings from "./i18n/settings";
import * as app from "./i18n/app";
import * as approval from "./i18n/approval";
import * as inbox from "./i18n/inbox";

const en = {
  ...settings.en,
  ...app.en,
  ...approval.en,
  ...inbox.en,
};

export type Translations = typeof en;

const zh: Translations = {
  ...settings.zh,
  ...app.zh,
  ...approval.zh,
  ...inbox.zh,
};

const DICTS: Record<Lang, Translations> = { en, zh };

function resolve(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => {
    if (o && typeof o === "object" && k in (o as Record<string, unknown>)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

export type TFn = (key: string, vars?: Record<string, string | number>) => string;

export function makeT(lang: Lang): TFn {
  const dict = DICTS[lang];
  return (key, vars) => {
    let s = resolve(dict, key);
    if (typeof s !== "string") s = resolve(en, key); // fallback to English
    if (typeof s !== "string") return key; // missing entirely → surface the key
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = (s as string).split(`{{${k}}}`).join(String(vars[k]));
      }
    }
    return s as string;
  };
}

export interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFn;
}

const Ctx = createContext<I18nValue | null>(null);

// Used when useI18n() is called outside a Provider (component unit tests). Keeps the
// rendered output identical to today's English UI, so existing assertions still pass.
const FALLBACK: I18nValue = { lang: "en", setLang: () => {}, t: makeT("en") };

export function useI18n(): I18nValue {
  return useContext(Ctx) ?? FALLBACK;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalePref();
  const t = useMemo(() => makeT(lang), [lang]);
  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
