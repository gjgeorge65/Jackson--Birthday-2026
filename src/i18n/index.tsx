import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { en } from './en';
import { sw } from './sw';

export type Lang = 'en' | 'sw';
export type Dict = typeof en;

const dicts: Record<Lang, Dict> = { en, sw };
const LANG_KEY = 'jb-lang-v1';

type T = (path: string, vars?: Record<string, string | number>) => string;

interface I18nCtx {
  lang: Lang;
  t: T;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<I18nCtx>({
  lang: 'en',
  t: (p: string) => p,
  setLang: () => undefined,
});

export const useI18n = () => useContext(Ctx);

function walk(obj: unknown, keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem(LANG_KEY);
      return s === 'sw' ? 'sw' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useCallback<T>(
    (path, vars) => {
      const keys = path.split('.');
      const val = (walk(dicts[lang], keys) ?? walk(dicts.en, keys) ?? path) as string;
      if (vars) {
        return Object.entries(vars).reduce(
          (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
          val
        );
      }
      return val;
    },
    [lang]
  );

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  return <Ctx.Provider value={{ lang, t, setLang }}>{children}</Ctx.Provider>;
}
