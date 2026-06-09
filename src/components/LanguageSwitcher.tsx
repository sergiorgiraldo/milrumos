'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    setLocale(next);
    router.refresh();
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      aria-label="Language"
      className="text-sm text-pale-slate-600 bg-transparent border border-pale-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-air-force-blue-400 cursor-pointer hover:border-pale-slate-300 transition-colors"
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
