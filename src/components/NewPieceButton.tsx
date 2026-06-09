'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';

export default function NewPieceButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pieces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        const piece = await res.json();
        router.push(`/pieces/${piece.id}/edit`);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Error ${res.status}`);
      }
    } catch {
      setError(t('forkPanel.networkError'));
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-6 py-3 rounded-xl bg-ruby-red-600 text-white font-semibold hover:bg-ruby-red-700 transition-colors shadow-sm"
      >
        {t('newPiece.button')}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {error && (
        <p className="text-ruby-red-600 text-sm">{error}</p>
      )}
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCreate();
          if (e.key === 'Escape') { setShowForm(false); setTitle(''); }
        }}
        placeholder={t('newPiece.placeholder')}
        className="w-full px-4 py-2 rounded-lg border border-pale-slate-300 focus:outline-none focus:border-air-force-blue-400 text-pale-slate-800"
        aria-label={t('newPiece.placeholder')}
      />
      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={loading || !title.trim()}
          className="flex-1 px-4 py-2 bg-ruby-red-600 text-white rounded-lg font-medium hover:bg-ruby-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? t('newPiece.creating') : t('newPiece.create')}
        </button>
        <button
          onClick={() => { setShowForm(false); setTitle(''); }}
          className="px-4 py-2 bg-pale-slate-100 text-pale-slate-600 rounded-lg hover:bg-pale-slate-200 transition-colors"
        >
          {t('newPiece.cancel')}
        </button>
      </div>
    </div>
  );
}
