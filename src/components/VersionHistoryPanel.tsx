'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

export interface VersionListItem {
  id: string;
  version_number: number;
  created_at: string;
  word_count: number;
  markdown_snapshot: string;
}

interface Props {
  pieceId: string;
  onClose: () => void;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function VersionHistoryPanel({ pieceId, onClose }: Props) {
  const { t } = useTranslation();
  const [versions, setVersions] = useState<VersionListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pieces/${pieceId}/versions`);
        if (!res.ok) {
          const body = await res.json();
          if (!cancelled) setLoadError(body.error ?? t('forkPanel.networkError'));
          return;
        }
        const body = await res.json();
        if (!cancelled) setVersions(body.versions ?? []);
      } catch {
        if (!cancelled) setLoadError(t('forkPanel.networkError'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pieceId, t]);

  const handleRestore = async (versionId: string) => {
    setRestoring(true);
    setRestoreError(null);
    try {
      const res = await fetch(`/api/pieces/${pieceId}/versions/${versionId}/restore`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json();
        setRestoreError(body.error ?? t('forkPanel.networkError'));
        setRestoring(false);
        return;
      }
      window.location.reload();
    } catch {
      setRestoreError(t('forkPanel.networkError'));
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end" role="dialog" aria-label={t('versions.title')} aria-modal="true">
      <div className="absolute inset-0 bg-pale-slate-900/40" onClick={onClose} />

      <aside className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full">
        <header className="flex items-center justify-between px-5 py-4 border-b border-pale-slate-200">
          <h2 className="text-base font-semibold text-pale-slate-800">{t('versions.title')}</h2>
          <button
            onClick={onClose}
            aria-label={t('versions.close')}
            className="text-pale-slate-400 hover:text-pale-slate-600 text-lg leading-none"
          >
            ✕
          </button>
        </header>

        {restoreError && (
          <div className="mx-5 mt-3 rounded-lg bg-ruby-red-100 text-ruby-red-700 px-3 py-2 text-sm">
            {restoreError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loadError && <p className="px-5 py-4 text-sm text-ruby-red-600">{loadError}</p>}

          {!loadError && versions === null && (
            <p className="px-5 py-4 text-sm text-pale-slate-400">{t('versions.loading')}</p>
          )}

          {versions !== null && versions.length === 0 && (
            <p className="px-5 py-4 text-sm text-pale-slate-400">{t('versions.noVersions')}</p>
          )}

          {versions !== null && versions.length > 0 && (
            <ul className="divide-y divide-pale-slate-100">
              {versions.map((v) => {
                const isSelected = v.id === selectedId;
                const isConfirming = confirmingId === v.id;

                return (
                  <li key={v.id} className="px-5 py-3">
                    <button
                      onClick={() => setSelectedId(isSelected ? null : v.id)}
                      className="w-full text-left"
                      aria-expanded={isSelected}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-pale-slate-800">
                          {t('versions.version', { n: v.version_number })}
                        </span>
                        <span className="text-xs text-pale-slate-400">
                          {t('editor.wordsCount', { count: v.word_count })}
                        </span>
                      </div>
                      <p className="text-xs text-pale-slate-500 mt-0.5">{formatTimestamp(v.created_at)}</p>
                    </button>

                    {isSelected && (
                      <div className="mt-3 space-y-3">
                        <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-pale-slate-50 border border-pale-slate-200 p-3 text-xs text-pale-slate-600 leading-relaxed">
                          {v.markdown_snapshot}
                        </pre>

                        {isConfirming ? (
                          <div className="rounded-lg border border-ruby-red-200 bg-ruby-red-50 p-3 space-y-2">
                            <p className="text-xs text-ruby-red-700">
                              {t('versions.restoreWarning')}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRestore(v.id)}
                                disabled={restoring}
                                className="px-3 py-1.5 rounded-lg bg-ruby-red-600 text-white text-xs font-medium hover:bg-ruby-red-700 disabled:opacity-50"
                              >
                                {restoring ? t('versions.restoring') : t('versions.yesRestore')}
                              </button>
                              <button
                                onClick={() => setConfirmingId(null)}
                                disabled={restoring}
                                className="px-3 py-1.5 rounded-lg bg-white border border-pale-slate-200 text-pale-slate-600 text-xs font-medium hover:bg-pale-slate-50 disabled:opacity-50"
                              >
                                {t('versions.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(v.id)}
                            className="px-3 py-1.5 rounded-lg border border-air-force-blue-300 text-air-force-blue-600 text-xs font-medium hover:bg-air-force-blue-50 hover:border-air-force-blue-400 transition-colors"
                          >
                            {t('versions.restore')}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
