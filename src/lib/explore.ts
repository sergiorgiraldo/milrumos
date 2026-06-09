import type { SupabaseClient } from '@supabase/supabase-js';
import type { PieceError } from './pieces';

export const EXPLORE_SORTS = ['newest', 'most_forked'] as const;
export type ExploreSort = (typeof EXPLORE_SORTS)[number];

export const EXPLORE_PAGE_SIZE = 20;

export type ExplorePiece = {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  genre: string | null;
  tags: string[];
  idea_summary: string | null;
  excerpt: string;
  updated_at: string;
  fork_count: number;
};

export type ExploreResultSet = { data: ExplorePiece[]; error: null } | { data: null; error: PieceError };

export function parseExploreSort(raw: string | undefined | null): ExploreSort {
  return raw === 'most_forked' ? 'most_forked' : 'newest';
}

export function parseExplorePage(raw: string | undefined | null): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 1 ? Math.floor(n) : 1;
}

export async function listExplorePieces(
  supabase: SupabaseClient,
  opts: { genre?: string | null; sort?: ExploreSort; page?: number } = {}
): Promise<ExploreResultSet> {
  const sort = opts.sort ?? 'newest';
  const page = opts.page && opts.page > 0 ? opts.page : 1;
  const offset = (page - 1) * EXPLORE_PAGE_SIZE;

  const { data, error } = await supabase.rpc('explore_pieces', {
    genre_filter: opts.genre ?? null,
    sort_by: sort,
    page_limit: EXPLORE_PAGE_SIZE,
    page_offset: offset,
  });

  if (error) {
    return { data: null, error: { code: 'DB_ERROR', message: error.message } };
  }

  return { data: (data ?? []) as ExplorePiece[], error: null };
}

export function buildExploreHref(params: { genre?: string | null; sort?: ExploreSort; page?: number }): string {
  const search = new URLSearchParams();
  if (params.genre) search.set('genre', params.genre);
  if (params.sort && params.sort !== 'newest') search.set('sort', params.sort);
  if (params.page && params.page > 1) search.set('page', String(params.page));
  const qs = search.toString();
  return qs ? `/explore?${qs}` : '/explore';
}
