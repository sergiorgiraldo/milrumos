import type { ExplorePiece } from '@/lib/explore';

interface Props {
  piece: ExplorePiece;
}

export default function PieceCard({ piece }: Props) {
  const date = piece.updated_at
    ? new Date(piece.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <a
      href={`/pieces/${piece.id}`}
      className="flex flex-col h-full bg-white rounded-xl border border-pale-slate-200 p-5 hover:border-air-force-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-pale-slate-900 truncate">{piece.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-pale-slate-500">
            <span className="font-medium text-pale-slate-700">{piece.author_name}</span>
            {date && <span>· {date}</span>}
          </div>
        </div>
        {piece.genre && (
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-ruby-red-100 text-ruby-red-700 text-xs font-medium">
            {piece.genre}
          </span>
        )}
      </div>

      {piece.excerpt && (
        <p className="mt-3 text-sm text-pale-slate-600 line-clamp-3 leading-relaxed">{piece.excerpt}</p>
      )}

      {piece.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {piece.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-sky-blue-100 text-sky-blue-700 text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-pale-slate-400">
        <span aria-hidden="true">⤷</span>
        <span>
          {piece.fork_count} fork{piece.fork_count !== 1 ? 's' : ''}
        </span>
      </div>
    </a>
  );
}
