'use client';

import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '@/contexts/LanguageContext';

interface Props {
  rightContent?: React.ReactNode;
  searchDefaultValue?: string;
}

export default function NavBar({ rightContent, searchDefaultValue }: Props) {
  const { t } = useTranslation();

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-pale-slate-200 px-6 py-3 flex items-center gap-4">
      <a href="/" className="text-ruby-red-600 font-bold text-lg hover:text-ruby-red-700 shrink-0">
        Milrumos
      </a>

      <a
        href="/explore"
        className="text-sm font-medium text-pale-slate-600 hover:text-pale-slate-900 shrink-0"
      >
        {t('nav.explore')}
      </a>

      <form action="/search" method="GET" className="flex-1 max-w-md">
        <input
          name="q"
          defaultValue={searchDefaultValue ?? ''}
          placeholder={t('nav.searchPlaceholder')}
          className="w-full px-3 py-1.5 rounded-lg border border-pale-slate-200 text-sm bg-pale-slate-50 focus:outline-none focus:border-air-force-blue-400 focus:bg-white transition-colors"
          aria-label={t('nav.searchPlaceholder')}
        />
      </form>

      <LanguageSwitcher />

      {rightContent && <div className="ml-auto shrink-0 flex items-center gap-3">{rightContent}</div>}
    </nav>
  );
}
