'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PieceSummary } from '@/lib/pieces';
import type { PieceStatus } from '@/lib/schema';

type Props = { pieces: PieceSummary[] };

function StatusBadge({ status }: { status: PieceStatus }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-blue-100 text-sky-blue-700">
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pale-slate-100 text-pale-slate-600">
      Draft
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DashboardTable({ pieces }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleStatus = async (id: string, current: PieceStatus) => {
    setLoadingId(id);
    await fetch(`/api/pieces/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: current === 'draft' ? 'published' : 'draft' }),
    });
    setLoadingId(null);
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    await fetch(`/api/pieces/${id}`, { method: 'DELETE' });
    setConfirmingId(null);
    setLoadingId(null);
    startTransition(() => router.refresh());
  };

  return (
    <div className={`overflow-x-auto rounded-xl border border-pale-slate-200 bg-white shadow-sm transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-pale-slate-200 bg-pale-slate-50 text-pale-slate-500 uppercase text-xs tracking-wide">
            <th className="px-5 py-3 text-left font-semibold">Title</th>
            <th className="px-5 py-3 text-left font-semibold">Status</th>
            <th className="px-5 py-3 text-left font-semibold">Last Modified</th>
            <th className="px-5 py-3 text-right font-semibold">Sections</th>
            <th className="px-5 py-3 text-right font-semibold">Words</th>
            <th className="px-5 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pale-slate-100">
          {pieces.map((piece) => (
            <tr key={piece.id} className="hover:bg-pale-slate-50 transition-colors">
              <td className="px-5 py-4 font-medium text-pale-slate-800">{piece.title}</td>
              <td className="px-5 py-4">
                <StatusBadge status={piece.status} />
              </td>
              <td className="px-5 py-4 text-pale-slate-500">{formatDate(piece.updated_at)}</td>
              <td className="px-5 py-4 text-right text-pale-slate-600">{piece.section_count}</td>
              <td className="px-5 py-4 text-right text-pale-slate-600">{piece.word_count.toLocaleString()}</td>
              <td className="px-5 py-4">
                <div className="flex gap-2 justify-end items-center">
                  {confirmingId === piece.id ? (
                    <>
                      <span className="text-pale-slate-400 text-xs">Delete?</span>
                      <button
                        onClick={() => handleDelete(piece.id)}
                        disabled={loadingId === piece.id}
                        className="px-3 py-1 rounded-lg bg-ruby-red-600 text-white text-xs font-medium hover:bg-ruby-red-700 disabled:opacity-50 transition-colors"
                      >
                        {loadingId === piece.id ? '…' : 'Yes, delete'}
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="px-3 py-1 rounded-lg bg-pale-slate-100 text-pale-slate-600 text-xs hover:bg-pale-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push(`/pieces/${piece.id}/edit`)}
                        className="px-3 py-1 rounded-lg bg-air-force-blue-100 text-air-force-blue-700 text-xs font-medium hover:bg-air-force-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(piece.id, piece.status)}
                        disabled={loadingId === piece.id}
                        className="px-3 py-1 rounded-lg bg-pale-slate-100 text-pale-slate-600 text-xs font-medium hover:bg-pale-slate-200 disabled:opacity-50 transition-colors"
                      >
                        {loadingId === piece.id ? '…' : piece.status === 'draft' ? 'Publish' : 'Unpublish'}
                      </button>
                      <button
                        onClick={() => setConfirmingId(piece.id)}
                        className="px-3 py-1 rounded-lg bg-ruby-red-50 text-ruby-red-600 text-xs font-medium hover:bg-ruby-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
