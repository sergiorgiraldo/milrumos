import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NavBar from '@/components/NavBar';
import PieceCard from '@/components/PieceCard';
import { GENRES } from '@/lib/schema';
import { getServerT } from '@/lib/i18n';
import {
  listExplorePieces,
  parseExploreSort,
  parseExplorePage,
  buildExploreHref,
  EXPLORE_PAGE_SIZE,
  EXPLORE_SORTS,
  type ExploreSort,
} from '@/lib/explore';

type Props = { searchParams: Promise<{ genre?: string; sort?: string; page?: string }> };

function pillClass(active: boolean): string {
  return `px-3 py-1 rounded-full text-sm font-medium transition-colors ${
    active
      ? 'bg-ruby-red-50 text-ruby-red-700'
      : 'bg-white border border-pale-slate-200 text-pale-slate-600 hover:bg-pale-slate-50'
  }`;
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const genre = params.genre ?? null;
  const sort = parseExploreSort(params.sort);
  const page = parseExplorePage(params.page);

  const [supabase, { t }] = await Promise.all([
    createClient(),
    getServerT(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const result = await listExplorePieces(supabase, { genre, sort, page });
  const pieces = result.data ?? [];
  const hasMore = pieces.length === EXPLORE_PAGE_SIZE;

  const SORT_LABELS: Record<ExploreSort, string> = {
    newest: t('explore.newest'),
    most_forked: t('explore.mostForked'),
  };

  return (
    <div className="min-h-screen bg-pale-slate-50">
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-pale-slate-900">{t('explore.title')}</h1>
          <p className="text-sm text-pale-slate-500 mt-1">
            {t('explore.subtitle')}
          </p>
        </header>

        {/* Genre filter pills */}
        <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Filter by genre">
          <a href={buildExploreHref({ sort })} className={pillClass(!genre)}>
            {t('explore.allGenres')}
          </a>
          {GENRES.map((g) => (
            <a key={g} href={buildExploreHref({ genre: g, sort })} className={pillClass(genre === g)}>
              {g}
            </a>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className="text-pale-slate-500">{t('explore.sortBy')}</span>
          {EXPLORE_SORTS.map((s) => (
            <a
              key={s}
              href={buildExploreHref({ genre, sort: s })}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                sort === s
                  ? 'bg-air-force-blue-100 text-air-force-blue-700'
                  : 'text-pale-slate-500 hover:bg-pale-slate-100'
              }`}
            >
              {SORT_LABELS[s]}
            </a>
          ))}
        </div>

        {pieces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-pale-slate-200">
            <p className="text-pale-slate-500 text-lg font-medium">{t('explore.noPublished')}</p>
            <p className="text-pale-slate-400 text-sm mt-1">
              {t('explore.noPublishedSubtext')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pieces.map((p) => (
              <PieceCard key={p.id} piece={p} />
            ))}
          </div>
        )}

        {(page > 1 || hasMore) && (
          <div className="flex items-center justify-between mt-8">
            {page > 1 ? (
              <a
                href={buildExploreHref({ genre, sort, page: page - 1 })}
                className="px-4 py-1.5 rounded-lg bg-white border border-pale-slate-200 text-sm font-medium text-pale-slate-600 hover:bg-pale-slate-100"
              >
                {t('explore.previous')}
              </a>
            ) : (
              <span />
            )}
            {hasMore && (
              <a
                href={buildExploreHref({ genre, sort, page: page + 1 })}
                className="px-4 py-1.5 rounded-lg bg-white border border-pale-slate-200 text-sm font-medium text-pale-slate-600 hover:bg-pale-slate-100"
              >
                {t('explore.next')}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
