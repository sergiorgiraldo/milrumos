import en from '../locales/en.json';
import pt from '../locales/pt.json';

export type Locale = 'en' | 'pt';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'pt'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
};

export type Translations = typeof en;

const TRANSLATIONS: Record<Locale, Translations> = { en, pt };

export function getTranslations(locale: Locale): Translations {
  return TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
}

function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : key;
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

export function createT(translations: Translations): TFunction {
  return function t(key: string, vars?: Record<string, string | number>): string {
    const template = getNestedValue(translations as unknown as Record<string, unknown>, key);
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
  };
}

export async function getServerLocale(): Promise<Locale> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const value = cookieStore.get('locale')?.value;
  return (SUPPORTED_LOCALES.includes(value as Locale) ? value : DEFAULT_LOCALE) as Locale;
}

export async function getServerT(): Promise<{ t: TFunction; locale: Locale }> {
  const locale = await getServerLocale();
  const translations = getTranslations(locale);
  return { t: createT(translations), locale };
}
