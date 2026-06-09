'use client';

import { type ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { Locale } from '@/lib/i18n';

interface Props {
  initialLocale: Locale;
  children: ReactNode;
}

export default function Providers({ initialLocale, children }: Props) {
  return <LanguageProvider initialLocale={initialLocale}>{children}</LanguageProvider>;
}
