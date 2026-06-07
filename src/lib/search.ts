import type { SupabaseClient } from '@supabase/supabase-js';
import type { PieceError } from './pieces';

export type SearchResult = {
  id: string;
  title: string;
  author_id: string;
  genre: string | null;
  tags: string[];
  idea_summary: string | null;
  updated_at: string;
  excerpt: string;
  author_name: string;
  rank: number;
};

export type SearchResultSet = { data: SearchResult[]; error: null } | { data: null; error: PieceError };

export async function searchPieces(
  supabase: SupabaseClient,
  query: string,
  genreFilter?: string | null
): Promise<SearchResultSet> {
  if (!query.trim()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase.rpc('search_pieces', {
    search_query: query.trim(),
    genre_filter: genreFilter ?? null,
  });

  if (error) {
    return { data: null, error: { code: 'DB_ERROR', message: error.message } };
  }

  return { data: (data ?? []) as SearchResult[], error: null };
}

export function parseTagInput(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}
