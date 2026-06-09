'use client';

import type { LineageInfo } from '@/lib/lineage';
import { useTranslation } from '@/contexts/LanguageContext';

interface Props {
  lineage: LineageInfo | null;
}

export default function LineageBanner({ lineage }: Props) {
  const { t } = useTranslation();

  if (!lineage) return null;

  return (
    <div className="mb-6 flex items-start gap-2 rounded-lg border border-sky-blue-200 bg-sky-blue-50 px-4 py-3 text-sm text-sky-blue-700">
      <span className="mt-0.5 text-sky-blue-400">⤷</span>
      <span>
        {t('lineage.forkedFrom')}{' '}
        <a
          href={`/pieces/${lineage.parentPieceId}`}
          className="font-semibold underline hover:text-sky-blue-900"
        >
          {lineage.parentPieceTitle}
        </a>
        {' '}{t('lineage.by')} {lineage.parentAuthorName}
        {lineage.forkSectionTitle && (
          <span className="text-sky-blue-500"> · {t('lineage.startingFrom')} &ldquo;{lineage.forkSectionTitle}&rdquo;</span>
        )}
      </span>
    </div>
  );
}
