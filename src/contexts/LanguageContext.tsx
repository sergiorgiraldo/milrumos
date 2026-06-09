'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  type Locale,
  type TFunction,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getTranslations,
  createT,
} from '@/lib/i18n';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readCookieLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  const value = match?.[1];
  return (SUPPORTED_LOCALES.includes(value as Locale) ? value : DEFAULT_LOCALE) as Locale;
}

interface Props {
  initialLocale: Locale;
  children: ReactNode;
}

export function LanguageProvider({ initialLocale, children }: Props) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleState(next);
  }, []);

  const t = createT(getTranslations(locale));

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback for components rendered outside provider (e.g. tests)
    const locale = DEFAULT_LOCALE;
    const t = createT(getTranslations(locale));
    return { locale, setLocale: () => {}, t };
  }
  return ctx;
}

export { readCookieLocale };
