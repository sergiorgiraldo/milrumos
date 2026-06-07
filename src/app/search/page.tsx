import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { searchPieces } from '@/lib/search';
import NavBar from '@/components/NavBar';
import { GENRES } from '@/lib/schema';

type Props = { searchParams: Promise<{ q?: string; genre?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', genre } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const result = q.trim() ? await searchPieces(supabase, q, genre ?? null) : null;
  const results = result?.data ?? [];
  const hasQuery = q.trim().length > 0;

  return (
    <div className="min-h-screen bg-pale-slate-50">
      <NavBar searchDefaultValue={q} />

      <div className="max-w-5xl mx-auto px-4 py-8 flex gap-6">
        {/* Genre filter sidebar */}
        <aside className="w-52 shrink-0">
          <div className="bg-white rounded-xl border border-pale-slate-200 p-4">
            <h2 className="text-xs font-semibold text-pale-slate-600 uppercase tracking-wide mb-3">
              Genre
            </h2>
            <ul className="space-y-1">
              <li>
                <a
                  href={q ? `/search?q=${encodeURIComponent(q)}` : '/search'}
                  className={`block text-sm px-2 py-1 rounded-lg transition-colors ${
                    !genre
                      ? 'bg-ruby-red-50 text-ruby-red-700 font-medium'
                      : 'text-pale-slate-600 hover:bg-pale-slate-50'
                  }`}
                >
                  All genres
                </a>
              </li>
              {GENRES.map((g) => (
                <li key={g}>
                  <a
                    href={`/search?q=${encodeURIComponent(q)}&genre=${encodeURIComponent(g)}`}
                    className={`block text-sm px-2 py-1 rounded-lg transition-colors ${
                      genre === g
                        ? 'bg-ruby-red-50 text-ruby-red-700 font-medium'
                        : 'text-pale-slate-600 hover:bg-pale-slate-50'
                    }`}
                  >
                    {g}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          {!hasQuery && (
            <div className="text-center py-20 bg-white rounded-xl border border-pale-slate-200">
              <p className="text-pale-slate-500 text-lg font-medium">Search for pieces</p>
              <p className="text-pale-slate-400 text-sm mt-1">
                Find by title, author, keyword, genre, or idea
              </p>
            </div>
          )}

          {hasQuery && results.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-pale-slate-200">
              <p className="text-pale-slate-500 text-lg font-medium">No results found</p>
              <p className="text-pale-slate-400 text-sm mt-1">
                Try different keywords or remove the genre filter
              </p>
            </div>
          )}

          {hasQuery && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-pale-slate-500">
                {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                <span className="font-medium text-pale-slate-700">&ldquo;{q}&rdquo;</span>
                {genre && (
                  <>
                    {' '}in <span className="font-medium text-pale-slate-700">{genre}</span>
                  </>
                )}
              </p>

              {results.map((r) => {
                const date = r.updated_at
                  ? new Date(r.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';

                return (
                  <a
                    key={r.id}
                    href={`/pieces/${r.id}`}
                    className="block bg-white rounded-xl border border-pale-slate-200 p-5 hover:border-air-force-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-pale-slate-900 truncate">
                          {r.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-pale-slate-500">
                          <span className="font-medium text-pale-slate-700">{r.author_name}</span>
                          {date && <span>· {date}</span>}
                        </div>
                      </div>
                      {r.genre && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-ruby-red-100 text-ruby-red-700 text-xs font-medium">
                          {r.genre}
                        </span>
                      )}
                    </div>

                    {r.excerpt && (
                      <p className="mt-3 text-sm text-pale-slate-600 line-clamp-2 leading-relaxed">
                        {r.excerpt}
                      </p>
                    )}

                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {r.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-sky-blue-100 text-sky-blue-700 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
